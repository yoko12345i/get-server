# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`get-desktop` は「優先度インボックス」— Slack / Gmail / Notion / Facebook Messenger の連絡を
横断で取り込み、緊急度順に並べ、返信文案まで用意する専用アプリ（Express + 素の JS フロントエンド）です。
もともとは OpenAI へプロンプトを中継するだけの `server.js` 1 ファイル構成（in-code 名 "COLDRAW ChatGPTサーバー"）で、
`POST /ask` はその名残として後方互換のまま残しています。

## Commands

- **起動**: `npm start`（`node server.js`）／`npm run dev`（`node --watch`）
- **依存関係**: `npm install`
- **テスト**: `npm test`（`node --test test/*.test.js`。追加のテストフレームワークは無し）
- **Lint/build**: 設定なし

### Environment setup

`dotenv` 経由で `.env` を読み込みます。`.env.example` に全項目の説明があります。
**API キーが 1 つも無くても起動でき**、その場合は `data/sample-inbox.json` のデモデータ +
ルールベースの優先度判定 + テンプレート文案で動作します（新機能を触るときの既定の確認方法）。

`OPENAI_API_KEY` があると LLM による再判定と文案生成が有効になります。

## Architecture

```
server.js         起動エントリ。設定サマリを出力 → 状態読込 → listen → 定期取り込み
src/config.js     環境変数の一元管理。3 値フラグは tribool（未指定 = 自動判定）
src/llm.js        OpenAI Chat Completions のラッパーと JSON パース
src/sources/      コネクタ。各モジュールは { id, label, isConfigured, fetchItems, send? } を公開
src/priority.js   ルールベースのスコアリング（0〜100）、締切抽出、並べ替え
src/triage.js     LLM によるバッチ再判定 + 返信文案生成。失敗時はルール判定へフォールバック
src/pipeline.js   collectAll → triage → store。同時実行は 1 本に集約、内容が変わらない通知は再判定しない
src/store.js      通知本体と「利用者の操作（override）」を分離して保持し data/state.json に永続化
src/api.js        /api 配下のルーター
src/app.js        Express アプリ組み立て（/api, /health, /ask, public/ の配信）
public/           フロントエンド。ビルド無し、依存無しの ES モジュール
```

構造上の要点:

- **ソースを追加するとき**は `src/sources/` に 1 ファイル追加し `src/sources/index.js` の `SOURCES` に登録するだけ。
  `fetchItems()` は正規化前の素の配列を返し、`index.js` の `normalize()` が `id` の採番（`source:externalId`）と
  既定値の補完を行う。`send()` は任意（実装すると UI に送信ボタンが出る）。
- **利用者の操作（完了 / スヌーズ / ピン / 編集した文案）は override として通知本体とは別に保持**する。
  取り込み直しても操作が失われないための設計なので、`store.js` を触るときはこの分離を壊さないこと。
- **LLM は必須にしない。** 新しい機能を足すときも、キーが無い場合の振る舞いを必ず用意する。
- 実際の送信は `ALLOW_SEND=true` のときだけ有効。既定は文案コピー運用。

## Conventions

- **ログと利用者向けの文字列は日本語**。状態を表す絵文字を前置する（`✅` 成功 / `❌` エラー / `⚠️` 警告 /
  `📩` 受信データ / `🌐` サーバー情報 / `📤` 送信）。新しいログもこの形式に合わせる。
- ESM（`package.json` に `"type": "module"`）。CommonJS の `require` は使わない。
- 依存は `express` / `axios` / `dotenv` の 3 つのみ。フロントエンドはビルドツール無しの素の JS。
  新しい依存を足す前に、標準機能で済まないか検討する。
- スコアリングの重みを変えたら `npm test` の期待値（`test/priority.test.js`）も見直す。
