// HU002 - Manter Bloco
// A tela recebe o modo pela URL: ?modo=novo | alterar | consultar  (&id=...)
const params = new URLSearchParams(location.search);
const modo = params.get('modo') || 'novo';
const id = params.get('id');

const form = document.getElementById('form');
const descricao = document.getElementById('descricao');
const quantidade = document.getElementById('quantidade');
const btnSalvar = document.getElementById('btnSalvar');

async function iniciar() {
    if (modo === 'alterar') btnSalvar.textContent = 'Salvar';

    if (modo !== 'novo') {
        try {
            const bloco = await api('/api/blocos/' + id);
            descricao.value = bloco.descricao;
            quantidade.value = bloco.quantidade_aptos;
        } catch (e) {
            mostrarMsg(e.message, 'erro');
            return;
        }
    }

    if (modo === 'consultar') {
        descricao.readOnly = true;
        quantidade.readOnly = true;
        btnSalvar.hidden = true;
    }
}

form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const dados = { descricao: descricao.value.trim(), quantidade_aptos: quantidade.value };

    try {
        if (modo === 'alterar') await api('/api/blocos/' + id, 'PUT', dados);
        else await api('/api/blocos', 'POST', dados);
        location = '/blocos.html?msg=' + encodeURIComponent('Dados salvos com sucesso');
    } catch (err) {
        mostrarMsg(err.message, 'erro'); // "Não pode ficar em branco" ou "O bloco já está cadastrado no sistema"
    }
});

iniciar();