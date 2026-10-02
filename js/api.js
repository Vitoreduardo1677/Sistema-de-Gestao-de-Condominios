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

// ---------- Barra lateral de navegação (aparece em todas as telas) ----------
(function montarLayout() {
    const p = location.pathname;
    const chave = p.includes('tipo-manutencao') ? 'tipo'
        : ['bloco', 'apartamento', 'morador', 'pagamento', 'manutencao'].find(k => p.includes(k)) || 'inicio';

    const ico = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    const itens = [
        ['inicio', '/index.html', 'Início', ico('<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>')],
        ['bloco', '/blocos.html', 'Blocos', ico('<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7.5h2M13 7.5h2M9 11.5h2M13 11.5h2M10 21v-4h4v4"/>')],
        ['apartamento', '/apartamentos.html', 'Apartamentos', ico('<path d="M4 11l8-7 8 7"/><path d="M6 9.5V20h12V9.5M10 20v-5h4v5"/>')],
        ['morador', '/moradores.html', 'Moradores', ico('<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/>')],
        ['pagamento', '/pagamento.html', 'Pagamentos', ico('<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10.5h18M7 15h3"/>')],
        ['tipo', '/tipo-manutencao.html', 'Tipos de manutenção', ico('<path d="M4 4h8l8 8-8 8-8-8z"/><circle cx="8.5" cy="8.5" r="1"/>')],
        ['manutencao', '/manutencao.html', 'Manutenções', ico('<path d="M14.5 6.5a4 4 0 0 0 4.9 4.9L20 12l-8 8a2.1 2.1 0 0 1-3-3l8-8z"/><path d="M14.5 6.5l3-3 3 3-3 3"/>')]
    ];

    const links = itens.map((it, i) =>
        `<a href="${it[1]}" style="--i:${i}" class="${it[0] === chave ? 'ativo' : ''}">${it[3]}${it[2]}</a>`).join('');

    document.body.classList.add('com-lateral');
    document.body.insertAdjacentHTML('afterbegin',
        `<aside class="lateral">
            <a class="lateral-marca" href="/index.html"><i></i><span>Condomínio<small>Gestão do condomínio</small></span></a>
            <nav class="lateral-nav">${links}</nav>
            <div class="lateral-rodape">
                <button type="button" class="lateral-perfil" id="btnPerfil" aria-haspopup="true" aria-expanded="false" aria-controls="perfilMenu"><b>S</b><span>Síndico<small>Administrador</small></span></button>
                <div class="perfil-menu" id="perfilMenu" aria-label="Menu do perfil" hidden>
                    <p class="pm-nome">Síndico<small>Responsável pelo condomínio</small></p>
                    <p class="pm-tit">Aparência</p>
                    <div class="pm-seg" role="group" aria-label="Tema">
                        <button type="button" data-tema="auto">Auto</button>
                        <button type="button" data-tema="light">Claro</button>
                        <button type="button" data-tema="dark">Escuro</button>
                    </div>
                </div>
            </div>
        </aside>`);
})();

// ---------- Texto de apoio sob o título + indicadores da página inicial ----------
(function enriquecerPagina() {
    const leads = {
        '/index.html': 'Visão geral do condomínio e atalhos para as rotinas do dia a dia.',
        '/blocos.html': 'Consulte, pesquise e mantenha os blocos cadastrados.',
        '/bloco-form.html': 'Informe a descrição do bloco e a quantidade de apartamentos.',
        '/apartamentos.html': 'Todos os apartamentos do condomínio, organizados por bloco.',
        '/apartamento-form.html': 'Escolha o bloco e informe o número do apartamento.',
        '/moradores.html': 'Pesquise moradores por nome ou CPF e acompanhe seus dados.',
        '/morador-form.html': 'Dados do morador, vagas de garagem e veículo.',
        '/pagamento.html': 'Selecione o apartamento e o mês de referência para registrar o pagamento.',
        '/tipo-manutencao.html': 'Cadastre as categorias usadas para classificar as manutenções.',
        '/manutencao.html': 'Registre o serviço realizado, a data e o local.'
    };
    const caminho = location.pathname === '/' ? '/index.html' : location.pathname;
    const h2 = document.querySelector('h2');
    if (h2 && leads[caminho]) h2.insertAdjacentHTML('afterend', `<p class="lead">${leads[caminho]}</p>`);

    const menu = document.querySelector('.menu');
    if (!menu) return;

    menu.insertAdjacentHTML('beforebegin',
        `<section class="kpis">
            <div class="kpi"><span>Blocos</span><b>–</b><small>cadastrados</small></div>
            <div class="kpi"><span>Apartamentos</span><b>–</b><small>cadastrados</small></div>
            <div class="kpi"><span>Moradores</span><b>–</b><small>cadastrados</small></div>
        </section>`);

    // contagem animada de 0 até o valor real
    function contar(el, alvo) {
        const ini = performance.now();
        (function passo(t) {
            const k = Math.min((t - ini) / 900, 1);
            el.textContent = Math.round(alvo * (1 - Math.pow(1 - k, 3)));
            if (k < 1) requestAnimationFrame(passo);
        })(ini);
    }

    const numeros = document.querySelectorAll('.kpi b');
    ['/api/blocos', '/api/apartamentos', '/api/moradores'].forEach((rota, i) => {
        api(rota).then(lista => contar(numeros[i], lista.length)).catch(() => {});
    });
})();

// ---------- Menu do perfil: aparência (automático / claro / escuro) ----------
(function perfil() {
    const btn = document.getElementById('btnPerfil');
    const menu = document.getElementById('perfilMenu');
    if (!btn || !menu) return;
    const raiz = document.documentElement;
    let tema = 'auto';
    try { tema = localStorage.getItem('tema') || 'auto'; } catch (e) {}

    function aplicar(t) {
        if (t === 'light' || t === 'dark') raiz.dataset.tema = t; else delete raiz.dataset.tema;
        try { localStorage.setItem('tema', t); } catch (e) {}
        menu.querySelectorAll('[data-tema]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tema === t)));
    }
    function abrir(sim) {
        menu.hidden = !sim;
        btn.setAttribute('aria-expanded', String(sim));
    }

    aplicar(tema);
    btn.addEventListener('click', () => abrir(menu.hidden));
    menu.addEventListener('click', e => { const b = e.target.closest('[data-tema]'); if (b) aplicar(b.dataset.tema); });
    document.addEventListener('click', e => {
        if (!menu.hidden && !menu.contains(e.target) && !btn.contains(e.target)) abrir(false);
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !menu.hidden) { abrir(false); btn.focus(); }
    });
})();