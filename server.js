const express = require('express');
const mysql = require('mysql2');

const app = express();

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'condominio'
});
const db = connection.promise(); // mesma conexão, com async/await

app.use(express.json());

// Não expõe arquivos internos do projeto
app.use(function (req, res, next) {
    if (/^\/(server\.js|package(-lock)?\.json|node_modules|\.git)/i.test(req.path)) return res.status(404).end();
    next();
});
app.use(express.static(__dirname)); // serve os HTML, CSS e JS da raiz do projeto

app.listen(8083, function () {
    console.log("Servidor rodando na url http://localhost:8083");
});

function erroBanco(res, err) {
    console.error("Erro no banco de dados", err);
    res.status(500).json({ erro: "Erro no banco de dados" });
}

// ---------- API de Blocos ----------

// Listar / pesquisar
app.get("/api/blocos", function (req, res) {
    const busca = req.query.busca || '';
    connection.query("SELECT * FROM bloco WHERE descricao LIKE ? ORDER BY descricao",
        ['%' + busca + '%'], function (err, rows) {
            if (err) return erroBanco(res, err);
            res.json(rows);
        });
});

// Buscar um (alterar / consultar)
app.get("/api/blocos/:id", function (req, res) {
    connection.query("SELECT * FROM bloco WHERE id = ?", [req.params.id], function (err, rows) {
        if (err) return erroBanco(res, err);
        if (rows.length === 0) return res.status(404).json({ erro: "Bloco não encontrado" });
        res.json(rows[0]);
    });
});

// Validação e gravação usadas por POST (id = null) e PUT (id informado)
function salvarBloco(req, res, id) {
    const descricao = (req.body.descricao || '').trim();
    const quantidade = req.body.quantidade_aptos;

    if (!descricao || !quantidade) {
        return res.status(400).json({ erro: "Não pode ficar em branco" });
    }

    connection.query("SELECT id FROM bloco WHERE descricao = ? AND id <> ?", [descricao, id || 0], function (err, dup) {
        if (err) return erroBanco(res, err);
        if (dup.length > 0) {
            return res.status(409).json({ erro: "O bloco já está cadastrado no sistema" });
        }

        const sql = id
            ? "UPDATE bloco SET descricao = ?, quantidade_aptos = ? WHERE id = ?"
            : "INSERT INTO bloco (descricao, quantidade_aptos) VALUES (?, ?)";
        const valores = id ? [descricao, quantidade, id] : [descricao, quantidade];

        connection.query(sql, valores, function (err) {
            if (err) return erroBanco(res, err);
            res.json({ mensagem: "Dados salvos com sucesso" });
        });
    });
}

app.post("/api/blocos", function (req, res) { salvarBloco(req, res, null); });
app.put("/api/blocos/:id", function (req, res) { salvarBloco(req, res, req.params.id); });

app.delete("/api/blocos/:id", function (req, res) {
    connection.query("DELETE FROM bloco WHERE id = ?", [req.params.id], function (err) {
        if (err && err.errno === 1451) { // bloco tem apartamentos ligados a ele
            return res.status(409).json({ erro: "Não é possível excluir: o bloco possui apartamentos" });
        }
        if (err) return erroBanco(res, err);
        res.json({ mensagem: "Bloco excluído com sucesso" });
    });
});

// ---------- API de Apartamentos ----------

const SQL_APTO = `SELECT a.id, a.numero, a.bloco_id, b.descricao AS bloco
                  FROM apartamento a JOIN bloco b ON b.id = a.bloco_id`;

// Listar / pesquisar (por bloco ou número)
app.get("/api/apartamentos", function (req, res) {
    const busca = '%' + (req.query.busca || '') + '%';
    connection.query(
        SQL_APTO + " WHERE b.descricao LIKE ? OR CAST(a.numero AS CHAR) LIKE ? ORDER BY b.descricao, a.numero",
        [busca, busca], function (err, rows) {
            if (err) return erroBanco(res, err);
            res.json(rows);
        });
});

// Buscar um (alterar / consultar)
app.get("/api/apartamentos/:id", function (req, res) {
    connection.query(SQL_APTO + " WHERE a.id = ?", [req.params.id], function (err, rows) {
        if (err) return erroBanco(res, err);
        if (rows.length === 0) return res.status(404).json({ erro: "Apartamento não encontrado" });
        res.json(rows[0]);
    });
});

function salvarApartamento(req, res, id) {
    const bloco_id = req.body.bloco_id;
    const numero = req.body.numero;

    if (!bloco_id || !numero) {
        return res.status(400).json({ erro: "Não pode ficar em branco" });
    }

    connection.query("SELECT id FROM apartamento WHERE bloco_id = ? AND numero = ? AND id <> ?",
        [bloco_id, numero, id || 0], function (err, dup) {
            if (err) return erroBanco(res, err);
            if (dup.length > 0) {
                return res.status(409).json({ erro: "O apartamento já está cadastrado neste bloco" });
            }

            const sql = id
                ? "UPDATE apartamento SET bloco_id = ?, numero = ? WHERE id = ?"
                : "INSERT INTO apartamento (bloco_id, numero) VALUES (?, ?)";
            const valores = id ? [bloco_id, numero, id] : [bloco_id, numero];

            connection.query(sql, valores, function (err) {
                if (err) return erroBanco(res, err);
                res.json({ mensagem: "Dados salvos com sucesso" });
            });
        });
}

app.post("/api/apartamentos", function (req, res) { salvarApartamento(req, res, null); });
app.put("/api/apartamentos/:id", function (req, res) { salvarApartamento(req, res, req.params.id); });

app.delete("/api/apartamentos/:id", function (req, res) {
    connection.query("DELETE FROM apartamento WHERE id = ?", [req.params.id], function (err) {
        if (err && err.errno === 1451) { // tem moradores, vagas ou pagamentos ligados
            return res.status(409).json({ erro: "Não é possível excluir: o apartamento possui moradores, vagas ou pagamentos" });
        }
        if (err) return erroBanco(res, err);
        res.json({ mensagem: "Apartamento excluído com sucesso" });
    });
});

// ---------- API de Tipos de manutenção (HU008) ----------

app.get("/api/tipos-manutencao", function (req, res) {
    connection.query("SELECT * FROM tipo_manutencao ORDER BY descricao", function (err, rows) {
        if (err) return erroBanco(res, err);
        res.json(rows);
    });
});

app.post("/api/tipos-manutencao", function (req, res) {
    const descricao = (req.body.descricao || '').trim();
    if (!descricao) return res.status(400).json({ erro: "Não pode ficar em branco" });

    connection.query("SELECT id FROM tipo_manutencao WHERE descricao = ?", [descricao], function (err, dup) {
        if (err) return erroBanco(res, err);
        if (dup.length > 0) return res.status(409).json({ erro: "Tipo de manutenção já cadastrada" });

        connection.query("INSERT INTO tipo_manutencao (descricao) VALUES (?)", [descricao], function (err) {
            if (err) return erroBanco(res, err);
            res.json({ mensagem: "Dados salvos com sucesso" });
        });
    });
});

// ---------- API de Manutenções (HU009) ----------

app.post("/api/manutencoes", function (req, res) {
    const { tipo_id, data_manutencao } = req.body;
    const local = (req.body.local || '').trim();
    if (!tipo_id || !data_manutencao || !local) {
        return res.status(400).json({ erro: "Dados obrigatórios não informados" });
    }
    connection.query("INSERT INTO manutencao (tipo_id, data_manutencao, local) VALUES (?, ?, ?)",
        [tipo_id, data_manutencao, local], function (err) {
            if (err) return erroBanco(res, err);
            res.json({ mensagem: "Dados salvos com sucesso" });
        });
});

// ---------- API de Moradores (HU005 / HU006) ----------

app.get("/api/moradores", async function (req, res) {
    try {
        const b = '%' + (req.query.busca || '') + '%';
        const [rows] = await db.query(
            `SELECT m.id, m.cpf, m.nome, a.numero AS apartamento, bl.descricao AS bloco
             FROM morador m
             JOIN apartamento a ON a.id = m.apartamento_id
             JOIN bloco bl ON bl.id = a.bloco_id
             WHERE m.nome LIKE ? OR m.cpf LIKE ? ORDER BY m.nome`, [b, b]);
        res.json(rows);
    } catch (e) { erroBanco(res, e); }
});

// Morador + vagas do apartamento + veículo (se houver)
app.get("/api/moradores/:id", async function (req, res) {
    try {
        const [m] = await db.query("SELECT * FROM morador WHERE id = ?", [req.params.id]);
        if (m.length === 0) return res.status(404).json({ erro: "Morador não encontrado" });
        const [vagas] = await db.query("SELECT cod_vaga FROM vaga_garagem WHERE apartamento_id = ? ORDER BY cod_vaga", [m[0].apartamento_id]);
        const [veic] = await db.query("SELECT placa, marca, modelo FROM veiculo WHERE morador_id = ? LIMIT 1", [req.params.id]);
        res.json({ ...m[0], vagas: vagas.map(v => v.cod_vaga), veiculo: veic[0] || null });
    } catch (e) { erroBanco(res, e); }
});

async function salvarMorador(req, res, id) {
    const b = req.body;
    const cpf = (b.cpf || '').trim();
    const nome = (b.nome || '').trim();
    const vagas = (b.vagas || []).map(Number).filter(Boolean);
    const v = b.veiculo;

    if (!cpf || !nome || !b.apartamento_id) return res.status(400).json({ erro: "Não pode ficar em branco" });
    if (v && !(v.placa || '').trim()) return res.status(400).json({ erro: "Informe a placa do veículo" });

    try {
        const [dup] = await db.query("SELECT id FROM morador WHERE cpf = ? AND id <> ?", [cpf, id || 0]);
        if (dup.length > 0) return res.status(409).json({ erro: "CPF já cadastrado no sistema" });

        for (const cod of vagas) { // a vaga não pode pertencer a outro apartamento
            const [ocup] = await db.query("SELECT id FROM vaga_garagem WHERE cod_vaga = ? AND apartamento_id <> ?", [cod, b.apartamento_id]);
            if (ocup.length > 0) return res.status(409).json({ erro: "A vaga " + cod + " já pertence a outro apartamento" });
        }

        await db.beginTransaction();
        const campos = [cpf, nome, b.telefone || null, b.responsavel ? 1 : 0, b.proprietario ? 1 : 0, b.apartamento_id];
        let moradorId = id;
        if (id) {
            await db.query("UPDATE morador SET cpf=?, nome=?, telefone=?, responsavel=?, proprietario=?, apartamento_id=? WHERE id=?", [...campos, id]);
        } else {
            const [r] = await db.query("INSERT INTO morador (cpf, nome, telefone, responsavel, proprietario, apartamento_id) VALUES (?,?,?,?,?,?)", campos);
            moradorId = r.insertId;
        }

        await db.query("DELETE FROM vaga_garagem WHERE apartamento_id = ?", [b.apartamento_id]);
        for (const cod of vagas) {
            await db.query("INSERT INTO vaga_garagem (cod_vaga, apartamento_id) VALUES (?, ?)", [cod, b.apartamento_id]);
        }

        await db.query("DELETE FROM veiculo WHERE morador_id = ?", [moradorId]);
        if (v) {
            await db.query("INSERT INTO veiculo (placa, marca, modelo, morador_id) VALUES (?,?,?,?)",
                [v.placa.trim(), v.marca || null, v.modelo || null, moradorId]);
        }

        await db.commit();
        res.json({ mensagem: "Dados salvos com sucesso" });
    } catch (e) {
        await db.rollback();
        erroBanco(res, e);
    }
}

app.post("/api/moradores", function (req, res) { salvarMorador(req, res, null); });
app.put("/api/moradores/:id", function (req, res) { salvarMorador(req, res, req.params.id); });

app.delete("/api/moradores/:id", async function (req, res) {
    try {
        await db.beginTransaction();
        await db.query("DELETE FROM veiculo WHERE morador_id = ?", [req.params.id]);
        await db.query("DELETE FROM morador WHERE id = ?", [req.params.id]);
        await db.commit();
        res.json({ mensagem: "Morador excluído com sucesso" });
    } catch (e) {
        await db.rollback();
        if (e.errno === 1451) return res.status(409).json({ erro: "Não é possível excluir: o morador possui pagamentos" });
        erroBanco(res, e);
    }
});

// ---------- API de Pagamentos (HU007) ----------

// R1: os meses/anos de referência vêm da tabela "referencia"
app.get("/api/referencias", function (req, res) {
    connection.query(
        "SELECT id, mes, ano, valor, DATE_FORMAT(vencimento, '%Y-%m-%d') AS vencimento FROM referencia ORDER BY ano DESC, mes DESC",
        function (err, rows) {
            if (err) return erroBanco(res, err);
            res.json(rows);
        });
});

// Morador de um apartamento (prioriza o responsável)
app.get("/api/apartamentos/:id/morador", function (req, res) {
    connection.query(
        "SELECT id, cpf, nome, telefone FROM morador WHERE apartamento_id = ? ORDER BY responsavel DESC, id LIMIT 1",
        [req.params.id], function (err, rows) {
            if (err) return erroBanco(res, err);
            if (rows.length === 0) return res.status(404).json({ erro: "Nenhum morador cadastrado neste apartamento" });
            res.json(rows[0]);
        });
});

app.post("/api/pagamentos", function (req, res) {
    const { apartamento_id, referencia_id } = req.body;
    if (!apartamento_id || !referencia_id) {
        return res.status(400).json({ erro: "Dados obrigatórios não informados" });
    }

    connection.query("SELECT id FROM morador WHERE apartamento_id = ? ORDER BY responsavel DESC, id LIMIT 1",
        [apartamento_id], function (err, mor) {
            if (err) return erroBanco(res, err);
            if (mor.length === 0) return res.status(404).json({ erro: "Nenhum morador cadastrado neste apartamento" });

            connection.query("SELECT id FROM pagamento WHERE apartamento_id = ? AND referencia_id = ?",
                [apartamento_id, referencia_id], function (err, dup) {
                    if (err) return erroBanco(res, err);
                    if (dup.length > 0) return res.status(409).json({ erro: "Pagamento já registrado para este mês/ano" });

                    connection.query(
                        "INSERT INTO pagamento (apartamento_id, morador_id, referencia_id, data_pagamento) VALUES (?, ?, ?, CURDATE())",
                        [apartamento_id, mor[0].id, referencia_id], function (err) {
                            if (err) return erroBanco(res, err);
                            res.json({ mensagem: "Pagamento registrado com sucesso" });
                        });
                });
        });
});