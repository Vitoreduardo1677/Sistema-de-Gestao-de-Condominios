// HU007 - Registrar Pagamento
const $ = (x) => document.getElementById(x);
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
               'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
let referencias = [];

async function iniciar() {
    try {
        // combo de apartamentos
        const aptos = await api('/api/apartamentos');
        $('apartamento').innerHTML = '<option value="">Selecione...</option>' +
            aptos.map(a => `<option value="${a.id}">${esc(a.bloco)} - ${a.numero}</option>`).join('');

        // R1: combo Mês/Ano lido da tabela "referencia" antes de apresentar a tela
        referencias = await api('/api/referencias');
        $('referencia').innerHTML = referencias
            .map(r => `<option value="${r.id}">${MESES[r.mes - 1]}/${r.ano}</option>`).join('');
        if (referencias.length === 0) mostrarMsg('Nenhum mês/ano de referência cadastrado', 'erro');
        mostrarReferencia();
    } catch (e) {
        mostrarMsg(e.message, 'erro');
    }
}

// Preenche valor e vencimento do mês/ano selecionado
function mostrarReferencia() {
    const r = referencias.find(x => String(x.id) === $('referencia').value);
    $('valor').value = r ? Number(r.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '';
    $('vencimento').value = r ? r.vencimento.split('-').reverse().join('/') : '';
}

// Preenche CPF, nome e telefone do morador do apartamento escolhido
async function buscarMorador() {
    $('msg').hidden = true;
    ['cpf', 'morador', 'telefone'].forEach(c => $(c).value = '');
    if (!$('apartamento').value) return;
    try {
        const m = await api('/api/apartamentos/' + $('apartamento').value + '/morador');
        $('cpf').value = m.cpf;
        $('morador').value = m.nome;
        $('telefone').value = m.telefone || '';
    } catch (e) {
        mostrarMsg(e.message, 'erro');
    }
}

$('apartamento').addEventListener('change', buscarMorador);
$('referencia').addEventListener('change', mostrarReferencia);

$('form').addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!$('cpf').value) return mostrarMsg('Selecione um apartamento que possua morador cadastrado', 'erro');
    try {
        await api('/api/pagamentos', 'POST', {
            apartamento_id: $('apartamento').value,
            referencia_id: $('referencia').value
        });
        location = '/index.html?msg=' + encodeURIComponent('Pagamento registrado com sucesso');
    } catch (err) {
        mostrarMsg(err.message, 'erro');
    }
});

iniciar();