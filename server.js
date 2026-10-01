const express = require('express');
const mysql = require('mysql2');

const app = express();

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'condominio'
});

app.use(express.json());
app.use(express.static(__dirname + '/public')); // serve os HTML, CSS e JS

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