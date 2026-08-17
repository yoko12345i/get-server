# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a minimal Express.js backend (npm package name `get-desktop`) that proxies chat prompts to the OpenAI Chat Completions API. It was built as the server for a project referred to in-code as "COLDRAW ChatGPTサーバー" (COLDRAW ChatGPT server). The entire application lives in a single file, `server.js` (~55 lines).

## Commands

- **Run the server**: `npm start` (runs `node server.js`)
- **Install dependencies**: `npm install`
- **Tests**: none configured — `npm test` is the default placeholder (`echo "Error: no test specified" && exit 1`) and will fail. There is no test framework in this repo.
- **Lint/build**: none configured.

Verified toolchain in this environment: Node 22, npm 10. Installed deps: `express@5.1.0`, `axios@1.9.0`, `dotenv@16.5.0`.

### Environment setup

The server reads config via `dotenv`, so a `.env` file is required at the project root with at minimum:

```
OPENAI_API_KEY=sk-...
PORT=3000   # optional, defaults to 3000
```

Without `OPENAI_API_KEY`, the server still starts but every call to `POST /ask` will fail against the OpenAI API.

## Architecture

Everything is in `server.js`:

- `GET /` — health-check route, returns a static confirmation string.
- `POST /ask` — takes `{ prompt: string }` in the JSON body, forwards it to `https://api.openai.com/v1/chat/completions` via `axios` using model `gpt-3.5-turbo`, with a hardcoded Japanese system prompt ("あなたは日本語で丁寧に返答するアシスタントです。" — "You are an assistant that replies politely in Japanese"). The reply is read with optional chaining from `response.data.choices?.[0]?.message?.content`, falling back to the string `'返答が取得できませんでした'`, and returned as `{ reply }`.
  - Returns `400` `{ error: 'プロンプトが必要です' }` if `prompt` is missing.
  - Returns `500` `{ error: 'API呼び出しに失敗しました' }` if the OpenAI call fails. The underlying error (`err.response?.data || err.message`) is only logged server-side, never sent to the client — keep it that way.

There is no routing/controller/service layering, no auth, no CORS middleware, and no request validation beyond the empty-prompt check. If this grows, that's a structural decision to make deliberately rather than something to infer from existing patterns.

`server.js` runs `dotenv.config()` at import time and calls `app.listen()` at module top level — there is no exported app object, so the file cannot currently be imported for testing without starting a listener.

## Conventions

- **Logging and user-facing strings are in Japanese**, prefixed with emoji to indicate status (`✅` success, `❌` error, `⚠️` warning, `📩` incoming data, `🌐` server identity). Match this style for any new log lines or API responses in this file.
- `package.json` does not set `"type": "module"`, even though `server.js` uses ESM `import` syntax. Node handles this by reparsing the file as ESM at runtime with a performance warning (`MODULE_TYPELESS_PACKAGE_JSON`). New `.js` files are treated the same way unless `"type": "module"` is added to `package.json`.
- `package.json` `"main"` points at `index.js`, which does not exist. The real entry point is `server.js` via the `start` script.
- Commit messages follow Conventional Commits prefixes seen in history: `fix:`, `docs:`, `debug:`.

## Repository state gotchas

These are known, pre-existing conditions. Don't be surprised by them, and don't "fix" them as a side effect of unrelated work — but do flag them if the user is touching adjacent code.

- **`.gitignore` is UTF-16LE encoded** (with BOM and CRLF), so git cannot parse it. Its single intended entry, `.env`, is **not actually being ignored** — `git check-ignore .env` returns no match. A `git add .` will happily stage a real `.env` and leak the API key. Verify staged files explicitly before committing. Fixing this means rewriting `.gitignore` as UTF-8.
- **`node_modules/` is committed** — 784 files are tracked in git. It is also absent from `.gitignore`. Expect `git status` / diffs to be noisy after any `npm install`.
- **A stray empty file named `{` is tracked** at the repo root, added in commit `d723769`. It is not referenced by anything.
- **`server.js:6` logs the raw `OPENAI_API_KEY` to stdout** on startup (`console.log('✅ 環境変数ロード完了', process.env.OPENAI_API_KEY)`). Anywhere logs are collected, the key is exposed. This is leftover debug output.
- `server.js:32` carries a commented-out `project:` field for the OpenAI request body, left from earlier debugging of project-scoped API keys.
