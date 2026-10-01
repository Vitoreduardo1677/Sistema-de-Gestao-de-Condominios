// HU006 - Manter Morador
// A tela recebe o modo pela URL: ?modo=novo | alterar | consultar  (&id=...)
const params = new URLSearchParams(location.search);
const modo = params.get('modo') || 'novo';
const id = params.get('id');

const $ = (x) => document.getElementById(x);
const form = $('form');
const btnSalvar = $('btnSalvar');

// Mostra/esconde os campos de vaga e de veículo conforme as respostas
function atualizarCampos() {
    const qtd = Number($('qtdVagas').value);
    $('boxVaga1').hidden = qtd < 1;
    $('boxVaga2').hidden = qtd < 2;
    $('boxVeiculo').hidden = $('possuiVeiculo').value !== '1';

    // só é obrigatório o que está visível na tela
    $('vaga1').required = qtd >= 1;
    $('vaga2').required = qtd >= 2;
    $('placa').required = $('possuiVeiculo').value === '1';
}
$('qtdVagas').addEventListener('change', atualizarCampos);
$('possuiVeiculo').addEventListener('change', atualizarCampos);

async function iniciar() {
    if (modo === 'alterar') btnSalvar.textContent = 'Salvar';

    try {
        const aptos = await api('/api/apartamentos');
        $('apartamento').innerHTML = aptos
            .map(a => `<option value="${a.id}">${esc(a.bloco)} - ${a.numero}</option>`).join('');

        if (modo !== 'novo') {
            const m = await api('/api/moradores/' + id);
            $('cpf').value = m.cpf;
            $('nome').value = m.nome;
            $('telefone').value = m.telefone || '';
            $('apartamento').value = m.apartamento_id;
            $('responsavel').value = m.responsavel ? '1' : '0';
            $('proprietario').value = m.proprietario ? '1' : '0';
            $('qtdVagas').value = m.vagas.length;
            $('vaga1').value = m.vagas[0] || '';
            $('vaga2').value = m.vagas[1] || '';
            if (m.veiculo) {
                $('possuiVeiculo').value = '1';
                $('placa').value = m.veiculo.placa;
                $('marca').value = m.veiculo.marca || '';
                $('modelo').value = m.veiculo.modelo || '';
            }
        }
    } catch (e) {
        mostrarMsg(e.message, 'erro');
        return;
    }

    atualizarCampos();

    if (modo === 'consultar') {
        form.querySelectorAll('input').forEach(i => i.readOnly = true);
        form.querySelectorAll('select').forEach(s => s.disabled = true);
        btnSalvar.hidden = true;
    }
}

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const qtd = Number($('qtdVagas').value);
    const vagas = [$('vaga1').value, $('vaga2').value].slice(0, qtd);
    if (vagas.some(v => !v)) return mostrarMsg('Informe o número de todas as vagas', 'erro');

    const dados = {
        cpf: $('cpf').value.trim(),
        nome: $('nome').value.trim(),
        telefone: $('telefone').value.trim(),
        apartamento_id: $('apartamento').value,
        responsavel: $('responsavel').value === '1',
        proprietario: $('proprietario').value === '1',
        vagas: vagas,
        veiculo: $('possuiVeiculo').value === '1'
            ? { placa: $('placa').value, marca: $('marca').value.trim(), modelo: $('modelo').value.trim() }
            : null
    };

    try {
        if (modo === 'alterar') await api('/api/moradores/' + id, 'PUT', dados);
        else await api('/api/moradores', 'POST', dados);
        location = '/moradores.html?msg=' + encodeURIComponent('Dados salvos com sucesso');
    } catch (err) {
        mostrarMsg(err.message, 'erro');
    }
});

iniciar();