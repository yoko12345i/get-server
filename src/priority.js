// ルールベースの緊急度スコアリング。LLM が使えない環境でもここだけで動く。
import { config, myIdentifiers } from './config.js';

const KEYWORD_RULES = [
  {
    key: 'critical',
    weight: 28,
    label: '緊急を示す語句',
    words: ['至急', '大至急', '緊急', '今すぐ', '本日中', '今日中', '即時', 'asap', 'urgent', 'critical', 'p0', 'p1']
  },
  {
    // 放置したときの損失が大きい話題。緊急語と重なると「本当に今やるべき案件」として浮上する
    key: 'impact',
    weight: 16,
    label: '影響の大きい話題',
    words: ['障害', 'サービス停止', 'ダウンして', 'インシデント', 'クレーム', '本番', '顧客', '取引先', '請求', '支払い', '入金', '契約', '解約', 'セキュリティ', '情報漏洩', '不具合', 'outage', 'incident', 'production', 'customer', 'invoice', 'payment', 'security', 'breach']
  },
  {
    key: 'deadline',
    weight: 14,
    label: '期限・催促の語句',
    words: ['締切', '締め切り', '期限', '納期', 'までに', '明日まで', '今週中', 'リマインド', '再送', '未対応', '催促', 'まだでしょうか', 'deadline', 'due', 'reminder', 'following up', 'follow up']
  },
  {
    key: 'request',
    weight: 9,
    label: '依頼・確認の語句',
    words: ['お願いします', 'お願いいたします', 'お願い', 'ご確認', '確認して', 'ご返信', '返信ください', '回答', '承認', 'レビュー', '依頼', 'いただけますか', 'いただけると', 'please', 'could you', 'review', 'approve', 'sign off']
  },
  {
    // 私用の連絡も対象に含めるが、仕事の重大案件よりは下に来るように控えめに減点する
    key: 'personal',
    weight: -20,
    label: '私用・予定調整の話題',
    words: ['食事会', '飲み会', '飲みに', 'ランチ', '二次会', 'お店', '予約したい', '誕生日', '旅行', '帰省', 'プレゼント', '遊び']
  },
  {
    key: 'noise',
    weight: -30,
    label: '自動配信・通知系',
    words: ['メルマガ', 'ニュースレター', '配信停止', '自動送信', '自動通知', 'このメールは送信専用', 'newsletter', 'no-reply', 'noreply', 'do not reply', 'unsubscribe', 'digest']
  }
];

const SOURCE_WEIGHT = {
  slack: 5,
  messenger: 3,
  gmail: 2,
  notion: 0,
  demo: 0
};

export const LEVELS = [
  { level: 'urgent', label: '緊急', min: 78 },
  { level: 'high', label: '高', min: 58 },
  { level: 'normal', label: '中', min: 35 },
  { level: 'low', label: '低', min: 0 }
];

export const levelOf = (score) => LEVELS.find((entry) => score >= entry.min) || LEVELS[LEVELS.length - 1];

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const atHour = (base, hour) => {
  const date = new Date(base);
  date.setHours(hour, 0, 0, 0);
  return date;
};

// 本文から締切らしき日時を推定する（取りこぼしは LLM 側で補う）
export function extractDeadline(text, now = new Date()) {
  if (!text) return null;
  const body = String(text);

  const explicitTime = body.match(/(\d{1,2})\s*[:時]\s*(\d{2})?\s*(?:まで|迄)/);
  const monthDay = body.match(/(\d{1,2})\s*[\/月]\s*(\d{1,2})\s*日?\s*(?:まで|迄|締切|期限)?/);

  if (/本日中|今日中|今日の?中|end of day|eod/i.test(body)) {
    return atHour(now, 18).toISOString();
  }
  if (/明日中|明日まで|明日の/.test(body)) {
    const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);
    return atHour(tomorrow, 18).toISOString();
  }
  if (explicitTime) {
    const hour = Number(explicitTime[1]);
    const minute = Number(explicitTime[2] || 0);
    if (hour <= 23 && minute <= 59) {
      const target = new Date(now);
      target.setHours(hour, minute, 0, 0);
      // すでに過ぎている時刻なら翌日の同時刻とみなす
      if (target.getTime() < now.getTime() - 60 * 60 * 1000) target.setDate(target.getDate() + 1);
      return target.toISOString();
    }
  }
  if (monthDay) {
    const month = Number(monthDay[1]);
    const day = Number(monthDay[2]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const target = new Date(now);
      target.setMonth(month - 1, day);
      target.setHours(18, 0, 0, 0);
      // 年をまたぐ指定（12月に 1/5 など）は翌年扱い
      if (target.getTime() < now.getTime() - 30 * 24 * 3600 * 1000) target.setFullYear(target.getFullYear() + 1);
      return target.toISOString();
    }
  }
  if (/今週中/.test(body)) {
    const daysToFriday = (5 - now.getDay() + 7) % 7;
    const friday = new Date(now.getTime() + daysToFriday * 24 * 3600 * 1000);
    return atHour(friday, 18).toISOString();
  }
  return null;
}

const isVip = (item) => {
  if (!config.vipSenders.length) return false;
  const haystack = [item.from?.name, item.from?.handle, item.from?.email].filter(Boolean).join(' ').toLowerCase();
  return config.vipSenders.some((vip) => haystack.includes(vip));
};

const mentionsMe = (item) => {
  if (item.mentionsMe === true) return true;
  const ids = myIdentifiers();
  if (!ids.length) return false;
  const haystack = `${item.subject || ''} ${item.body || ''}`.toLowerCase();
  return ids.some((id) => haystack.includes(id));
};

/**
 * 1 件の通知に対してルールベースの緊急度を算出する。
 * 戻り値の score は 0〜100。LLM 判定はこの値を基準に補正される。
 */
export function scoreItem(item, now = new Date()) {
  const reasons = [];
  const signals = {};
  const text = `${item.subject || ''}\n${item.body || ''}`;
  const lower = text.toLowerCase();
  let score = 22;

  // 依頼系の語句は重なりやすいので、一番強い 1 つを主とし、2 つ目以降は控えめに加点する
  const positives = [];
  for (const rule of KEYWORD_RULES) {
    const hit = rule.words.find((word) => lower.includes(word.toLowerCase()));
    if (!hit) continue;
    signals[rule.key] = hit;
    reasons.push(`${rule.label}（${hit}）`);
    if (rule.weight < 0) score += rule.weight;
    else positives.push(rule.weight);
  }
  positives.sort((a, b) => b - a);
  score += (positives[0] || 0) + positives.slice(1).reduce((sum, weight) => sum + weight * 0.4, 0);

  if (item.isDirect) {
    score += 16;
    signals.direct = true;
    reasons.push('自分宛のダイレクトな連絡');
  }

  if (mentionsMe(item)) {
    score += 12;
    signals.mention = true;
    reasons.push('自分がメンションされている');
  }

  if (isVip(item)) {
    score += 14;
    signals.vip = true;
    reasons.push(`重要な相手（${item.from?.name || item.from?.handle}）`);
  }

  if (/[?？]/.test(text)) {
    score += 5;
    signals.question = true;
    reasons.push('質問形で返答を求められている');
  }

  if (item.lastMessageFromMe) {
    score -= 25;
    signals.awaitingOther = true;
    reasons.push('最後に発言したのは自分（相手の返信待ち）');
  }

  const receivedAt = item.receivedAt ? new Date(item.receivedAt) : null;
  if (receivedAt && !Number.isNaN(receivedAt.getTime())) {
    const ageHours = (now.getTime() - receivedAt.getTime()) / 3600000;
    signals.ageHours = Math.round(ageHours * 10) / 10;
    if (ageHours > 2 && !item.lastMessageFromMe) {
      const agePoints = Math.min(10, Math.round(ageHours * 0.4));
      score += agePoints;
      if (ageHours >= 24) reasons.push(`${Math.floor(ageHours / 24)}日以上返信できていない`);
      else if (agePoints > 0) reasons.push(`受信から約${Math.round(ageHours)}時間経過`);
    }
  }

  const deadline = item.deadline || extractDeadline(text, now);
  if (deadline) {
    const hoursLeft = (new Date(deadline).getTime() - now.getTime()) / 3600000;
    signals.hoursLeft = Math.round(hoursLeft * 10) / 10;
    if (hoursLeft < 0) {
      score += 26;
      reasons.push('期限を過ぎている');
    } else if (hoursLeft <= 2) {
      score += 26;
      reasons.push('期限まで2時間以内');
    } else if (hoursLeft <= 6) {
      score += 20;
      reasons.push('期限まで6時間以内');
    } else if (hoursLeft <= 24) {
      score += 14;
      reasons.push('期限まで24時間以内');
    } else if (hoursLeft <= 48) {
      score += 8;
      reasons.push('期限まで2日以内');
    }
  }

  if (!item.isDirect && (item.participantCount || 0) > 8 && !signals.mention) {
    score -= 6;
    reasons.push('大人数チャンネルの一般投稿');
  }

  score += SOURCE_WEIGHT[item.source] ?? 0;

  // 私用の予定調整は「今日中」などの語が入っていても最上位（緊急）には上げない。
  // 仕事の重大な影響が絡む場合（impact）はこの抑制を外す。
  if (signals.personal && !signals.impact && score >= LEVELS[0].min) {
    score = LEVELS[0].min - 1;
    reasons.push('私用のため緊急扱いにはしない');
  }

  const finalScore = clamp(Math.round(score));
  const { level, label } = levelOf(finalScore);

  return {
    score: finalScore,
    level,
    levelLabel: label,
    reasons,
    signals,
    deadline: deadline || null,
    triagedBy: 'rules'
  };
}

// 一覧表示の並び順：スコア降順 → 期限が近い順 → 受信が新しい順
export function comparePriority(a, b) {
  const scoreDiff = (b.priority?.score ?? 0) - (a.priority?.score ?? 0);
  if (scoreDiff !== 0) return scoreDiff;

  const deadlineA = a.priority?.deadline ? new Date(a.priority.deadline).getTime() : Infinity;
  const deadlineB = b.priority?.deadline ? new Date(b.priority.deadline).getTime() : Infinity;
  if (deadlineA !== deadlineB) return deadlineA - deadlineB;

  return new Date(b.receivedAt || 0).getTime() - new Date(a.receivedAt || 0).getTime();
}
