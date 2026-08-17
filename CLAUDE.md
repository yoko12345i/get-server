# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a minimal Express.js backend (npm package name `get-desktop`) that proxies chat prompts to the OpenAI Chat Completions API. It was built as the server for a project referred to in-code as "COLDRAW ChatGPTサーバー" (COLDRAW ChatGPT server). The entire application currently lives in a single file, `server.js`.

## Commands

- **Run the server**: `npm start` (runs `node server.js`)
- **Install dependencies**: `npm install`
- **Tests**: none configured — `npm test` is the default placeholder (`echo "Error: no test specified" && exit 1`) and will fail. There is no test framework in this repo.
- **Lint/build**: none configured.

### Environment setup

The server reads config via `dotenv`, so a `.env` file (gitignored) is required at the project root with at minimum:

```
OPENAI_API_KEY=sk-...
PORT=3000   # optional, defaults to 3000
```

Without `OPENAI_API_KEY`, the server still starts but every call to `POST /ask` will fail against the OpenAI API.

## Architecture

The repo holds two independent things: the original OpenAI proxy in `server.js`, and a
self-contained front-end prototype under `public/`.

### Server (`server.js`)

- `GET /` — health-check route, returns a static confirmation string.
- `/dining/*` — static mount of `public/` (the Executive Dining Network prototype).
- `POST /ask` — takes `{ prompt: string }` in the JSON body, forwards it to `https://api.openai.com/v1/chat/completions` via `axios` using model `gpt-3.5-turbo`, with a hardcoded Japanese system prompt ("あなたは日本語で丁寧に返答するアシスタントです。" — "You are an assistant that replies politely in Japanese"). The reply text is extracted from `response.data.choices[0].message.content` and returned as `{ reply }`.
  - Returns `400` if `prompt` is missing.
  - Returns `500` with a generic Japanese error message if the OpenAI call fails (the underlying error is only logged server-side, not sent to the client).

There is no routing/controller/service layering — if this grows, that's a structural decision to make deliberately rather than something to infer from existing patterns.

### Prototype (`public/`)

A mobile-first hash-routed SPA for the COLDRAW Executive Dining Network, served at `/dining/`.
No build step, no dependencies, no server state — it never calls `POST /ask` and works without
`OPENAI_API_KEY`. See `PROTOTYPE.md` for the screen map, the KPI it exists to measure, and the
self-evaluation.

- `public/js/data.js` — fictional restaurant fixtures, matching, constraint assessment.
- `public/js/art.js` — procedural SVG imagery (no photographs of real places).
- `public/js/store.js` — localStorage state and event instrumentation.
- `public/js/app.js` — router and all screens.

Two rules to preserve when editing it:

1. **Disclosure, not certification.** COLDRAW may state verified facts only about its own Nature
   Packs / Nature Cocktails (`kind: 'coldraw'`). Anything about a restaurant's own menu is
   `kind: 'reported'` and is shown dated. Never add copy that certifies a restaurant as vegan,
   halal or allergen-free.
2. **All venue data is fictional and must stay that way** — no unverified claims about real
   restaurants or chefs.

## Conventions

- **Logging and user-facing strings are in Japanese**, prefixed with emoji to indicate status (`✅` success, `❌` error, `⚠️` warning, `📩` incoming data, `🌐` server identity). Match this style for any new log lines or API responses in this file.
- `package.json` does not set `"type": "module"`, even though `server.js` uses ESM `import` syntax. Node currently handles this by reparsing the file as ESM at runtime with a performance-warning (`MODULE_TYPELESS_PACKAGE_JSON`). Be aware of this when adding new `.js` files — they'll be treated the same way unless `"type": "module"` is added to `package.json`.
