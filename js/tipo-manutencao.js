// HU008 - Cadastrar Tipo de Manutenção
const form = document.getElementById('form');
const descricao = document.getElementById('descricao');
let tipos = [];

async function iniciar() {
    try {
        tipos = await api('/api/tipos-manutencao'); // carrega os tipos já cadastrados
    } catch (e) {
        mostrarMsg(e.message, 'erro');
    }
}

function duplicado() {
    const d = descricao.value.trim().toLowerCase();
    return d !== '' && tipos.some(t => t.descricao.toLowerCase() === d);
}

// Quando o foco sai do campo, verifica se o tipo já existe
descricao.addEventListener('blur', function () {
    if (duplicado()) mostrarMsg('Tipo de manutenção já cadastrada', 'erro');
});

form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (duplicado()) return mostrarMsg('Tipo de manutenção já cadastrada', 'erro');
    try {
        await api('/api/tipos-manutencao', 'POST', { descricao: descricao.value.trim() });
        location = '/index.html?msg=' + encodeURIComponent('Dados salvos com sucesso');
    } catch (err) {
        mostrarMsg(err.message, 'erro');
    }
});

iniciar();