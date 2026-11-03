# Placar. — Jogos de Hoje

Site de agenda esportiva com banner rotativo, horários, estádios, competições e canais de transmissão dos jogos do dia. A versão atual traz a programação de **terça-feira, 3 de novembro de 2026**, com foco em times brasileiros.

## Como abrir

Basta dar dois cliques em `index.html`. O site é 100% estático e funciona direto no navegador.

Se preferir rodar com um servidor local:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## O que tem no site

- Banner com os três jogos em destaque, com troca automática, setas, teclado e swipe no celular.
- Agenda completa com filtros por situação (ao vivo, próximos, encerrados), competição, canal e times brasileiros.
- Status calculado em tempo real: próximo, ao vivo e encerrado.
- Contagem regressiva para o próximo jogo.
- Canais de transmissão clicáveis para filtrar a agenda.
- Botão para baixar cada jogo no calendário (arquivo `.ics`).
- Layout responsivo para celular, tablet e desktop.
- Escudos em SVG e identidade visual próprios, sem depender de imagens externas.

## Como atualizar os jogos

Tudo fica no arquivo **`dados.js`**.

### Data da agenda

```js
const AGENDA_DATA = "2026-11-03";
```

A data é usada para montar o cabeçalho, os arquivos de calendário e o cálculo de "ao vivo". Se o site for aberto em outro dia, os jogos aparecem como "Programado" e a contagem regressiva é substituída pela data da agenda.

### Canais

```js
const CANAIS = {
  premiere: {
    nome: "Premiere",
    sigla: "PREMIERE",
    cor: "#7c3aed",
    texto: "#ffffff"
  }
};
```

- `nome`: texto exibido nos chips e filtros.
- `sigla`: texto do logo na seção "Canais de hoje".
- `cor` e `texto`: cores do logo.
- `detalhe` (opcional): complemento, como `"YouTube"`.

### Times

```js
const TIMES = {
  flamengo: {
    nome: "Flamengo",
    sigla: "FLA",
    cor: "#c8102e",
    cor2: "#111111",
    texto: "#ffffff"
  }
};
```

- `cor` é a cor principal do escudo.
- `cor2` é a cor da faixa e da borda.
- `texto` é a cor do monograma.

### Jogos

```js
{
  id: "flamengo-operario-sub20",
  competicao: "Copa do Brasil Sub-20",
  fase: "Quartas de final · volta",
  casa: "flamengo",
  fora: "operario",
  hora: "16:30",
  estadio: "Arena Fonte Nova",
  cidade: "Salvador, BA",
  canais: ["sportv"],
  internacional: false,
  destaque: 0
}
```

Campos:

- `id`: identificador único, usado no calendário e nos links internos.
- `casa` / `fora`: chaves cadastradas em `TIMES`.
- `hora`: horário de Brasília, no formato `HH:MM`.
- `estadio`: opcional; se ficar vazio, aparece apenas a cidade.
- `canais`: lista de chaves cadastradas em `CANAIS`.
- `internacional`: `true` para jogos sem times brasileiros. Esses jogos não entram na contagem "com times brasileiros" nem no filtro "Só Brasil".
- `destaque`: `1`, `2` ou `3` define a ordem no banner. Use `0` para não destacar.
- `selo` e `contexto`: opcionais, aparecem somente no banner.

### Competições

As cores dos pontinhos de cada competição ficam em `CORES_COMPETICAO`, no fim de `dados.js`.

## Observações

- Todos os horários seguem o fuso de Brasília (UTC−3).
- A programação foi compilada a partir de fontes públicas em 03/11/2026 (Veja, O Tempo, Olhar Digital, O Povo, Oficina da Net e outras). Canais e horários podem mudar sem aviso.
- Os escudos são monogramas estilizados criados para este projeto; não são os brasões oficiais dos clubes.
- Este é um projeto de página estática. Para deixar a agenda automática, é possível trocar o array `JOGOS` por uma chamada a uma API de futebol.
