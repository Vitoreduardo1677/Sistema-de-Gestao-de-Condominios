// HU004 - Manter Apartamento
const params = new URLSearchParams(location.search);
const modo = params.get('modo') || 'novo';
const id = params.get('id');

const form = document.getElementById('form');
const bloco = document.getElementById('bloco');
const numero = document.getElementById('numero');
const btnSalvar = document.getElementById('btnSalvar');

async function iniciar() {
    if (modo === 'alterar') btnSalvar.textContent = 'Salvar';

    try {
        // carrega o combo de blocos (diagrama de sequência: 1.1 ler Bloco)
        const blocos = await api('/api/blocos');
        bloco.innerHTML = blocos.map(b => `<option value="${b.id}">${esc(b.descricao)}</option>`).join('');

        if (modo !== 'novo') {
            const apto = await api('/api/apartamentos/' + id);
            bloco.value = apto.bloco_id;
            numero.value = apto.numero;
        }
    } catch (e) {
        mostrarMsg(e.message, 'erro');
        return;
    }

    if (modo === 'consultar') {
        bloco.disabled = true;
        numero.readOnly = true;
        btnSalvar.hidden = true;
    }
}

form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const dados = { bloco_id: bloco.value, numero: numero.value };

    try {
        if (modo === 'alterar') await api('/api/apartamentos/' + id, 'PUT', dados);
        else await api('/api/apartamentos', 'POST', dados);
        location = '/apartamentos.html?msg=' + encodeURIComponent('Dados salvos com sucesso');
    } catch (err) {
        mostrarMsg(err.message, 'erro');
    }
});

iniciar();