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
PORT=3000                    # optional, defaults to 3000
OPENAI_PROJECT_ID=proj_...   # optional, sent as the OpenAI-Project header when set
```

Without `OPENAI_API_KEY`, the server still starts but every call to `POST /ask` will fail against the OpenAI API. `OPENAI_PROJECT_ID` is only needed when the key must be scoped to a specific OpenAI project; leave it out and the request goes to the key's default project.

## Architecture

Everything is in `server.js`:

- `GET /` — health-check route, returns a static confirmation string.
- `POST /ask` — takes `{ prompt: string }` in the JSON body, forwards it to `https://api.openai.com/v1/chat/completions` via `axios` using model `gpt-3.5-turbo`, with a hardcoded Japanese system prompt ("あなたは日本語で丁寧に返答するアシスタントです。" — "You are an assistant that replies politely in Japanese"). The reply text is extracted from `response.data.choices[0].message.content` and returned as `{ reply }`.
  - Returns `400` if `prompt` is missing.
  - Returns `500` with a generic Japanese error message if the OpenAI call fails (the underlying error is only logged server-side, not sent to the client).

There is no routing/controller/service layering — if this grows, that's a structural decision to make deliberately rather than something to infer from existing patterns.

## Conventions

- **Logging and user-facing strings are in Japanese**, prefixed with emoji to indicate status (`✅` success, `❌` error, `⚠️` warning, `📩` incoming data, `🌐` server identity). Match this style for any new log lines or API responses in this file.
- `package.json` does not set `"type": "module"`, even though `server.js` uses ESM `import` syntax. Node currently handles this by reparsing the file as ESM at runtime with a performance-warning (`MODULE_TYPELESS_PACKAGE_JSON`). Be aware of this when adding new `.js` files — they'll be treated the same way unless `"type": "module"` is added to `package.json`.
