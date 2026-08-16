# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This repo holds two things served by one Express process (npm package name `get-desktop`):

1. **UNDERCURRENT** — a browser prototype of a Consumer Experience / Patronage Platform derived from COLDRAW. Static files in `public/`, strategy and design docs in `docs/`. This is the bulk of the repo.
2. A small **OpenAI proxy** (`POST /ask`), the repo's original purpose, referred to in-code as "COLDRAW ChatGPTサーバー".

`server.js` wires both together and stays deliberately thin — it serves files and proxies one API call; it holds no prototype logic.

## Commands

- **Run the server**: `npm start` (runs `node server.js`), then open <http://localhost:3000/> for the prototype
- **Install dependencies**: `npm install`
- **Tests**: none configured — `npm test` is the default placeholder (`echo "Error: no test specified" && exit 1`) and will fail. There is no test framework in this repo.
- **Lint/build**: none configured.

### Environment setup

The server reads config via `dotenv`, so a `.env` file (gitignored) is required at the project root with at minimum:

```
OPENAI_API_KEY=sk-...
PORT=3000   # optional, defaults to 3000
```

Without `OPENAI_API_KEY`, the server still starts and the prototype works fine — only `POST /ask` fails.

## Architecture

### `server.js`

- `express.static('public')` plus an explicit `APP_ROUTES` list that returns `public/index.html` for every prototype path. Client-side routing means **a new prototype page must be added in two places**: `ROUTES` in `public/js/app.js` and `APP_ROUTES` in `server.js`. Missing the latter gives a 404 on direct load / refresh.
- `express.static('docs')` at `/docs` so the prototype footer can link the design documents.
- `GET /api/health` — health check (this used to be `GET /`, which is now the prototype home).
- `POST /ask` — takes `{ prompt: string }` in the JSON body, forwards it to `https://api.openai.com/v1/chat/completions` via `axios` using model `gpt-3.5-turbo`, with a hardcoded Japanese system prompt ("あなたは日本語で丁寧に返答するアシスタントです。" — "You are an assistant that replies politely in Japanese"). The reply text is extracted from `response.data.choices[0].message.content` and returned as `{ reply }`.
  - Returns `400` if `prompt` is missing.
  - Returns `500` with a generic Japanese error message if the OpenAI call fails (the underlying error is only logged server-side, not sent to the client).

There is no routing/controller/service layering on the API side — if that grows, it's a structural decision to make deliberately rather than something to infer from existing patterns.

### The prototype (`public/`)

Plain ES modules, no build step, no dependencies, no network requests. One HTML shell renders every page.

| File | Role |
|---|---|
| `index.html` | Shell only. Loads `js/app.js` as a module; all markup is generated at runtime. |
| `js/app.js` | Router. Maps `location.pathname` → a render function, sets `document.title`. |
| `js/pages.js` | One exported function per screen, each returning an HTML string. |
| `js/ui.js` | Shared chrome (masthead, footer) and components (`recordCard`, `registerTable`, `axesBlock`, `issuance`, …). |
| `js/data.js` | All mock content. **Everything in it is fictional** — people, venues, numbers, histories. |
| `js/signature.js` | Generates each Creator's "Taste Signature" as deterministic SVG from their 5-axis taste profile. Used instead of photography, so the prototype never fabricates images of people. |
| `css/app.css` | The whole design system. |

Content is injected as HTML strings, so **any interpolated data must go through `esc()`** from `ui.js`.

### `docs/`

`01-strategy.md` (business design), `02-information-architecture.md` (IA and naming rules), `03-design-language.md` (visual system). The prototype is an implementation of these — when changing UI behaviour, check whether a doc asserts the opposite. Several choices that look like omissions are deliberate and documented there: no progress bars, no points or badges, no ranking numbers, no monetary amounts in any supporter-facing record, no "remaining uses" counter on a Pass.

## Conventions

- **Logging and user-facing strings are in Japanese**, prefixed with emoji to indicate status (`✅` success, `❌` error, `⚠️` warning, `📩` incoming data, `🌐` server identity). Match this style for any new log lines or API responses in this file.
- `package.json` sets `"type": "module"`; all `.js` files in this repo are ES modules.
- **Prototype copy is Japanese, with a fixed English vocabulary** that is never translated: Support / Supporter / Patron / Register / Access / Experience / Creator. `docs/02-information-architecture.md` §4 lists the words to use and the words to avoid (notably 推し / 推し活, ランキング, 特典). Follow it when writing new UI text.
- The prototype shows a persistent black `PROTOTYPE` bar stating that all data is fictional. Keep it while the data is mock.
