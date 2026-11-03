/* =========================================================
   PLACAR. — Aplicação da agenda
   ========================================================= */
(() => {
  "use strict";

  /* ---------- Utilidades ---------- */
  const $ = (seletor, contexto = document) => contexto.querySelector(seletor);
  const $$ = (seletor, contexto = document) => Array.from(contexto.querySelectorAll(seletor));
  const pad2 = (numero) => String(numero).padStart(2, "0");
  const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);
  const semAnimacao = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function hexParaRgba(hex, alpha = 1) {
    const valor = hex.replace("#", "");
    const completo = valor.length === 3 ? valor.split("").map((c) => c + c).join("") : valor;
    const r = parseInt(completo.slice(0, 2), 16);
    const g = parseInt(completo.slice(2, 4), 16);
    const b = parseInt(completo.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const formatadorData = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const formatadorCurta = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "long"
  });

  const formatadorPartes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });

  function dataDaAgenda() {
    return new Date(`${AGENDA_DATA}T12:00:00-03:00`);
  }

  function dataAgendaLonga() {
    return capitalizar(formatadorData.format(dataDaAgenda()));
  }

  function agoraBrasilia() {
    const partes = {};
    for (const parte of formatadorPartes.formatToParts(new Date())) {
      partes[parte.type] = parte.value;
    }
    const horas = Number(partes.hour) % 24;
    const minutos = Number(partes.minute);
    const segundos = Number(partes.second);
    return {
      iso: `${partes.year}-${partes.month}-${partes.day}`,
      horas,
      minutos,
      segundosDoDia: horas * 3600 + minutos * 60 + segundos,
      relogio: `${pad2(horas)}:${pad2(minutos)}`
    };
  }

  function minutosDoHorario(hora) {
    const [h, m] = hora.split(":").map(Number);
    return h * 60 + m;
  }

  function formatarContagem(totalSegundos) {
    const restante = Math.max(0, totalSegundos);
    const horas = Math.floor(restante / 3600);
    const minutos = Math.floor((restante % 3600) / 60);
    const segundos = Math.floor(restante % 60);
    return `${pad2(horas)}:${pad2(minutos)}:${pad2(segundos)}`;
  }

  const svgRelogio = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.6"/><path d="M12 7.5V12l3 1.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
  const svgLocal = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" stroke-width="1.6"/></svg>`;
  const svgCalendario = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="3" stroke="currentColor" stroke-width="1.6"/><path d="M8 3v4M16 3v4M3.5 9.5h17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
  const svgSeta = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  /* ---------- Dados derivados ---------- */
  const jogosOrdenados = () => [...JOGOS].sort((a, b) => minutosDoHorario(a.hora) - minutosDoHorario(b.hora));
  const destaques = () => JOGOS.filter((jogo) => jogo.destaque > 0).sort((a, b) => a.destaque - b.destaque);

  function nomeCanal(id) {
    const canal = CANAIS[id];
    if (!canal) return id;
    return canal.nome + (canal.detalhe ? ` (${canal.detalhe})` : "");
  }

  function localDoJogo(jogo) {
    return jogo.estadio ? `${jogo.estadio} · ${jogo.cidade}` : jogo.cidade;
  }

  function statusDoJogo(jogo) {
    const agora = agoraBrasilia();
    if (agora.iso !== AGENDA_DATA) {
      return { chave: "proximo", rotulo: "Programado", classe: "status--agenda" };
    }
    const inicio = minutosDoHorario(jogo.hora);
    if (agora.minutos < inicio) {
      return { chave: "proximo", rotulo: "Próximo", classe: "status--proximo" };
    }
    if (agora.minutos < inicio + 120) {
      return { chave: "aovivo", rotulo: "Ao vivo", classe: "status--live" };
    }
    return { chave: "encerrado", rotulo: "Encerrado", classe: "status--done" };
  }

  /* ---------- Escudos e canais ---------- */
  let escudoSequencia = 0;

  function escudo(time, classeExtra = "") {
    if (!time) return "";
    const id = `escudo-clip-${++escudoSequencia}`;
    return `
      <span class="escudo ${classeExtra}" aria-hidden="true">
        <svg viewBox="0 0 64 72" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="${id}">
              <path d="M32 2 59 9.5v27.8c0 15.4-11.3 25-27 31.2C16.3 62.3 5 52.7 5 37.3V9.5L32 2Z"/>
            </clipPath>
          </defs>
          <path d="M32 2 59 9.5v27.8c0 15.4-11.3 25-27 31.2C16.3 62.3 5 52.7 5 37.3V9.5L32 2Z" fill="${time.cor}"/>
          <g clip-path="url(#${id})">
            <path d="M-14 56 78 6v12L-14 68z" fill="${time.cor2}" opacity=".3"/>
            <path d="M-14 66 78 16v4L-14 72z" fill="${time.cor2}" opacity=".22"/>
            <path d="M-4 12h72v3H-4z" fill="${time.cor2}" opacity=".2"/>
          </g>
          <path d="M32 2 59 9.5v27.8c0 15.4-11.3 25-27 31.2C16.3 62.3 5 52.7 5 37.3V9.5L32 2Z" stroke="${time.cor2}" stroke-width="2.4" stroke-opacity=".9"/>
          <text x="32" y="39" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="800" letter-spacing=".6" fill="${time.texto}">${time.sigla}</text>
        </svg>
      </span>`;
  }

  function chipCanal(id, classeExtra = "") {
    const canal = CANAIS[id];
    if (!canal) return "";
    return `<button type="button" class="chip-canal ${classeExtra}" data-canal="${id}" style="--ch:${canal.cor};--ch-soft:${hexParaRgba(canal.cor, 0.13)}" title="Ver jogos na ${nomeCanal(id)}">
      <span class="chip-dot" aria-hidden="true"></span>
      <span>${canal.nome}</span>
      ${canal.detalhe ? `<span class="chip-detail">${canal.detalhe}</span>` : ""}
    </button>`;
  }

  /* ---------- Elementos ---------- */
  const elementos = {
    heroShell: $("#hero-shell"),
    heroSlides: $("#hero-slides"),
    heroCounter: $("#hero-counter"),
    heroProgress: $("#hero-progress-bar"),
    heroPrev: $("#hero-prev"),
    heroNext: $("#hero-next"),
    lista: $("#lista-jogos"),
    vazio: $("#vazio"),
    resultado: $("#resultado-info"),
    tabs: $(".tabs"),
    filtroCompeticao: $("#filtro-competicao"),
    filtroCanal: $("#filtro-canal"),
    filtroBrasil: $("#filtro-brasil"),
    limparFiltros: $("#limpar-filtros"),
    listaCanais: $("#lista-canais"),
    canaisTotal: $("#canais-total"),
    relogio: $("#relogio"),
    dataTopo: $("#data-topo"),
    totalJogos: $("#total-jogos"),
    totalBrasil: $("#total-brasil"),
    nextPill: $("#next-pill"),
    nextLabel: $("#next-label"),
    nextMatch: $("#next-match"),
    nextCountdown: $("#next-countdown"),
    toast: $("#toast"),
    toastText: $("#toast-text"),
    menuToggle: $("#menu-toggle"),
    menu: $("#menu-principal")
  };

  /* ---------- Estado ---------- */
  const estado = {
    aba: "todos",
    competicao: "todas",
    canal: "todos",
    brasil: false
  };

  let indiceHero = 0;
  let timerHero = null;
  let timerToast = null;
  let statusAnterior = "";

  /* ---------- Cabeçalho ---------- */
  function renderizarCabecalho() {
    elementos.dataTopo.textContent = dataAgendaLonga();
    elementos.totalJogos.textContent = JOGOS.length;
    elementos.totalBrasil.textContent = JOGOS.filter((jogo) => !jogo.internacional).length;

    const statusTopo = $("#topline-status");
    if (statusTopo) {
      const hoje = agoraBrasilia().iso === AGENDA_DATA;
      statusTopo.innerHTML = `<span class="live-dot" aria-hidden="true"></span> ${hoje ? "Agenda de hoje" : `Agenda de ${formatadorCurta.format(dataDaAgenda())}`}`;
    }
  }

  function atualizarRelogio() {
    elementos.relogio.textContent = agoraBrasilia().relogio;
  }

  /* ---------- Banner principal ---------- */
  function renderizarHero() {
    let lista = destaques();
    if (!lista.length) lista = jogosOrdenados().slice(0, 3);
    if (!lista.length) return;

    elementos.heroSlides.innerHTML = lista.map((jogo, indice) => {
      const casa = TIMES[jogo.casa];
      const fora = TIMES[jogo.fora];
      const status = statusDoJogo(jogo);
      const hoje = agoraBrasilia().iso === AGENDA_DATA;
      const rotuloStatus = status.chave === "aovivo"
        ? `<i class="live-dot" aria-hidden="true"></i> Ao vivo`
        : status.chave === "encerrado"
          ? "Encerrado"
          : hoje ? "Hoje" : "Agenda";

      return `
        <article class="hero-slide ${indice === 0 ? "is-active" : ""}" data-slide="${indice}" aria-hidden="${indice !== 0}" style="--a-glow:${hexParaRgba(casa.cor, 0.55)};--b-glow:${hexParaRgba(fora.cor, 0.5)}">
          <svg class="hero-pitch" viewBox="0 0 900 560" preserveAspectRatio="none" aria-hidden="true">
            <g stroke="currentColor" stroke-width="1.2" fill="none">
              <rect x="30" y="30" width="840" height="500"/>
              <path d="M450 30v500"/>
              <circle cx="450" cy="280" r="84"/>
              <circle cx="450" cy="280" r="3"/>
              <path d="M30 190h96v180H30M870 190h-96v180h96"/>
              <path d="M126 230v100M774 230v100"/>
            </g>
          </svg>
          <span class="hero-watermark hero-watermark--a" aria-hidden="true">${casa.sigla}</span>
          <span class="hero-watermark hero-watermark--b" aria-hidden="true">${fora.sigla}</span>

          <div class="hero-content">
            <div class="hero-kicker">
              <span class="tag-destaque">${jogo.selo || "Destaque"}</span>
              ${status.chave === "aovivo" ? `<span class="hero-live-pill"><i class="live-dot" aria-hidden="true"></i> Ao vivo</span>` : ""}
              <span class="hero-comp">${jogo.competicao}${jogo.fase ? ` <span class="hero-comp-sep">·</span> ${jogo.fase}` : ""}</span>
            </div>
            <h2 class="hero-title">${casa.nome} <span class="hero-x">×</span> ${fora.nome}</h2>
            <p class="hero-contexto">${jogo.contexto || "Um dos grandes jogos desta terça-feira. Confira o horário e onde assistir."}</p>
            <div class="hero-meta">
              <span class="hero-meta-item">${svgRelogio}<strong>${jogo.hora}</strong> <span>Horário de Brasília</span></span>
              <span class="hero-meta-item">${svgLocal}<span>${localDoJogo(jogo)}</span></span>
            </div>
            <div class="hero-broadcast">
              <span class="hero-broadcast-label">Onde assistir</span>
              ${jogo.canais.map((id) => chipCanal(id)).join("")}
            </div>
            <div class="hero-actions">
              <a class="btn btn-primary" href="#agenda" data-focus="${jogo.id}">Ver na agenda ${svgSeta}</a>
              <button type="button" class="btn btn-ghost" data-calendar="${jogo.id}">${svgCalendario} Salvar no calendário</button>
            </div>
          </div>

          <div class="hero-visual" aria-hidden="true">
            <span class="hero-ring"></span>
            <div class="hero-team hero-team--a">
              ${escudo(casa, "escudo--xl")}
              <span class="hero-team-label">${casa.nome}</span>
            </div>
            <span class="hero-vs">×</span>
            <div class="hero-team hero-team--b">
              ${escudo(fora, "escudo--xl")}
              <span class="hero-team-label">${fora.nome}</span>
            </div>
            <div class="hero-timecard">
              <span data-hero-status="${jogo.id}">${rotuloStatus}</span>
              <strong>${jogo.hora}</strong>
              <small>Horário de Brasília</small>
            </div>
          </div>
        </article>`;
    }).join("");

    indiceHero = 0;
    atualizarContadorHero();
    reiniciarTimerHero();
  }

  function atualizarContadorHero() {
    const total = Math.max(1, destaques().length || elementos.heroSlides.children.length);
    elementos.heroCounter.innerHTML = `<strong>${pad2(indiceHero + 1)}</strong> / ${pad2(total)}`;
  }

  function mostrarHero(indice) {
    const slides = $$(".hero-slide", elementos.heroSlides);
    if (!slides.length) return;
    indiceHero = (indice + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === indiceHero);
      slide.setAttribute("aria-hidden", String(i !== indiceHero));
    });
    atualizarContadorHero();
    reiniciarTimerHero();
  }

  function reiniciarTimerHero() {
    clearTimeout(timerHero);
    const barra = elementos.heroProgress;
    if (barra) {
      barra.classList.remove("animating", "paused");
      void barra.offsetWidth;
      if (!semAnimacao) barra.classList.add("animating");
    }
    if (semAnimacao) return;
    timerHero = window.setTimeout(() => mostrarHero(indiceHero + 1), 7000);
  }

  function pausarHero() {
    clearTimeout(timerHero);
    if (elementos.heroProgress) elementos.heroProgress.classList.add("paused");
  }

  function retomarHero() {
    reiniciarTimerHero();
  }

  /* ---------- Cards da agenda ---------- */
  function linhaEquipe(time, lado) {
    return `<div class="team-row">
      ${escudo(time)}
      <span class="team-name">${time.nome}</span>
      <span class="team-side">${lado}</span>
    </div>`;
  }

  function renderizarCard(jogo) {
    const casa = TIMES[jogo.casa];
    const fora = TIMES[jogo.fora];
    const status = statusDoJogo(jogo);
    const corCompeticao = CORES_COMPETICAO[jogo.competicao] || "#c6ff45";
    const aoVivo = status.chave === "aovivo";

    return `<article class="match-card ${aoVivo ? "is-live" : ""}" id="jogo-${jogo.id}" data-id="${jogo.id}" style="--time-a:${casa.cor};--time-b:${fora.cor};--time-a-soft:${hexParaRgba(casa.cor, 0.22)};--comp:${corCompeticao}">
      <div class="match-head">
        <div class="comp-wrap">
          <span class="comp-tag"><i class="comp-dot" aria-hidden="true"></i>${jogo.competicao}</span>
          ${jogo.fase ? `<span class="comp-fase">${jogo.fase}</span>` : ""}
        </div>
        <div class="match-clock">
          <span class="match-time">${jogo.hora}</span>
          <span class="status ${status.classe}" data-status-id="${jogo.id}">${status.rotulo}</span>
        </div>
      </div>

      <div class="match-teams">
        ${linhaEquipe(casa, "Casa")}
        ${linhaEquipe(fora, "Fora")}
      </div>

      <div class="match-meta">
        ${svgLocal}
        <span>${localDoJogo(jogo)}</span>
      </div>

      <div class="match-footer">
        <div class="channels">
          <span class="channels-label">Onde assistir</span>
          ${jogo.canais.map((id) => chipCanal(id)).join("")}
        </div>
        <button type="button" class="icon-btn" data-calendar="${jogo.id}" aria-label="Salvar ${casa.nome} x ${fora.nome} no calendário" title="Salvar no calendário">
          ${svgCalendario}
        </button>
      </div>
    </article>`;
  }

  function filtrarJogos() {
    return jogosOrdenados().filter((jogo) => {
      if (estado.aba !== "todos" && statusDoJogo(jogo).chave !== estado.aba) return false;
      if (estado.competicao !== "todas" && jogo.competicao !== estado.competicao) return false;
      if (estado.canal !== "todos" && !jogo.canais.includes(estado.canal)) return false;
      if (estado.brasil && jogo.internacional) return false;
      return true;
    });
  }

  function renderizarLista() {
    const lista = filtrarJogos();
    elementos.lista.innerHTML = lista.map(renderizarCard).join("");
    elementos.lista.hidden = lista.length === 0;
    elementos.vazio.hidden = lista.length > 0;
    elementos.resultado.textContent = lista.length === JOGOS.length
      ? `${lista.length} jogos na agenda`
      : `Mostrando ${lista.length} de ${JOGOS.length} jogos`;
    atualizarContadores();
  }

  function atualizarContadores() {
    $$(".tab", elementos.tabs).forEach((tab) => {
      const filtro = tab.dataset.filter;
      const total = filtro === "todos"
        ? JOGOS.length
        : JOGOS.filter((jogo) => statusDoJogo(jogo).chave === filtro).length;
      const contador = $(".count", tab);
      if (contador) contador.textContent = total;
    });
  }

  function atualizarStatusCards() {
    $$("[data-status-id]", elementos.lista).forEach((elemento) => {
      const jogo = JOGOS.find((item) => item.id === elemento.dataset.statusId);
      if (!jogo) return;
      const status = statusDoJogo(jogo);
      elemento.textContent = status.rotulo;
      elemento.className = `status ${status.classe}`;
      const card = elemento.closest(".match-card");
      if (card) card.classList.toggle("is-live", status.chave === "aovivo");
    });

    const hoje = agoraBrasilia().iso === AGENDA_DATA;
    $$("[data-hero-status]").forEach((elemento) => {
      const jogo = JOGOS.find((item) => item.id === elemento.dataset.heroStatus);
      if (!jogo) return;
      const status = statusDoJogo(jogo);
      elemento.innerHTML = status.chave === "aovivo"
        ? `<i class="live-dot" aria-hidden="true"></i> Ao vivo`
        : status.chave === "encerrado"
          ? "Encerrado"
          : hoje ? "Hoje" : "Agenda";
      elemento.classList.toggle("is-live-text", status.chave === "aovivo");
    });
  }

  function carregarFiltros() {
    const competicoes = [...new Set(jogosOrdenados().map((jogo) => jogo.competicao))];
    const canais = Object.keys(CANAIS)
      .filter((id) => JOGOS.some((jogo) => jogo.canais.includes(id)))
      .sort((a, b) => CANAIS[a].nome.localeCompare(CANAIS[b].nome, "pt-BR"));

    elementos.filtroCompeticao.innerHTML = `<option value="todas">Todas as competições</option>` +
      competicoes.map((competicao) => `<option value="${competicao}">${competicao}</option>`).join("");

    elementos.filtroCanal.innerHTML = `<option value="todos">Todos os canais</option>` +
      canais.map((id) => `<option value="${id}">${nomeCanal(id)}</option>`).join("");
  }

  function sincronizarControles() {
    elementos.filtroCompeticao.value = estado.competicao;
    elementos.filtroCanal.value = estado.canal;
    elementos.filtroBrasil.checked = estado.brasil;
    $$(".tab", elementos.tabs).forEach((tab) => {
      const ativo = tab.dataset.filter === estado.aba;
      tab.classList.toggle("is-active", ativo);
      tab.setAttribute("aria-selected", String(ativo));
    });
  }

  function definirAba(aba) {
    estado.aba = aba;
    sincronizarControles();
    renderizarLista();
  }

  /* ---------- Canais ---------- */
  function renderizarCanais() {
    const ids = Object.keys(CANAIS).filter((id) => JOGOS.some((jogo) => jogo.canais.includes(id)));
    const dados = ids.map((id) => {
      const jogos = jogosOrdenados().filter((jogo) => jogo.canais.includes(id));
      return {
        id,
        canal: CANAIS[id],
        jogos,
        total: jogos.length,
        primeiro: jogos[0]
      };
    }).sort((a, b) => b.total - a.total || a.canal.nome.localeCompare(b.canal.nome, "pt-BR"));

    elementos.listaCanais.innerHTML = dados.map((item) => {
      const canal = item.canal;
      return `<button type="button" class="channel-card" data-canal="${item.id}" style="--ch:${canal.cor};--ch-text:${canal.texto};--ch-soft:${hexParaRgba(canal.cor, 0.14)}" aria-label="Ver jogos na ${nomeCanal(item.id)}">
        <span class="channel-logo ${canal.sigla.length > 6 ? "channel-logo--long" : ""}">${canal.sigla}</span>
        <span class="channel-info">
          <strong>${canal.nome}${canal.detalhe ? `<span class="channel-detail">${canal.detalhe}</span>` : ""}</strong>
          <span>${item.total} ${item.total === 1 ? "jogo" : "jogos"} hoje · a partir das ${item.primeiro.hora}</span>
        </span>
        <svg class="channel-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>`;
    }).join("");

    elementos.canaisTotal.innerHTML = `<strong>${dados.length}</strong> canais na grade`;
  }

  /* ---------- Próximo jogo e contagem ---------- */
  function atualizarProximoJogo() {
    const agora = agoraBrasilia();
    const emDia = agora.iso === AGENDA_DATA;

    if (!emDia) {
      elementos.nextLabel.textContent = "Programação do dia";
      elementos.nextMatch.textContent = dataAgendaLonga().replace(/^[^,]+, /, "");
      elementos.nextCountdown.textContent = `${JOGOS.length} jogos`;
      elementos.nextPill.classList.remove("is-live-now");
      return;
    }

    const proximo = jogosOrdenados().find((jogo) => statusDoJogo(jogo).chave === "proximo");
    if (proximo) {
      const segundos = minutosDoHorario(proximo.hora) * 60 - agora.segundosDoDia;
      elementos.nextLabel.textContent = "Próximo jogo";
      elementos.nextMatch.textContent = `${TIMES[proximo.casa].nome} × ${TIMES[proximo.fora].nome}`;
      elementos.nextCountdown.textContent = formatarContagem(segundos);
      elementos.nextPill.classList.remove("is-live-now");
      return;
    }

    const aoVivo = jogosOrdenados().find((jogo) => statusDoJogo(jogo).chave === "aovivo");
    if (aoVivo) {
      elementos.nextLabel.textContent = "Bola rolando agora";
      elementos.nextMatch.textContent = `${TIMES[aoVivo.casa].nome} × ${TIMES[aoVivo.fora].nome}`;
      elementos.nextCountdown.textContent = "AO VIVO";
      elementos.nextPill.classList.add("is-live-now");
      return;
    }

    elementos.nextLabel.textContent = "Rodada encerrada";
    elementos.nextMatch.textContent = "Confira os jogos do dia";
    elementos.nextCountdown.textContent = "—";
    elementos.nextPill.classList.remove("is-live-now");
  }

  /* ---------- Calendário (.ics) ---------- */
  function escaparTextoICS(texto) {
    return String(texto)
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");
  }

  function formatarDataUTC(data) {
    return `${data.getUTCFullYear()}${pad2(data.getUTCMonth() + 1)}${pad2(data.getUTCDate())}T${pad2(data.getUTCHours())}${pad2(data.getUTCMinutes())}00Z`;
  }

  function gerarICS(jogo) {
    const [ano, mes, dia] = AGENDA_DATA.split("-").map(Number);
    const [hora, minuto] = jogo.hora.split(":").map(Number);
    const inicio = new Date(Date.UTC(ano, mes - 1, dia, hora + 3, minuto, 0));
    const fim = new Date(inicio.getTime() + 120 * 60 * 1000);
    const casa = TIMES[jogo.casa].nome;
    const fora = TIMES[jogo.fora].nome;
    const canais = jogo.canais.map(nomeCanal).join(", ");
    const local = jogo.estadio ? `${jogo.estadio}, ${jogo.cidade}` : jogo.cidade;

    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Placar//Agenda de Jogos//PT-BR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${jogo.id}-${AGENDA_DATA.replace(/-/g, "")}@placar`,
      `DTSTAMP:${formatarDataUTC(new Date())}`,
      `DTSTART:${formatarDataUTC(inicio)}`,
      `DTEND:${formatarDataUTC(fim)}`,
      `SUMMARY:${escaparTextoICS(`${casa} x ${fora}`)}`,
      `LOCATION:${escaparTextoICS(local)}`,
      `DESCRIPTION:${escaparTextoICS(`${jogo.competicao}${jogo.fase ? ` - ${jogo.fase}` : ""}. Transmissão: ${canais}. Horário de Brasília.`)}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
  }

  function baixarICS(jogo) {
    const conteudo = gerarICS(jogo);
    const blob = new Blob([conteudo], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `jogo-${jogo.casa}-x-${jogo.fora}.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
    mostrarToast("Jogo salvo no calendário!");
  }

  /* ---------- Navegação e filtros ---------- */
  function irParaAgenda() {
    $("#agenda").scrollIntoView({ behavior: semAnimacao ? "auto" : "smooth", block: "start" });
  }

  function focarJogo(id) {
    estado.aba = "todos";
    estado.competicao = "todas";
    estado.canal = "todos";
    estado.brasil = false;
    sincronizarControles();
    renderizarLista();

    requestAnimationFrame(() => {
      const card = document.getElementById(`jogo-${id}`);
      if (!card) return;
      card.scrollIntoView({ behavior: semAnimacao ? "auto" : "smooth", block: "center" });
      card.classList.remove("is-highlighted");
      void card.offsetWidth;
      card.classList.add("is-highlighted");
      window.setTimeout(() => card.classList.remove("is-highlighted"), 2400);
    });
  }

  function filtrarPorCanal(id) {
    if (!CANAIS[id]) return;
    estado.aba = "todos";
    estado.competicao = "todas";
    estado.canal = id;
    estado.brasil = false;
    sincronizarControles();
    renderizarLista();
    fecharMenu();
    irParaAgenda();
    mostrarToast(`Mostrando jogos na ${nomeCanal(id)}`);
  }

  function filtrarBrasil() {
    estado.aba = "todos";
    estado.competicao = "todas";
    estado.canal = "todos";
    estado.brasil = true;
    sincronizarControles();
    renderizarLista();
    fecharMenu();
    irParaAgenda();
  }

  function limparFiltros() {
    estado.aba = "todos";
    estado.competicao = "todas";
    estado.canal = "todos";
    estado.brasil = false;
    sincronizarControles();
    renderizarLista();
  }

  function mostrarToast(mensagem) {
    elementos.toastText.textContent = mensagem;
    elementos.toast.classList.add("is-visible");
    clearTimeout(timerToast);
    timerToast = window.setTimeout(() => elementos.toast.classList.remove("is-visible"), 3000);
  }

  /* ---------- Menu mobile ---------- */
  function fecharMenu() {
    elementos.menu.classList.remove("is-open");
    elementos.menuToggle.classList.remove("is-open");
    elementos.menuToggle.setAttribute("aria-expanded", "false");
    elementos.menuToggle.setAttribute("aria-label", "Abrir menu");
  }

  function alternarMenu() {
    const aberto = !elementos.menu.classList.contains("is-open");
    elementos.menu.classList.toggle("is-open", aberto);
    elementos.menuToggle.classList.toggle("is-open", aberto);
    elementos.menuToggle.setAttribute("aria-expanded", String(aberto));
    elementos.menuToggle.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  }

  /* ---------- Eventos ---------- */
  function configurarEventos() {
    elementos.tabs.addEventListener("click", (evento) => {
      const tab = evento.target.closest(".tab");
      if (tab) definirAba(tab.dataset.filter);
    });

    elementos.filtroCompeticao.addEventListener("change", (evento) => {
      estado.competicao = evento.target.value;
      renderizarLista();
    });

    elementos.filtroCanal.addEventListener("change", (evento) => {
      estado.canal = evento.target.value;
      renderizarLista();
    });

    elementos.filtroBrasil.addEventListener("change", (evento) => {
      estado.brasil = evento.target.checked;
      renderizarLista();
    });

    elementos.limparFiltros.addEventListener("click", limparFiltros);

    elementos.menuToggle.addEventListener("click", alternarMenu);
    $$("a", elementos.menu).forEach((link) => link.addEventListener("click", fecharMenu));

    document.addEventListener("click", (evento) => {
      const linkBrasil = evento.target.closest('[data-filter-link="brasil"]');
      if (linkBrasil) {
        evento.preventDefault();
        filtrarBrasil();
        return;
      }

      const botaoCalendario = evento.target.closest("[data-calendar]");
      if (botaoCalendario) {
        evento.preventDefault();
        const jogo = JOGOS.find((item) => item.id === botaoCalendario.dataset.calendar);
        if (jogo) baixarICS(jogo);
        return;
      }

      const canal = evento.target.closest("[data-canal]");
      if (canal) {
        evento.preventDefault();
        filtrarPorCanal(canal.dataset.canal);
        return;
      }

      const foco = evento.target.closest("[data-focus]");
      if (foco) {
        evento.preventDefault();
        focarJogo(foco.dataset.focus);
        return;
      }

      if (!evento.target.closest(".site-header")) fecharMenu();
    });

    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape") fecharMenu();
    });

    elementos.heroPrev.addEventListener("click", () => mostrarHero(indiceHero - 1));
    elementos.heroNext.addEventListener("click", () => mostrarHero(indiceHero + 1));

    elementos.heroShell.addEventListener("mouseenter", pausarHero);
    elementos.heroShell.addEventListener("mouseleave", retomarHero);
    elementos.heroShell.addEventListener("focusin", pausarHero);
    elementos.heroShell.addEventListener("focusout", (evento) => {
      if (!elementos.heroShell.contains(evento.relatedTarget)) retomarHero();
    });

    elementos.heroShell.addEventListener("keydown", (evento) => {
      if (evento.key !== "ArrowLeft" && evento.key !== "ArrowRight") return;
      if (["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
      evento.preventDefault();
      mostrarHero(indiceHero + (evento.key === "ArrowRight" ? 1 : -1));
    });

    let toqueInicial = null;
    elementos.heroShell.addEventListener("pointerdown", (evento) => {
      if (evento.pointerType === "mouse" || evento.target.closest("a, button")) return;
      toqueInicial = evento.clientX;
    });
    elementos.heroShell.addEventListener("pointerup", (evento) => {
      if (toqueInicial === null) return;
      const deslocamento = evento.clientX - toqueInicial;
      toqueInicial = null;
      if (Math.abs(deslocamento) > 45) {
        mostrarHero(indiceHero + (deslocamento < 0 ? 1 : -1));
      }
    });
    elementos.heroShell.addEventListener("pointercancel", () => {
      toqueInicial = null;
    });
  }

  /* ---------- Relógio e atualização ao vivo ---------- */
  function tique() {
    atualizarRelogio();
    atualizarProximoJogo();

    const statusAtual = JOGOS.map((jogo) => statusDoJogo(jogo).chave).join("|");
    if (statusAtual !== statusAnterior) {
      statusAnterior = statusAtual;
      atualizarStatusCards();
      renderizarLista();
    }
  }

  /* ---------- Inicialização ---------- */
  function inicializar() {
    carregarFiltros();
    renderizarCabecalho();
    renderizarHero();
    renderizarLista();
    renderizarCanais();
    atualizarRelogio();
    atualizarProximoJogo();
    sincronizarControles();
    configurarEventos();
    statusAnterior = JOGOS.map((jogo) => statusDoJogo(jogo).chave).join("|");
    window.setInterval(tique, 1000);
  }

  inicializar();
})();
