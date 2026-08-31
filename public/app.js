// 優先度インボックス — フロントエンド
const SOURCE_ICON = { slack: '💬', gmail: '✉️', notion: '📝', messenger: '📨', demo: '🧪' };
const LEVEL_LABEL = { urgent: '緊急', high: '高', normal: '中', low: '低' };
const POLL_MS = 15000;

const state = {
  items: [],
  summary: {},
  sources: [],
  tones: {},
  allowSend: false,
  filters: { status: 'open', level: '', source: '', q: '' },
  expanded: new Set(),
  cursor: 0,
  notified: new Set(JSON.parse(localStorage.getItem('notifiedIds') || '[]'))
};

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

const api = async (path, options = {}) => {
  const response = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
};

function toast(message, ms = 2600) {
  const el = $('#toast');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    el.hidden = true;
  }, ms);
}

function relativeTime(iso) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 60000;
  if (diff < 1) return 'たった今';
  if (diff < 60) return `${Math.floor(diff)}分前`;
  if (diff < 60 * 24) return `${Math.floor(diff / 60)}時間前`;
  return `${Math.floor(diff / 1440)}日前`;
}

function deadlineTag(deadline) {
  if (!deadline) return '';
  const minutes = (new Date(deadline).getTime() - Date.now()) / 60000;
  if (minutes < 0) return '<span class="tag overdue">⏰ 期限超過</span>';
  if (minutes < 60) return `<span class="tag overdue">⏰ 残り${Math.round(minutes)}分</span>`;
  if (minutes < 60 * 24) return `<span class="tag deadline">⏰ 残り${Math.round(minutes / 60)}時間</span>`;
  return `<span class="tag deadline">⏰ 残り${Math.round(minutes / 1440)}日</span>`;
}

function renderCounters() {
  const counts = state.summary.counts || {};
  $('#counters').innerHTML = ['urgent', 'high', 'normal', 'low']
    .map((level) => `<span class="counter ${level}">${LEVEL_LABEL[level]} <b>${counts[level] || 0}</b></span>`)
    .join('');
}

function renderStatusline() {
  const { lastRefreshedAt, refreshing, progress, errors = [] } = state.summary;
  const parts = [];
  parts.push(refreshing ? `<span class="spin">↻</span> 取り込み中${progress ? `（${progress.done}/${progress.total}）` : ''}` : `最終取り込み: ${lastRefreshedAt ? relativeTime(lastRefreshedAt) : '未実施'}`);
  parts.push(`有効ソース: ${state.sources.filter((source) => source.active).map((source) => source.label).join(' / ') || 'なし'}`);
  if (!state.allowSend) parts.push('送信: 無効（コピー運用）');
  for (const error of errors) parts.push(`<span class="err">⚠️ ${escapeHtml(error.label)}: ${escapeHtml(error.message)}</span>`);
  $('#statusline').innerHTML = parts.map((part) => `<span>${part}</span>`).join('');
}

function renderSourceFilter() {
  const buttons = [{ id: '', label: '全ソース' }, ...state.sources.filter((source) => source.active).map((source) => ({ id: source.id, label: source.label }))];
  $('#source-filter').innerHTML = buttons
    .map((entry) => `<button class="chip ${state.filters.source === entry.id ? 'active' : ''}" data-value="${entry.id}">${escapeHtml(entry.label)}</button>`)
    .join('');
}

function cardHtml(item, index) {
  const level = item.priority?.level || 'low';
  const open = state.expanded.has(item.id);
  const source = state.sources.find((entry) => entry.id === item.source);
  const canSend = state.allowSend && source?.canSend && !item.isDemo;
  const hasSubject = Boolean(item.subject);

  return `
  <article class="card level-${level} ${open ? 'open' : ''} ${item.status === 'done' ? 'done' : ''} ${index === state.cursor ? 'cursor' : ''}" data-id="${escapeHtml(item.id)}" data-index="${index}">
    <div class="card-head" data-action="toggle">
      <div class="score"><b>${item.priority?.score ?? 0}</b><span>${LEVEL_LABEL[level]}</span></div>
      <div class="card-main">
        <div class="card-meta">
          <span>${SOURCE_ICON[item.source] || '📥'} ${escapeHtml(item.sourceLabel)}</span>
          ${item.channel ? `<span>${escapeHtml(item.channel)}</span>` : ''}
          <span>${escapeHtml(item.from?.name || '不明')}</span>
          <span>${relativeTime(item.receivedAt)}</span>
          ${deadlineTag(item.priority?.deadline)}
          ${item.pinned ? '<span class="tag pinned">📌 ピン</span>' : ''}
          ${item.status === 'snoozed' ? `<span class="tag">😴 ${relativeTime(item.snoozedUntil)}後に再表示</span>` : ''}
          ${item.status === 'done' ? '<span class="tag">✅ 完了</span>' : ''}
        </div>
        ${hasSubject ? `<h2 class="card-title">${escapeHtml(item.subject)}</h2>` : ''}
        <p class="card-body ${hasSubject ? '' : 'as-title'}">${escapeHtml(item.body)}</p>
        <div class="reasons">${(item.priority?.reasons || []).map((reason) => `<span class="reason">${escapeHtml(reason)}</span>`).join('')}</div>
      </div>
    </div>

    <div class="card-detail">
      <div class="draft-label">✍️ 返信文案${item.draft?.edited ? '（編集済み）' : ''}${item.draft?.tone && state.tones[item.draft.tone] ? ` — ${escapeHtml(state.tones[item.draft.tone])}` : ''}</div>
      <textarea class="draft" data-action="draft" spellcheck="false">${escapeHtml(item.draft?.text || '')}</textarea>
      ${item.draft?.note ? `<p class="draft-note">💡 ${escapeHtml(item.draft.note)}</p>` : ''}
      <div class="actions">
        <button class="ghost" data-action="copy">📋 コピー</button>
        <select class="tone" data-action="tone">
          ${Object.entries(state.tones).map(([key, label]) => `<option value="${key}">${escapeHtml(label)}</option>`).join('')}
        </select>
        <button class="ghost" data-action="regenerate">🔄 別案を生成</button>
        ${canSend ? '<button class="primary" data-action="send">📤 この内容で送信</button>' : ''}
        <button class="mini" data-action="done">✅ 完了</button>
        <button class="mini" data-action="snooze" data-minutes="60">😴 1時間</button>
        <button class="mini" data-action="snooze" data-minutes="180">😴 3時間</button>
        <button class="mini" data-action="pin">📌 ${item.pinned ? 'ピン解除' : 'ピン留め'}</button>
        ${item.permalink ? `<a class="permalink" href="${escapeHtml(item.permalink)}" target="_blank" rel="noopener">元の場所を開く ↗</a>` : ''}
      </div>
    </div>
  </article>`;
}

function render() {
  renderCounters();
  renderStatusline();
  renderSourceFilter();

  const list = $('#list');
  if (!state.items.length) {
    list.innerHTML = `<div class="empty"><span class="big">🎉</span>対応が必要な連絡はありません</div>`;
    return;
  }
  state.cursor = Math.min(state.cursor, state.items.length - 1);
  list.innerHTML = state.items.map(cardHtml).join('');
}

async function load({ silent = false } = {}) {
  // 入力中に再描画すると編集内容が飛ぶので、フォーカス中はスキップする
  if (silent && document.activeElement?.tagName === 'TEXTAREA') return;

  const params = new URLSearchParams();
  params.set('status', state.filters.status);
  if (state.filters.level) params.set('level', state.filters.level);
  if (state.filters.source) params.set('source', state.filters.source);
  if (state.filters.q) params.set('q', state.filters.q);

  try {
    const data = await api(`/items?${params}`);
    state.items = data.items;
    state.summary = data.summary;
    // 初回だけ最優先の 1 件を開いておく（すぐ返信に取りかかれるように）
    if (!load.initialized && data.items[0]) {
      state.expanded.add(data.items[0].id);
      load.initialized = true;
    }
    render();
    notifyUrgent(data.items);
  } catch (err) {
    if (!silent) toast(`❌ 取得に失敗: ${err.message}`);
  }
}

function notifyUrgent(items) {
  if (Notification?.permission !== 'granted') return;
  const targets = items.filter((item) => item.status === 'open' && item.priority?.level === 'urgent' && !state.notified.has(item.id));
  for (const item of targets.slice(0, 3)) {
    new Notification(`⚡ 緊急 (${item.priority.score}): ${item.from?.name || ''}`, {
      body: `${item.subject || item.body.slice(0, 60)}\n${item.priority.reasons?.[0] || ''}`,
      tag: item.id
    });
    state.notified.add(item.id);
  }
  if (targets.length) localStorage.setItem('notifiedIds', JSON.stringify([...state.notified].slice(-200)));
}

const findCard = (el) => el.closest('.card');
const itemOf = (card) => state.items.find((item) => item.id === card.dataset.id);

let draftTimer = null;
async function saveDraft(card, text) {
  const item = itemOf(card);
  if (!item) return;
  try {
    await api(`/items/${encodeURIComponent(item.id)}/draft`, { method: 'PUT', body: { text } });
    item.draft = { ...(item.draft || {}), text, edited: true };
  } catch (err) {
    toast(`❌ 文案の保存に失敗: ${err.message}`);
  }
}

async function handleAction(action, card, element) {
  const item = itemOf(card);
  if (!item) return;
  const id = encodeURIComponent(item.id);
  const textarea = card.querySelector('textarea.draft');

  switch (action) {
    case 'toggle':
      state.expanded.has(item.id) ? state.expanded.delete(item.id) : state.expanded.add(item.id);
      state.cursor = Number(card.dataset.index);
      render();
      break;

    case 'copy':
      await navigator.clipboard.writeText(textarea.value);
      toast('📋 返信文案をコピーしました');
      break;

    case 'regenerate': {
      const tone = card.querySelector('select.tone')?.value || 'standard';
      element.disabled = true;
      element.textContent = '⏳ 生成中…';
      try {
        const { draft } = await api(`/items/${id}/draft`, { method: 'POST', body: { tone } });
        item.draft = draft;
        render();
        toast('✅ 別案を生成しました');
      } catch (err) {
        toast(`❌ 生成に失敗: ${err.message}`);
        element.disabled = false;
        element.textContent = '🔄 別案を生成';
      }
      break;
    }

    case 'send': {
      if (!confirm(`${item.sourceLabel} の「${item.from?.name}」宛にこの内容を送信します。よろしいですか？`)) return;
      element.disabled = true;
      try {
        await api(`/items/${id}/send`, { method: 'POST', body: { text: textarea.value } });
        toast('📤 送信しました');
        await load();
      } catch (err) {
        toast(`❌ 送信に失敗: ${err.message}`);
        element.disabled = false;
      }
      break;
    }

    case 'done':
      await api(`/items/${id}/status`, { method: 'POST', body: { status: 'done' } });
      state.expanded.delete(item.id);
      toast('✅ 完了にしました');
      await load();
      break;

    case 'snooze':
      await api(`/items/${id}/status`, { method: 'POST', body: { status: 'snoozed', snoozeMinutes: Number(element.dataset.minutes) || 60 } });
      state.expanded.delete(item.id);
      toast('😴 スヌーズしました');
      await load();
      break;

    case 'pin':
      await api(`/items/${id}/pin`, { method: 'POST', body: { pinned: !item.pinned } });
      await load();
      break;
  }
}

$('#list').addEventListener('click', (event) => {
  const element = event.target.closest('[data-action]');
  if (!element || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') return;
  const card = findCard(element);
  if (!card) return;
  handleAction(element.dataset.action, card, element).catch((err) => toast(`❌ ${err.message}`));
});

$('#list').addEventListener('input', (event) => {
  if (event.target.dataset.action !== 'draft') return;
  const card = findCard(event.target);
  clearTimeout(draftTimer);
  draftTimer = setTimeout(() => saveDraft(card, event.target.value), 800);
});

document.querySelectorAll('.filters .filter-group').forEach((group) => {
  group.addEventListener('click', (event) => {
    const chip = event.target.closest('.chip');
    if (!chip) return;
    state.filters[group.dataset.filter] = chip.dataset.value;
    group.querySelectorAll('.chip').forEach((entry) => entry.classList.toggle('active', entry === chip));
    load();
  });
});

let searchTimer = null;
$('#search').addEventListener('input', (event) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.filters.q = event.target.value.trim();
    load();
  }, 300);
});

$('#refresh-btn').addEventListener('click', async (event) => {
  event.target.disabled = true;
  event.target.innerHTML = '<span class="spin">↻</span> 取り込み中';
  try {
    await api('/refresh', { method: 'POST', body: {} });
    await load();
    toast('✅ 最新の連絡を取り込みました');
  } catch (err) {
    toast(`❌ 取り込みに失敗: ${err.message}`);
  } finally {
    event.target.disabled = false;
    event.target.textContent = '↻ 取り込み';
  }
});

$('#notify-btn').addEventListener('click', async () => {
  const permission = await Notification.requestPermission();
  toast(permission === 'granted' ? '🔔 緊急の連絡を通知します' : '⚠️ 通知が許可されませんでした');
  updateNotifyButton();
});

function updateNotifyButton() {
  const button = $('#notify-btn');
  if (!('Notification' in window)) return button.remove();
  if (Notification.permission === 'granted') {
    button.textContent = '🔔 通知ON';
    button.disabled = true;
  }
}

document.addEventListener('keydown', (event) => {
  const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
  if (event.key === '/' && !typing) {
    event.preventDefault();
    return $('#search').focus();
  }
  if (typing) {
    if (event.key === 'Escape') document.activeElement.blur();
    return;
  }

  const card = () => document.querySelector(`.card[data-index="${state.cursor}"]`);
  const move = (delta) => {
    state.cursor = Math.max(0, Math.min(state.items.length - 1, state.cursor + delta));
    render();
    card()?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };

  switch (event.key.toLowerCase()) {
    case 'j': move(1); break;
    case 'k': move(-1); break;
    case 'enter': card() && handleAction('toggle', card(), card()); break;
    case 'c': card() && handleAction('copy', card(), card()); break;
    case 'e': card() && handleAction('done', card(), card()); break;
    case 's': {
      const target = card();
      if (target) {
        const fake = document.createElement('button');
        fake.dataset.minutes = '60';
        handleAction('snooze', target, fake);
      }
      break;
    }
    case 'r': $('#refresh-btn').click(); break;
  }
});

async function boot() {
  updateNotifyButton();
  try {
    const meta = await api('/sources');
    state.sources = meta.sources;
    state.tones = meta.tones;
    state.allowSend = meta.allowSend;
  } catch (err) {
    toast(`❌ 初期化に失敗: ${err.message}`);
  }
  await load();
  setInterval(() => load({ silent: true }), POLL_MS);
}

boot();
