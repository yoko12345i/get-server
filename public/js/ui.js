/* ============================================================
   UNDERCURRENT — 共通コンポーネント
   ============================================================ */

import { BRAND, AXES, KINDS, me, getCreator, contribution } from './data.js';
import { signatureSVG } from './signature.js';

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

export const yen = (n) => '¥' + n.toLocaleString('ja-JP');

export const qs = (k) => new URLSearchParams(location.search).get(k);

/** 「2026.03」→「2026年3月」 */
export function jaMonth(s) {
  const [y, m] = s.split('.');
  return `${y}年${Number(m)}月`;
}

/** 支援開始からの経過月数 */
export function monthsSince(s, now = '2027.03') {
  const [y1, m1] = s.split('.').map(Number);
  const [y2, m2] = now.split('.').map(Number);
  return (y2 - y1) * 12 + (m2 - m1);
}

/* ---------------- chrome ---------------- */

export function chrome(page) {
  const nav = [
    ['creators', '/creators', 'Creators'],
    ['experiences', '/experiences', 'Experiences'],
    ['lab', '/lab', 'Lab']
  ];

  return `
<div class="protobar">
  <div class="wrap protobar__inner">
    <strong>PROTOTYPE</strong>
    <span>登場する人物・店舗・数値・履歴はすべて架空のものです</span>
    <span>${esc(BRAND.operator)}</span>
  </div>
</div>
<header class="masthead">
  <div class="wrap masthead__inner">
    <a class="brandmark" href="/">
      <span class="brandmark__word">Undercurrent</span>
      <span class="brandmark__sub">表に出る前の、味の話</span>
    </a>
    <nav class="nav">
      ${nav
        .map(
          ([id, href, label]) =>
            `<a href="${href}"${page === id ? ' aria-current="page"' : ''}>${label}</a>`
        )
        .join('')}
      <a class="nav__me" href="/me"${page === 'me' ? ' aria-current="page"' : ''}>${esc(me.name)}</a>
    </nav>
  </div>
</header>`;
}

export function footer() {
  return `
<footer class="foot">
  <div class="wrap foot__grid">
    <div class="stack">
      <p class="brandmark__word" style="margin:0">Undercurrent</p>
      <p class="small" style="max-width:34ch">${esc(BRAND.tagline)}<br>${esc(BRAND.taglineJa)}</p>
      <p class="small mono" style="margin-top:18px">${esc(BRAND.operator)}</p>
    </div>
    <div>
      <p class="label" style="margin-bottom:12px">Explore</p>
      <a href="/creators">Discover Creators</a>
      <a href="/experiences">Experiences</a>
      <a href="/table">Creator's Table</a>
      <a href="/lab">COLDRAW Lab</a>
    </div>
    <div>
      <p class="label" style="margin-bottom:12px">You</p>
      <a href="/me">My Record</a>
      <a href="/share?creator=mori">Shareable Record</a>
      <a href="/docs/01-strategy.md">事業設計ドキュメント</a>
      <a href="/docs/02-information-architecture.md">情報設計</a>
      <a href="/docs/03-design-language.md">デザイン言語</a>
    </div>
  </div>
</footer>`;
}

/* ---------------- pieces ---------------- */

export function sig(creator, size, opt = {}) {
  return `<div class="fx" style="width:${size};height:${size}">${signatureSVG(
    creator.taste,
    creator.hue,
    creator.id,
    opt
  )}</div>`;
}

export function axesBlock(taste, onDark = false) {
  return `<div class="axes${onDark ? ' axes--onDark' : ''}">
    ${AXES.map((a) => {
      const v = taste[a.key];
      return `<div class="axis">
        <span class="axis__k">${a.en} / ${a.ja}</span>
        <span class="axis__track"><i class="axis__dot" style="left:${v}%"></i></span>
        <span class="axis__v">${v}</span>
      </div>`;
    }).join('')}
  </div>`;
}

export function kindTag(kind) {
  const k = KINDS[kind];
  return `<span class="kind ${k.cls}">${k.en}</span>`;
}

export function stat(n, k) {
  return `<div class="stat"><span class="stat__n">${n}</span><span class="stat__k">${k}</span></div>`;
}

/** Register Entry —— このサービスで最も重要な組版 */
export function recordCard(p, opt = {}) {
  const c = getCreator(p.creatorId);
  const rows = [
    ['Supporting since', jaMonth(p.since)],
    ['Experiences', p.exp],
    ['Introduced', `${p.intro} people`],
    ['Prototype tastings', p.proto],
    ['Recipes co-created', p.recipes]
  ].filter(([, v]) => v !== 0 || opt.showZero);

  return `<div class="record${opt.dark ? ' record--dark' : ''}">
    <p class="label">${esc(c.discipline)} · ${esc(c.base)}</p>
    <p class="record__name" style="margin-top:10px">${esc(c.name)}</p>
    ${p.no ? `<p class="record__no">Founding Supporter No. ${String(p.no).padStart(3, '0')}</p>` : ''}
    <div class="record__rule"></div>
    <dl class="record__rows">
      ${rows
        .map(
          ([k, v]) => `<div class="record__row"><dt>${k}</dt><dd>${esc(v)}</dd></div>`
        )
        .join('')}
    </dl>
  </div>`;
}

/** Supporter Register。順位番号は振らない（docs/02 §3.7） */
export function registerTable(creator, limit = 99) {
  const rows = creator.register
    .slice()
    .sort((a, b) => contribution(b) - contribution(a))
    .slice(0, limit);

  return `<div class="register">
    <div class="register__head">
      <span>Supporter</span><span>Since</span><span>Experiences</span><span>Introduced</span>
    </div>
    ${rows
      .map(
        (r) => `<div class="register__row${r.me ? ' register__row--me' : ''}">
        <div>
          <p class="register__name">${esc(r.name)}${r.me ? ' <span class="small">— あなた</span>' : ''}</p>
          ${r.no ? `<p class="register__no">Founding No. ${String(r.no).padStart(3, '0')}</p>` : ''}
        </div>
        <span class="register__cell mono" data-k="since">${r.since}</span>
        <span class="register__cell mono" data-k="exp">${r.exp}</span>
        <span class="register__cell mono" data-k="intro">${r.intro}</span>
      </div>`
      )
      .join('')}
  </div>`;
}

export function experienceRow(x) {
  const c = x.creatorId ? getCreator(x.creatorId) : null;
  const full = x.taken >= x.seats;
  const right = full ? '満席' : `残席 ${x.seats - x.taken} / ${x.seats}`;
  return `<a class="item" href="/experience?id=${x.id}">
    <span class="item__when">${x.date}</span>
    <span>
      <span class="item__title">${esc(x.title)}</span>
      <p class="item__sub">${kindTag(x.kind)} ${c ? '&nbsp;' + esc(c.name) : ''} &nbsp;·&nbsp; ${esc(x.place)}</p>
    </span>
    <span class="item__right">${right}</span>
  </a>`;
}

/** 発行数のドット表示。プログレスバーにしない */
export function issuance(issued, cap) {
  const dots = Math.min(cap, 40);
  const on = Math.round((issued / cap) * dots);
  return `<div class="issuance">${Array.from({ length: dots }, (_, i) => `<i class="${i < on ? 'on' : ''}"></i>`).join('')}</div>
    <p class="small mono" style="margin-top:10px">${issued} issued / ${cap} maximum</p>`;
}

export function mount(page, html) {
  document.body.innerHTML = chrome(page) + `<main>${html}</main>` + footer();
}
