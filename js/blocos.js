// HU001 - Pesquisar Bloco
const tabela = document.getElementById('tabela');
const campoBusca = document.getElementById('busca');

async function carregar() {
    try {
        const blocos = await api('/api/blocos?busca=' + encodeURIComponent(campoBusca.value));
        tabela.innerHTML = blocos.map(b => `
            <tr data-id="${b.id}">
                <td>${esc(b.descricao)}</td>
                <td>${b.quantidade_aptos}</td>
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

// Cliques na tabela: Alterar, Excluir ou (clicando na linha) Consultar
tabela.addEventListener('click', async function (e) {
    const linha = e.target.closest('tr');
    if (!linha) return;
    const id = linha.dataset.id;
    const acao = e.target.dataset.acao;

    if (acao === 'excluir') {
        if (!confirm('Deseja realmente excluir este bloco?')) return;
        try {
            await api('/api/blocos/' + id, 'DELETE');
            mostrarMsg('Bloco excluído com sucesso', 'ok');
            carregar(); // refaz a tabela lendo o banco de novo
        } catch (err) {
            mostrarMsg(err.message, 'erro');
        }
    } else if (acao === 'alterar') {
        window.location = '/bloco-form.html?modo=alterar&id=' + id;
    } else {
        window.location = '/bloco-form.html?modo=consultar&id=' + id;
    }
});

campoBusca.addEventListener('input', carregar);

// Mensagem vinda da tela de cadastro (ex.: "Dados salvos com sucesso")
const msg = new URLSearchParams(location.search).get('msg');
if (msg) mostrarMsg(msg, 'ok');

carregar();