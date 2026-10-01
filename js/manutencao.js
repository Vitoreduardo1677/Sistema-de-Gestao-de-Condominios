// HU009 - Registrar Manutenções
const form = document.getElementById('form');
const tipo = document.getElementById('tipo');
const data = document.getElementById('data');
const local = document.getElementById('local');

async function iniciar() {
    try {
        const tipos = await api('/api/tipos-manutencao');
        tipo.innerHTML = tipos.map(t => `<option value="${t.id}">${esc(t.descricao)}</option>`).join('');
        if (tipos.length === 0) mostrarMsg('Cadastre um tipo de manutenção antes de registrar uma manutenção', 'erro');
    } catch (e) {
        mostrarMsg(e.message, 'erro');
    }
}

form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!tipo.value || !data.value || !local.value.trim()) {
        return mostrarMsg('Dados obrigatórios não informados', 'erro');
    }
    try {
        await api('/api/manutencoes', 'POST', {
            tipo_id: tipo.value, data_manutencao: data.value, local: local.value.trim()
        });
        location = '/index.html?msg=' + encodeURIComponent('Dados salvos com sucesso');
    } catch (err) {
        mostrarMsg(err.message, 'erro');
    }
});

iniciar();