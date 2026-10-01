// HU005 - Pesquisar Morador
const tabela = document.getElementById('tabela');
const campoBusca = document.getElementById('busca');

async function carregar() {
    try {
        const lista = await api('/api/moradores?busca=' + encodeURIComponent(campoBusca.value));
        tabela.innerHTML = lista.map(m => `
            <tr data-id="${m.id}">
                <td>${esc(m.cpf)}</td>
                <td>${esc(m.nome)}</td>
                <td>${m.apartamento}</td>
                <td>${esc(m.bloco)}</td>
                <td>
                    <div class="acoes">
                        <button class="btn btn-azul" data-acao="alterar">Alterar</button>
                        <button class="btn btn-vermelho" data-acao="excluir">Excluir</button>
                    </div>
                </td>
            </tr>`).join('');
    } catch (e) {
        mostrarMsg(e.message, 'erro');
    }
}

tabela.addEventListener('click', async function (e) {
    const linha = e.target.closest('tr');
    if (!linha) return;
    const id = linha.dataset.id;
    const acao = e.target.dataset.acao;

    if (acao === 'excluir') {
        if (!confirm('Deseja realmente excluir este morador?')) return;
        try {
            await api('/api/moradores/' + id, 'DELETE');
            mostrarMsg('Morador excluído com sucesso', 'ok');
            carregar();
        } catch (err) {
            mostrarMsg(err.message, 'erro');
        }
    } else if (acao === 'alterar') {
        window.location = '/morador-form.html?modo=alterar&id=' + id;
    } else {
        window.location = '/morador-form.html?modo=consultar&id=' + id;
    }
});

campoBusca.addEventListener('input', carregar);

const msg = new URLSearchParams(location.search).get('msg');
if (msg) mostrarMsg(msg, 'ok');

carregar();