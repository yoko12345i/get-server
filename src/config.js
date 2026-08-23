// アプリ全体の設定を環境変数から組み立てるモジュール
import dotenv from 'dotenv';

dotenv.config();

const bool = (value, fallback = false) => {
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

// 未指定（自動判定）を undefined で表す 3 値のフラグ
const tribool = (value) => {
  if (value === undefined || value === '') return undefined;
  return bool(value);
};

const num = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const list = (value) =>
  String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

export const config = {
  port: num(process.env.PORT, 3000),

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    // /ask は従来どおり gpt-3.5-turbo、優先度判定と返信下書きは別モデルを使う
    askModel: process.env.OPENAI_ASK_MODEL || 'gpt-3.5-turbo',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    timeoutMs: num(process.env.OPENAI_TIMEOUT_MS, 60000)
  },

  // 自分自身を表す情報。メンション判定と「自分が既に返信済みか」の判定に使う
  me: {
    name: process.env.ME_NAME || '',
    email: process.env.ME_EMAIL || '',
    slackUserId: process.env.SLACK_USER_ID || '',
    aliases: list(process.env.ME_ALIASES)
  },

  // 優先的に扱いたい相手（上司・重要顧客など）
  vipSenders: list(process.env.VIP_SENDERS).map((entry) => entry.toLowerCase()),

  triage: {
    // LLM に投げる 1 バッチあたりの件数
    batchSize: num(process.env.TRIAGE_BATCH_SIZE, 5),
    // 取り込み対象にする過去何時間分か
    lookbackHours: num(process.env.LOOKBACK_HOURS, 72),
    maxItemsPerSource: num(process.env.MAX_ITEMS_PER_SOURCE, 30),
    // 下書きを自動生成する優先度スコアの下限
    draftThreshold: num(process.env.DRAFT_THRESHOLD, 0),
    replyLanguage: process.env.REPLY_LANGUAGE || '日本語'
  },

  refresh: {
    // 自動取り込みの間隔（0 以下で自動取り込み無効）
    intervalMs: num(process.env.REFRESH_INTERVAL_MS, 120000),
    onBoot: bool(process.env.REFRESH_ON_BOOT, true)
  },

  storage: {
    stateFile: process.env.STATE_FILE || 'data/state.json'
  },

  // 各サービスへ実際に返信を送信する機能。既定では無効（コピー運用）
  allowSend: bool(process.env.ALLOW_SEND, false),

  sources: {
    demo: {
      // 未指定なら「他のソースが 1 つも設定されていなければデモデータで動く」
      enabled: tribool(process.env.DEMO_MODE),
      file: process.env.DEMO_FILE || 'data/sample-inbox.json'
    },
    slack: {
      token: process.env.SLACK_TOKEN || process.env.SLACK_BOT_TOKEN || '',
      channels: list(process.env.SLACK_CHANNELS),
      includeChannelTypes: process.env.SLACK_CHANNEL_TYPES || 'im,mpim,private_channel,public_channel'
    },
    gmail: {
      accessToken: process.env.GMAIL_ACCESS_TOKEN || '',
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN || '',
      query: process.env.GMAIL_QUERY || 'is:unread -category:promotions -category:social'
    },
    notion: {
      token: process.env.NOTION_TOKEN || '',
      version: process.env.NOTION_VERSION || '2022-06-28'
    },
    messenger: {
      pageToken: process.env.MESSENGER_PAGE_TOKEN || '',
      pageId: process.env.MESSENGER_PAGE_ID || 'me',
      apiVersion: process.env.MESSENGER_API_VERSION || 'v19.0'
    }
  }
};

// 自分を指す文字列の一覧（メンション検出用）
export const myIdentifiers = () =>
  [config.me.name, config.me.email, config.me.slackUserId, ...config.me.aliases]
    .filter(Boolean)
    .map((entry) => entry.toLowerCase());
