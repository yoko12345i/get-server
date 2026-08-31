// LLM による緊急度判定と返信下書きの生成（1 回の呼び出しで両方を得る）
import { config } from './config.js';
import { chat, isLlmEnabled, parseJsonLoose } from './llm.js';
import { scoreItem, levelOf } from './priority.js';

const TRIAGE_SYSTEM = `あなたは多忙なビジネスパーソンの秘書AIです。
Slack・メール・Notion・Messenger などから集めた未処理の連絡を読み、
「どれから返信すべきか」を判断し、そのまま送れる返信文案を作ります。

判断基準:
- 相手が自分の行動・回答を待っているか（待たせているほど緊急）
- 期限や締切が迫っているか、すでに過ぎているか
- 金銭・障害・顧客影響・上長からの依頼など、放置した場合の損失の大きさ
- 単なる情報共有・自動通知・FYI は緊急度を低くする

返信文案の方針:
- 言語は %LANG%
- 相手との関係性とチャネルの文体に合わせる（Slack は簡潔に、メールは挨拶と署名の型を守る）
- 事実を捏造しない。不明な点は「確認して連絡する」形にするか [ ] のプレースホルダにする
- すぐ送れる長さにする（Slack は 1〜3 文、メールは 3〜6 文）

必ず次の形式の JSON オブジェクトのみを返すこと:
{"results":[{"id":"...","urgency":0-100,"reason":"日本語で40字以内の判定理由","deadline":"ISO8601 または null","category":"要返信|要対応|情報共有|不要","draft":"返信文案","draftNote":"文案の補足や確認事項。無ければ空文字"}]}`;

const itemToPrompt = (item) => ({
  id: item.id,
  source: item.sourceLabel || item.source,
  channel: item.channel || '',
  subject: item.subject || '',
  from: item.from?.name || item.from?.handle || '不明',
  isDirectMessage: Boolean(item.isDirect),
  receivedAt: item.receivedAt,
  participants: item.participantCount || null,
  body: String(item.body || '').slice(0, 1800),
  ruleBasedScore: item.priority?.score ?? null,
  ruleBasedReasons: item.priority?.reasons ?? []
});

const chunk = (items, size) => {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

async function analyzeBatch(items) {
  const content = await chat({
    json: true,
    temperature: 0.2,
    messages: [
      { role: 'system', content: TRIAGE_SYSTEM.replace('%LANG%', config.triage.replyLanguage) },
      {
        role: 'user',
        content: `現在時刻: ${new Date().toISOString()}\n利用者: ${config.me.name || '（名前未設定）'}\n\n未処理の連絡:\n${JSON.stringify(
          items.map(itemToPrompt),
          null,
          2
        )}`
      }
    ]
  });

  const parsed = parseJsonLoose(content);
  const results = Array.isArray(parsed) ? parsed : parsed?.results;
  if (!Array.isArray(results)) return new Map();

  return new Map(results.filter((entry) => entry && entry.id).map((entry) => [String(entry.id), entry]));
}

// ルール判定 60% : LLM 判定 40% ではなく、LLM を主・ルールを下支えとして混ぜる
const blendScore = (ruleScore, llmScore) => Math.round(ruleScore * 0.4 + llmScore * 0.6);

/**
 * 通知一覧に対して優先度と返信文案を付与する。
 * LLM が使えない場合はルールベースの結果とテンプレート文案にフォールバックする。
 */
export async function triageItems(items, { onProgress } = {}) {
  const now = new Date();
  const scored = items.map((item) => ({ ...item, priority: scoreItem(item, now) }));

  if (!isLlmEnabled()) {
    return scored.map((item) => ({
      ...item,
      draft: item.draft?.edited ? item.draft : fallbackDraft(item)
    }));
  }

  const batches = chunk(scored, Math.max(1, config.triage.batchSize));
  const analyzed = new Map();
  let done = 0;

  for (const batch of batches) {
    try {
      const result = await analyzeBatch(batch);
      for (const [id, entry] of result) analyzed.set(id, entry);
    } catch (err) {
      console.error('❌ 優先度判定に失敗（ルール判定で継続）:', err.response?.data?.error?.message || err.message);
    }
    done += batch.length;
    onProgress?.(done, scored.length);
  }

  return scored.map((item) => {
    const llm = analyzed.get(String(item.id));
    if (!llm) {
      return { ...item, draft: item.draft?.edited ? item.draft : fallbackDraft(item) };
    }

    const llmScore = Number.isFinite(Number(llm.urgency)) ? Math.max(0, Math.min(100, Number(llm.urgency))) : item.priority.score;
    const score = blendScore(item.priority.score, llmScore);
    const { level, label } = levelOf(score);
    const reasons = [...(llm.reason ? [llm.reason] : []), ...item.priority.reasons].slice(0, 5);

    return {
      ...item,
      priority: {
        ...item.priority,
        score,
        level,
        levelLabel: label,
        reasons,
        deadline: llm.deadline || item.priority.deadline || null,
        category: llm.category || null,
        llmScore,
        ruleScore: item.priority.score,
        triagedBy: 'llm'
      },
      // 利用者が編集した下書きは上書きしない
      draft: item.draft?.edited
        ? item.draft
        : {
            text: llm.draft || fallbackDraft(item).text,
            note: llm.draftNote || '',
            tone: 'standard',
            model: config.openai.model,
            generatedAt: new Date().toISOString(),
            edited: false
          }
    };
  });
}

/**
 * 再取り込み時に、LLM を呼ばずに時間依存の要素（放置時間・締切までの残り）だけを更新する。
 * 過去に LLM 判定を受けていれば、そのスコアを保ったまま再ブレンドする。
 */
export function rescore(item, previous, now = new Date()) {
  const rules = scoreItem(item, now);
  const llmScore = Number(previous?.llmScore);
  if (!Number.isFinite(llmScore)) return rules;

  const score = blendScore(rules.score, llmScore);
  const { level, label } = levelOf(score);
  const llmReason = previous.reasons?.[0];
  const reasons = [...(llmReason && !rules.reasons.includes(llmReason) ? [llmReason] : []), ...rules.reasons].slice(0, 5);

  return {
    ...rules,
    score,
    level,
    levelLabel: label,
    reasons,
    deadline: previous.deadline || rules.deadline,
    category: previous.category ?? null,
    llmScore,
    ruleScore: rules.score,
    triagedBy: 'llm'
  };
}

// LLM 無しでも「送る前の骨組み」だけは用意しておく
export function fallbackDraft(item) {
  const name = item.from?.name || item.from?.handle || 'ご担当者';
  const isMail = item.source === 'gmail';
  const text = isMail
    ? `${name} 様\n\nお世話になっております。ご連絡ありがとうございます。\n${
        item.subject ? `「${item.subject}」の件、` : ''
      }確認のうえ改めてご返信いたします。\n[ 回答内容をここに記入 ]\n\n引き続きよろしくお願いいたします。`
    : `${name} さん\nご連絡ありがとうございます。確認して[ 期限 ]までに折り返します。\n[ 回答内容をここに記入 ]`;

  return {
    text,
    note: 'OpenAI API 未設定のためテンプレート文案です',
    tone: 'template',
    model: null,
    generatedAt: new Date().toISOString(),
    edited: false
  };
}

export const TONES = {
  standard: '標準（丁寧かつ簡潔）',
  polite: 'より丁寧・フォーマル',
  short: '極力短く',
  decline: '丁寧に断る / 期限の再交渉',
  schedule: '日程調整を提案する',
  ack: '一次受けのみ（受領と対応予定を伝える）'
};

/** 個別の通知に対して、トーンを指定して返信文案を作り直す */
export async function regenerateDraft(item, { tone = 'standard', instruction = '' } = {}) {
  if (!isLlmEnabled()) return fallbackDraft(item);

  const content = await chat({
    temperature: 0.5,
    messages: [
      {
        role: 'system',
        content: `あなたは多忙なビジネスパーソンの秘書AIです。受け取った連絡への返信文案だけを ${config.triage.replyLanguage} で出力します。
前置き・説明・引用符は付けず、そのまま送信できる本文のみを返してください。
事実の捏造は禁止です。埋めるべき情報は [ ] のプレースホルダにしてください。
トーン: ${TONES[tone] || TONES.standard}${instruction ? `\n追加指示: ${instruction}` : ''}`
      },
      {
        role: 'user',
        content: `チャネル: ${item.sourceLabel || item.source}${item.channel ? ` / ${item.channel}` : ''}
差出人: ${item.from?.name || item.from?.handle || '不明'}
件名: ${item.subject || '（なし）'}
本文:
${String(item.body || '').slice(0, 2000)}`
      }
    ]
  });

  return {
    text: content.trim(),
    note: '',
    tone,
    model: config.openai.model,
    generatedAt: new Date().toISOString(),
    edited: false
  };
}
