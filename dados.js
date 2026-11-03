/* =========================================================
   PLACAR. — Dados da agenda
   Edite este arquivo para atualizar os jogos do dia.
   Horários no fuso de Brasília (UTC−3).
   ========================================================= */

const AGENDA_DATA = "2026-11-03";

/* ---------------------------------------------------------
   CANAIS
   - nome: como aparece na interface
   - sigla: usada no logo
   - cor / texto: identidade visual do canal
   - detalhe: opcional (ex.: YouTube)
   --------------------------------------------------------- */
const CANAIS = {
  sportv: {
    nome: "SporTV",
    sigla: "SPORTV",
    cor: "#00a86b",
    texto: "#ffffff"
  },
  premiere: {
    nome: "Premiere",
    sigla: "PREMIERE",
    cor: "#7c3aed",
    texto: "#ffffff"
  },
  sbt: {
    nome: "SBT",
    sigla: "SBT",
    cor: "#1746c4",
    texto: "#ffffff"
  },
  tnt: {
    nome: "TNT",
    sigla: "TNT",
    cor: "#d81f2a",
    texto: "#ffffff"
  },
  hbomax: {
    nome: "HBO Max",
    sigla: "HBO",
    cor: "#4b22d6",
    texto: "#ffffff"
  },
  space: {
    nome: "Space",
    sigla: "SPACE",
    cor: "#1e4ed8",
    texto: "#ffffff"
  },
  tntyt: {
    nome: "TNT Sports",
    sigla: "TNT",
    cor: "#ff4d00",
    texto: "#ffffff",
    detalhe: "YouTube"
  }
};

/* ---------------------------------------------------------
   TIMES
   - sigla: monograma do escudo
   - cor / cor2: cores do escudo
   - texto: cor do monograma
   --------------------------------------------------------- */
const TIMES = {
  internacional: { nome: "Internacional", sigla: "INT", cor: "#d71920", cor2: "#ffffff", texto: "#ffffff" },
  coritiba:      { nome: "Coritiba",      sigla: "CFC", cor: "#0b6b3a", cor2: "#ffffff", texto: "#ffffff" },
  chapecoense:   { nome: "Chapecoense",   sigla: "CHA", cor: "#009c3b", cor2: "#ffffff", texto: "#ffffff" },
  mirassol:      { nome: "Mirassol",      sigla: "MIR", cor: "#ffd400", cor2: "#0a7a3d", texto: "#12321f" },
  bahia:         { nome: "Bahia",         sigla: "BAH", cor: "#0a5bd8", cor2: "#e30613", texto: "#ffffff" },
  flamengo:      { nome: "Flamengo",      sigla: "FLA", cor: "#c8102e", cor2: "#111111", texto: "#ffffff" },
  operario:      { nome: "Operário-PR",   sigla: "OPE", cor: "#111111", cor2: "#f5c400", texto: "#ffffff" },
  cruzeiro:      { nome: "Cruzeiro",      sigla: "CRU", cor: "#0b3d91", cor2: "#ffffff", texto: "#ffffff" },
  corinthians:   { nome: "Corinthians",   sigla: "COR", cor: "#111111", cor2: "#ffffff", texto: "#ffffff" },
  barcelona:     { nome: "Barcelona",     sigla: "BAR", cor: "#a50044", cor2: "#004d98", texto: "#ffffff" },
  astonvilla:    { nome: "Aston Villa",   sigla: "AVL", cor: "#670e36", cor2: "#95bfe5", texto: "#ffffff" },
  atleticomadrid:{ nome: "Atlético de Madrid", sigla: "ATM", cor: "#cb3524", cor2: "#ffffff", texto: "#ffffff" },
  bayern:        { nome: "Bayern de Munique", sigla: "FCB", cor: "#dc052d", cor2: "#0066b2", texto: "#ffffff" },
  manutd:        { nome: "Manchester United", sigla: "MUN", cor: "#da020e", cor2: "#fbe122", texto: "#ffffff" },
  roma:          { nome: "Roma",          sigla: "ROM", cor: "#8e1f2f", cor2: "#f0bc42", texto: "#ffffff" }
};

/* ---------------------------------------------------------
   JOGOS
   - casa / fora: chaves de TIMES
   - hora: "HH:MM" (Brasília)
   - canais: chaves de CANAIS
   - destaque: 1, 2 ou 3 = ordem no banner (omitir se não destacar)
   - internacional: true = não entra na contagem "times brasileiros"
   --------------------------------------------------------- */
const JOGOS = [
  {
    id: "flamengo-operario-sub20",
    competicao: "Copa do Brasil Sub-20",
    fase: "Quartas de final · volta",
    casa: "flamengo",
    fora: "operario",
    hora: "16:30",
    estadio: "",
    cidade: "Rio de Janeiro, RJ",
    canais: ["sportv"],
    internacional: false,
    destaque: 0
  },
  {
    id: "barcelona-aston-villa",
    competicao: "UEFA Champions League",
    fase: "Fase de liga · 4ª rodada",
    casa: "barcelona",
    fora: "astonvilla",
    hora: "17:00",
    estadio: "Camp Nou",
    cidade: "Barcelona, Espanha",
    canais: ["sbt", "tnt", "hbomax"],
    internacional: true,
    destaque: 0
  },
  {
    id: "atletico-bayern",
    competicao: "UEFA Champions League",
    fase: "Fase de liga · 4ª rodada",
    casa: "atleticomadrid",
    fora: "bayern",
    hora: "17:00",
    estadio: "Metropolitano",
    cidade: "Madri, Espanha",
    canais: ["space", "hbomax"],
    internacional: true,
    destaque: 0
  },
  {
    id: "manutd-roma",
    competicao: "UEFA Champions League",
    fase: "Fase de liga · 4ª rodada",
    casa: "manutd",
    fora: "roma",
    hora: "17:00",
    estadio: "Old Trafford",
    cidade: "Manchester, Inglaterra",
    canais: ["tntyt", "hbomax"],
    internacional: true,
    destaque: 0
  },
  {
    id: "bahia-flamengo-fem",
    competicao: "Copa do Brasil Feminina",
    fase: "Semifinal · ida",
    casa: "bahia",
    fora: "flamengo",
    hora: "19:00",
    estadio: "Arena Fonte Nova",
    cidade: "Salvador, BA",
    canais: ["sportv"],
    internacional: false,
    destaque: 3,
    selo: "Semifinal",
    contexto: "Bahia e Flamengo abrem a semifinal da Copa do Brasil Feminina na Arena Fonte Nova."
  },
  {
    id: "chapecoense-mirassol",
    competicao: "Brasileirão Série A",
    fase: "34ª rodada",
    casa: "chapecoense",
    fora: "mirassol",
    hora: "19:30",
    estadio: "Arena Condá",
    cidade: "Chapecó, SC",
    canais: ["premiere"],
    internacional: false,
    destaque: 2,
    selo: "Duelo decisivo",
    contexto: "A Chapecoense recebe o Mirassol em confronto direto na luta contra o rebaixamento."
  },
  {
    id: "cruzeiro-corinthians-sub17",
    competicao: "Brasileirão Sub-17",
    fase: "Final",
    casa: "cruzeiro",
    fora: "corinthians",
    hora: "21:30",
    estadio: "",
    cidade: "Belo Horizonte, MG",
    canais: ["sportv"],
    internacional: false,
    destaque: 0
  },
  {
    id: "internacional-coritiba",
    competicao: "Brasileirão Série A",
    fase: "34ª rodada",
    casa: "internacional",
    fora: "coritiba",
    hora: "21:30",
    estadio: "Beira-Rio",
    cidade: "Porto Alegre, RS",
    canais: ["premiere"],
    internacional: false,
    destaque: 1,
    selo: "Destaque da noite",
    contexto: "O Inter precisa vencer para deixar o Z-4. O Coritiba também briga na parte de baixo da tabela."
  }
];

/* Cores usadas nos pontinhos de cada competição */
const CORES_COMPETICAO = {
  "Brasileirão Série A": "#c6ff45",
  "Copa do Brasil Feminina": "#ff7ac8",
  "Copa do Brasil Sub-20": "#66d9ff",
  "Brasileirão Sub-17": "#ffb454",
  "UEFA Champions League": "#7aa2ff"
};
