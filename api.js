// Funções compartilhadas por todas as telas

// Faz a chamada à API e devolve o JSON. Se der erro, lança a mensagem do servidor.
async function api(url, metodo = 'GET', dados) {
    const resp = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: dados ? JSON.stringify(dados) : undefined
    });
    const json = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(json.erro || 'Erro na requisição');
    return json;
}

// Mostra a mensagem no <p id="msg"> (tipo: "ok" ou "erro")
function mostrarMsg(texto, tipo) {
    const el = document.getElementById('msg');
    el.textContent = texto;
    el.className = 'msg ' + tipo;
    el.hidden = false;
}

// Evita que o texto digitado quebre o HTML da tabela
function esc(v) {
    return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}