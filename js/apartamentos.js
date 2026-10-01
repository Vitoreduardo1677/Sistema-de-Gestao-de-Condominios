// HU003 - Pesquisar Apartamento
const tabela = document.getElementById('tabela');
const campoBusca = document.getElementById('busca');

async function carregar() {
    try {
        const aptos = await api('/api/apartamentos?busca=' + encodeURIComponent(campoBusca.value));
        tabela.innerHTML = aptos.map(a => `
            <tr data-id="${a.id}">
                <td>${esc(a.bloco)}</td>
                <td>${a.numero}</td>
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
        if (!confirm('Deseja realmente excluir este apartamento?')) return;
        try {
            await api('/api/apartamentos/' + id, 'DELETE');
            mostrarMsg('Apartamento excluído com sucesso', 'ok');
            carregar();
        } catch (err) {
            mostrarMsg(err.message, 'erro');
        }
    } else if (acao === 'alterar') {
        window.location = '/apartamento-form.html?modo=alterar&id=' + id;
    } else {
        window.location = '/apartamento-form.html?modo=consultar&id=' + id;
    }
});

campoBusca.addEventListener('input', carregar);

const msg = new URLSearchParams(location.search).get('msg');
if (msg) mostrarMsg(msg, 'ok');

carregar();