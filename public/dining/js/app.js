/**
 * COLDRAW Executive Dining Network — prototype application
 *
 * 検証したいのは一つだけ:
 *   「連日会食する人が、飲まなくても最高の会食を選べる」と感じ、
 *    その場で "Share with my assistant" を押すか。
 */

import {
  RESTAURANTS, AREAS, CUISINES, BUDGETS, OCCASIONS, CONSTRAINTS,
  byId, yen, priceLabel, areaLabel, occasionLabel, constraintLabel,
  matchRestaurants, assessConstraints
} from './data.js';
import { art } from './art.js';
import * as store from './store.js';

const app = document.getElementById('app');

/* ---------- utilities ---------------------------------------------------- */

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const go = (hash) => { location.hash = hash; };

function dayLabel(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const w = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
  const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
  return `${w} ${d.getDate()} ${m}`;
}

const DATE_OPTIONS = [
  { id: 'tonight', label: 'Tonight', sub: dayLabel(0) },
  { id: 'tomorrow', label: 'Tomorrow', sub: dayLabel(1) },
  { id: 'd2', label: dayLabel(2), sub: 'In two days' },
  { id: 'week', label: 'This week', sub: 'Flexible' }
];

const dateLabel = (id) => {
  const o = DATE_OPTIONS.find((d) => d.id === id);
  return o ? (o.sub && o.sub !== 'Flexible' && o.sub !== 'In two days' ? `${o.label} · ${o.sub}` : o.label) : 'Flexible';
};

let toastTimer;
function toast(msg) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

/* ---------- shared query draft ------------------------------------------ */

const defaultQuery = () => ({
  area: null,
  date: 'tomorrow',
  party: 4,
  privateRoom: true,
  budget: 'b30',
  cuisine: null,
  pairing: true,
  occasion: 'client'
});

let draft = store.get().query ? { ...defaultQuery(), ...store.get().query } : defaultQuery();

function querySummary(q) {
  const bits = [
    q.area ? areaLabel(q.area) : 'Any area',
    `${q.party} guests`,
    q.privateRoom ? 'Private room' : 'Any seating',
    (BUDGETS.find((b) => b.id === q.budget) || {}).label || 'Any budget'
  ];
  if (q.cuisine) bits.push((CUISINES.find((c) => c.id === q.cuisine) || {}).label);
  return bits.join(' · ');
}

function candidatesFor(q) {
  return matchRestaurants(q).filter((m) => m.blockers.length === 0).slice(0, 4);
}

/* ---------- chrome ------------------------------------------------------- */

function topbar(opts = {}) {
  return `
  <header class="topbar">
    ${opts.back ? `<button class="iconbtn" data-nav="${esc(opts.back)}" aria-label="Back">‹</button>` : ''}
    <div class="wordmark">Coldraw<small>Executive Dining Network</small></div>
    <div class="spacer"></div>
    ${opts.right || `<button class="iconbtn" data-nav="#/ask" aria-label="Ask">?</button>`}
  </header>`;
}

function tabbar(active) {
  const tabs = [
    { id: 'home', href: '#/', ic: '◇', label: 'Home' },
    { id: 'find', href: '#/find', ic: '✧', label: 'Find' },
    { id: 'ask', href: '#/ask', ic: '＝', label: 'Ask' },
    { id: 'you', href: '#/you', ic: '○', label: 'You' }
  ];
  return `<nav class="tabbar">${tabs.map((t) => `
    <a data-nav="${t.href}" class="${active === t.id ? 'on' : ''}">
      <span class="ic">${t.ic}</span>${t.label}
    </a>`).join('')}</nav>`;
}

const chip = (label, on, act, extra = '') =>
  `<button class="chip ${on ? 'on' : ''}" data-act="${act}" ${extra}><span class="tick">✓</span>${esc(label)}</button>`;

/* ---------- restaurant fragments ---------------------------------------- */

// A drawn abstract would read as a portrait of a person who does not exist.
// Initials are the honest placeholder.
const monogram = (name, palette) =>
  `<span class="mono" style="background:${palette[0]};color:${palette[2]}">${esc(name.split(' ').map((w) => w[0]).join(''))}</span>`;

function cardArt(r, kind, cls = 'card-art', inner = '') {
  return `<div class="${cls}">${art(kind, r.palette, r.id)}${inner}</div>`;
}

function resultCard(m, index) {
  const r = m.restaurant;
  const rank = index === 0 ? 'Best fit' : index === 1 ? 'Also strong' : 'Worth holding';
  return `
  <article class="card" data-nav="#/r/${r.id}">
    ${cardArt(r, r.photos[0], 'card-art', `
      <span class="rank">${rank}</span>
      <span class="flag">◈ ${r.pairing.courses}-glass non-alcohol pairing</span>`)}
    <div class="card-body">
      <h3 class="card-title">${esc(r.name)}</h3>
      <p class="card-meta"><b>${esc(r.cuisine)}</b> · ${esc(r.areaLabel)} · ${priceLabel(r)}</p>
      <ul class="reasons">
        <li>${esc(r.why[0])}</li>
        ${m.reasons.slice(0, 2).map((x) => `<li>${esc(x)}</li>`).join('')}
        ${m.blockers.map((x) => `<li class="blocker">${esc(x)}</li>`).join('')}
      </ul>
      <div class="tagrow">
        ${r.attributes.privateRoom ? '<span class="tag">Private room</span>' : '<span class="tag">Counter</span>'}
        <span class="tag">${r.attributes.quiet >= 4 ? 'Quiet' : 'Conversational'}</span>
        ${r.attributes.english >= 4 ? '<span class="tag">English</span>' : ''}
        ${r.attributes.pairing === 5 ? '<span class="tag gold">Pairing · exceptional</span>' : ''}
      </div>
    </div>
  </article>`;
}

function miniCard(r) {
  return `
  <article class="mini-card" data-nav="#/r/${r.id}">
    <div class="m-art">${art(r.photos[0], r.palette, r.id)}</div>
    <div class="m-body">
      <div class="m-name">${esc(r.name)}</div>
      <div class="m-meta">${esc(r.cuisine)} · ${esc(r.areaLabel)}</div>
      <div class="m-meta">${r.pairing.courses} glasses · ${yen(r.pairing.price)}</div>
    </div>
  </article>`;
}

/* ========================================================================= */
/*  1. Executive Home                                                        */
/* ========================================================================= */

function screenHome() {
  const s = store.get();
  const featured = [byId('koan'), byId('soji'), byId('ardoise')];
  const presets = [
    { label: 'Ginza · 4 · private room', q: { area: 'ginza', party: 4, privateRoom: true, budget: 'b30' } },
    { label: 'Marunouchi · 2 · after a late meeting', q: { area: 'marunouchi', party: 2, privateRoom: false, budget: 'b20' } },
    { label: 'Azabudai · 6 · overseas guests', q: { area: 'azabudai', party: 6, privateRoom: true, budget: 'b30', occasion: 'international' } }
  ];

  return `
  ${topbar({ right: `<button class="iconbtn" data-nav="#/you" aria-label="You">○</button>` })}

  <section class="hero">
    ${art('glass', ['#17150F', '#5C4A2E', '#C6A874'], 'hero-main')}
    <div class="hero-inner">
      <p class="eyebrow">Tokyo · Kyoto</p>
      <h1 class="display lg">Tomorrow matters.<br>Dinner should still<br>be extraordinary.</h1>
      <p class="lede" style="margin-top:16px;max-width:31ch">
        Restaurants we would put an important guest in tonight — where the non-alcohol pairing
        is written to the same standard as the wine list.
      </p>
      <div class="hero-stat">
        <div><b>8</b><span>Houses</span></div>
        <div><b>5</b><span>Districts</span></div>
        <div><b>4–9</b><span>Glasses, no alcohol</span></div>
      </div>
    </div>
  </section>

  <div class="pad" style="padding-top:24px">
    <button class="btn" data-nav="#/find">Find a dinner</button>
    <div style="height:10px"></div>
    <button class="btn ghost" data-nav="#/ask">Ask about a restaurant</button>
  </div>

  <div class="pad">
    <div class="section-head"><span class="eyebrow">Dinner tomorrow?</span></div>
    <p class="small" style="margin:-4px 0 12px">Three taps, no forms.</p>
    <div class="suggests">
      ${presets.map((p, i) => `<button class="suggest" data-act="preset:${i}">${esc(p.label)} →</button>`).join('')}
    </div>
  </div>

  <div class="section-head pad"><span class="eyebrow">Selected this season</span><a data-nav="#/find">All →</a></div>
  <div class="scrollrail">${featured.map(miniCard).join('')}</div>

  <div class="pad">
    <hr class="rule">
    <h2 class="section">How a house gets onto this list</h2>
    <p class="lede">
      We keep the list short on purpose. A house is added only when a dinner can carry weight
      there — the cooking, the room, the service, and the discretion — and when a guest who is
      not drinking is served with the same intent as one who is.
    </p>
    <ul class="reasons" style="margin-top:14px">
      <li>Cooking and service at a level that honours the guest</li>
      <li>A room where a real conversation is possible</li>
      <li>A non-alcohol pairing designed course by course, not a list of soft drinks</li>
      <li>Ingredient questions answered in writing, not waved away</li>
    </ul>
    <hr class="rule">
    <p class="tiny">
      Behind several of these pairings is a COLDRAW Brewer — low-temperature, reduced-pressure
      extraction — and the Nature Cocktails made on it by each kitchen. It is part of how the
      glass reaches this level, not the reason to go.
    </p>
    ${s.dinners.length ? `
    <hr class="rule">
    <div class="section-head" style="margin-top:0"><span class="eyebrow">After your last dinner</span></div>
    <button class="btn ghost" data-nav="#/post/${esc(s.dinners[0].id)}">${esc(byId(s.dinners[0].id).name)} — how was it?</button>` : ''}
    <div style="height:20px"></div>
  </div>

  ${tabbar('home')}`;
}

/* ========================================================================= */
/*  2. Find a Dinner                                                         */
/* ========================================================================= */

function screenFind() {
  const q = draft;
  const n = candidatesFor(q).length;

  return `
  ${topbar({ back: '#/' })}
  <div class="pad" style="padding-top:8px">
    <p class="eyebrow">Find a dinner</p>
    <h1 class="display">Where are you<br>hosting?</h1>
    <p class="small" style="margin-top:10px">Everything below is optional. Skip to the bottom whenever you like.</p>
    <hr class="rule">

    <div class="field">
      <label class="eyebrow">Area</label>
      <div class="chips">
        ${AREAS.map((a) => chip(a.label, q.area === a.id, `area:${a.id}`)).join('')}
        ${chip('Anywhere', !q.area, 'area:')}
      </div>
    </div>

    <div class="field">
      <label class="eyebrow">Date</label>
      <div class="chips">
        ${DATE_OPTIONS.map((d) => chip(d.label, q.date === d.id, `date:${d.id}`)).join('')}
      </div>
    </div>

    <div class="field">
      <label class="eyebrow">Party</label>
      <div class="stepper">
        <button data-act="party:-1" aria-label="Fewer">−</button>
        <div class="val">${q.party} <span>guests</span></div>
        <button data-act="party:1" aria-label="More">+</button>
      </div>
    </div>

    <div class="field">
      <label class="eyebrow">Budget per guest</label>
      <div class="chips">
        ${BUDGETS.map((b) => chip(b.label, q.budget === b.id, `budget:${b.id}`)).join('')}
      </div>
    </div>

    <div class="field">
      <label class="eyebrow">Cuisine <span style="text-transform:none;letter-spacing:0;font-weight:400">— optional</span></label>
      <div class="chips">
        ${CUISINES.map((c) => chip(c.label, q.cuisine === c.id, `cuisine:${c.id}`)).join('')}
        ${chip('No preference', !q.cuisine, 'cuisine:')}
      </div>
    </div>

    <div class="field">
      <label class="eyebrow">Occasion <span style="text-transform:none;letter-spacing:0;font-weight:400">— optional</span></label>
      <div class="chips">
        ${OCCASIONS.map((o) => chip(o.label, q.occasion === o.id, `occ:${o.id}`)).join('')}
      </div>
    </div>

    <div class="switch-row">
      <div>
        <div style="font-size:14px;font-weight:600">Private room</div>
        <div class="tiny">A room where the conversation stays at the table</div>
      </div>
      <button class="switch ${q.privateRoom ? 'on' : ''}" data-act="toggle:privateRoom" aria-label="Private room"></button>
    </div>

    <div class="switch-row" style="border-bottom:1px solid var(--rule-soft)">
      <div>
        <div style="font-size:14px;font-weight:600">Non-alcohol pairing</div>
        <div class="tiny">Prioritise houses where the glass is designed with the menu</div>
      </div>
      <button class="switch ${q.pairing ? 'on' : ''}" data-act="toggle:pairing" aria-label="Non-alcohol pairing"></button>
    </div>

    <div style="height:24px"></div>
  </div>

  <div class="actionbar">
    <button class="btn" data-act="search">Show ${n} ${n === 1 ? 'house' : 'houses'}</button>
  </div>`;
}

/* ========================================================================= */
/*  3. Search Results                                                        */
/* ========================================================================= */

function screenResults() {
  const q = draft;
  const matches = candidatesFor(q);
  store.update((s) => { s.query = q; });

  if (!matches.length) {
    return `${topbar({ back: '#/find' })}
    <div class="empty"><span class="ic">◇</span>
      <p class="lede">Nothing on the list fits these conditions.<br>Widen the area or the party size.</p>
      <div style="height:18px"></div>
      <button class="btn ghost" data-nav="#/find">Adjust</button>
    </div>`;
  }

  return `
  ${topbar({ back: '#/find' })}
  <div class="pad" style="padding-top:8px">
    <p class="eyebrow">${matches.length} houses · ${esc(dateLabel(q.date))}</p>
    <h1 class="display sm" style="margin-top:8px">${esc(querySummary(q))}</h1>
    <button class="btn quiet sm" data-nav="#/find" style="padding-left:0;margin-top:4px">Change conditions</button>
    <hr class="rule tight">
  </div>
  <div class="pad">
    ${matches.map(resultCard).join('')}
    <p class="tiny" style="margin-top:4px">
      Ordered by fit for this dinner, not by popularity. Nothing on this list pays to appear.
    </p>
    <div style="height:20px"></div>
  </div>
  <div class="actionbar">
    <button class="btn ghost" data-nav="#/ask">Ask</button>
    <button class="btn" data-act="share-set">Share with my assistant</button>
  </div>`;
}

/* ========================================================================= */
/*  4. Restaurant Detail                                                     */
/* ========================================================================= */

// Re-renders (save, follow) must not inflate the instrumentation.
let lastViewed = null;
let lastBriefOpened = null;

function screenDetail(id) {
  const r = byId(id);
  if (!r) return notFound();
  if (lastViewed !== id) { store.track('view_restaurant', { id }); lastViewed = id; }
  const following = store.isFollowing(r.id);
  const saved = store.isSaved(r.id);

  return `
  <div class="detail-hero">
    ${art(r.photos[0], r.palette, r.id)}
    <button class="back" data-act="back" aria-label="Back">‹</button>
  </div>

  <div class="detail-title">
    <h1>${esc(r.name)}</h1>
    <div class="ja">${esc(r.nameJa)}</div>
    <div class="detail-facts">
      <span>${esc(r.cuisine)}</span>
      <span>${esc(r.areaLabel)}</span>
      <span>${r.attributes.privateRoom ? 'Private room available' : 'Counter, bookable whole'}</span>
      <span>${priceLabel(r)}</span>
    </div>
  </div>

  <div style="height:24px"></div>
  <div class="why">
    <p class="eyebrow" style="margin-bottom:10px">Why we selected it</p>
    ${r.why.map((w) => `<p>${esc(w)}</p>`).join('')}
  </div>

  <div class="block">
    <div class="pairing-head">
      <b>Non-alcohol pairing</b>
      <span>${r.pairing.courses} glasses · ${yen(r.pairing.price)}</span>
    </div>
    <p class="small" style="margin:12px 0 6px">${esc(r.pairing.note)}</p>
    <ul class="glasses">
      ${r.pairing.glasses.map((g, i) => `
        <li>
          <div class="n">${String(i + 1).padStart(2, '0')}</div>
          <div>
            <div class="g-name">${esc(g.name)}</div>
            <div class="g-base">${esc(g.base)}</div>
            <div class="g-note">${esc(g.note)}</div>
          </div>
        </li>`).join('')}
    </ul>
  </div>

  <div class="block">
    <div style="display:flex;gap:10px">
      <div style="flex:1;position:relative;aspect-ratio:4/5;background:var(--deep)">${art('dish', r.palette, r.id + 'b')}</div>
      <div style="flex:1;position:relative;aspect-ratio:4/5;background:var(--deep)">${art('glass', r.palette, r.id + 'c')}</div>
    </div>
    <p class="tiny" style="margin-top:8px">The plate and the glass are built together, course by course.</p>
  </div>

  <div class="block">
    <h2 class="section">Best for</h2>
    <div class="chips">
      ${r.bestFor.map((b) => `<span class="tag solid">${esc(occasionLabel(b))}</span>`).join('')}
      <span class="tag solid">Guests not drinking tonight</span>
    </div>
  </div>

  <div class="block">
    <h2 class="section">Practical</h2>
    <ul class="specs">
      <li><span class="k">Private room</span><span class="v">${esc(r.practical.privateRooms)}</span></li>
      <li><span class="k">Noise</span><span class="v">${esc(r.practical.noise)}</span></li>
      <li><span class="k">Seating</span><span class="v">${esc(r.practical.seating)}</span></li>
      <li><span class="k">English</span><span class="v">${esc(r.practical.english)}</span></li>
      <li><span class="k">Dietary</span><span class="v">${esc(r.practical.dietary)}</span></li>
      <li><span class="k">Nearest</span><span class="v">${esc(r.practical.station)}</span></li>
    </ul>
  </div>

  <div class="block">
    <h2 class="section">Ingredients &amp; dietary</h2>
    <p class="small">Written disclosure, per course and per glass — for a guest with a restriction you cannot get wrong.</p>
    <div style="height:12px"></div>
    <button class="btn ghost" data-nav="#/r/${r.id}/dietary">Open ingredient disclosure</button>
  </div>

  <div class="block">
    <h2 class="section">The kitchen</h2>
    <div class="chef-row" style="border-bottom:0">
      <div class="chef-av">${monogram(r.chef.name, r.palette)}</div>
      <div style="flex:1">
        <div class="chef-name">${esc(r.chef.name)}</div>
        <div class="chef-meta">${esc(r.chef.title)} · since ${r.chef.since}</div>
      </div>
      <button class="btn sm ${following ? '' : 'ghost'}" data-act="follow:${r.id}">${following ? 'Following' : 'Follow'}</button>
    </div>
    <p class="small" style="margin-top:6px">${esc(r.chef.bio)}</p>
  </div>

  <div class="block">
    <div class="notice">
      <b>COLDRAW</b> — ${esc(r.coldraw)} Low-temperature, reduced-pressure extraction is one of the
      reasons the glass can hold its own next to the plate.
    </div>
    <div class="verify-line">Disclosure last verified ${esc(r.disclosure.lastVerified)}</div>
    <div style="height:16px"></div>
    <button class="btn quiet sm" data-act="save:${r.id}" style="padding-left:0">${saved ? '✓ Saved' : 'Save for later'}</button>
  </div>

  <div style="height:26px"></div>

  <div class="actionbar">
    <button class="btn ghost" data-act="request:${r.id}">Request</button>
    <button class="btn" data-act="share-one:${r.id}">Share with my assistant</button>
  </div>`;
}

/* ========================================================================= */
/*  5. Share with Assistant                                                  */
/* ========================================================================= */

let shareDraft = null;

function buildShareDraft(ids) {
  const p = store.get().profile;
  const query = { ...draft };

  // Sharing a single house from its own page: the brief must describe that
  // house, not whatever search happened to be in the box beforehand.
  if (ids.length === 1) {
    const r = byId(ids[0]);
    query.area = r.area;
    query.party = Math.min(Math.max(query.party, r.capacity.min), r.capacity.max);
    query.privateRoom = query.privateRoom && r.attributes.privateRoom;
  }

  return {
    token: store.token(),
    createdAt: Date.now(),
    from: { name: p.execName, title: p.execTitle },
    to: p.assistantName,
    query,
    candidates: ids,
    time: '19:00',
    note: '',
    status: 'sent'
  };
}

function briefText(b) {
  const q = b.query;
  const lines = [
    `Dinner — ${dateLabel(q.date)} ${b.time}`,
    `${q.party} guests · ${q.area ? areaLabel(q.area) : 'area open'} · ${q.privateRoom ? 'private room' : 'any seating'} · ${(BUDGETS.find((x) => x.id === q.budget) || {}).label || 'budget open'}`,
    `One guest is not drinking — every house below has a full non-alcohol pairing.`,
    '',
    'Candidates:'
  ];
  b.candidates.forEach((id, i) => {
    const r = byId(id);
    lines.push(`${i + 1}. ${r.name} — ${r.cuisine}, ${r.areaLabel}, ${priceLabel(r)}`);
    lines.push(`   ${r.pairing.courses}-glass non-alcohol pairing ${yen(r.pairing.price)} · ${r.practical.privateRooms}`);
    lines.push(`   ${r.why[0]}`);
  });
  if (b.note) lines.push('', `Note: ${b.note}`);
  lines.push('', `Open the full brief: ${location.origin}${location.pathname}#/brief/${b.token}`);
  return lines.join('\n');
}

function screenShare() {
  const b = shareDraft;
  if (!b) { go('#/'); return ''; }
  const q = b.query;

  return `
  ${topbar({ back: '#/results' })}
  <div class="pad" style="padding-top:8px">
    <p class="eyebrow">Share with my assistant</p>
    <h1 class="display sm" style="margin-top:8px">Everything ${esc(b.to)} needs,<br>in one message.</h1>
    <hr class="rule tight">
  </div>

  <div class="pad">
    <div class="brief">
      <div class="brief-head">
        <p class="eyebrow">Dinner brief</p>
        <h3>${esc(dateLabel(q.date))} · ${esc(b.time)}</h3>
      </div>
      <div class="brief-line"><span class="k">Party</span><span class="v">${q.party} guests</span></div>
      <div class="brief-line"><span class="k">Area</span><span class="v">${esc(q.area ? areaLabel(q.area) : 'Open')}</span></div>
      <div class="brief-line"><span class="k">Room</span><span class="v">${q.privateRoom ? 'Private room required' : 'Any seating'}</span></div>
      <div class="brief-line"><span class="k">Budget</span><span class="v">${esc((BUDGETS.find((x) => x.id === q.budget) || {}).label || 'Open')} per guest</span></div>
      <div class="brief-line"><span class="k">Note</span><span class="v">One guest is not drinking. Every candidate has a full non-alcohol pairing.</span></div>

      <div style="height:8px"></div>
      <p class="eyebrow">Candidates</p>
      ${b.candidates.map((id) => {
        const r = byId(id);
        return `
        <div class="candidate">
          <div class="thumb">${art(r.photos[0], r.palette, r.id)}</div>
          <div style="flex:1">
            <div class="c-name">${esc(r.name)}</div>
            <div class="c-meta">${esc(r.cuisine)} · ${esc(r.areaLabel)} · ${priceLabel(r)}</div>
            <div class="c-why">${esc(r.why[0])}</div>
          </div>
        </div>`;
      }).join('')}
    </div>

    <div style="height:22px"></div>

    <div class="field">
      <label class="eyebrow">Time</label>
      <input class="textinput" data-field="time" value="${esc(b.time)}" placeholder="19:00">
    </div>

    <div class="field">
      <label class="eyebrow">Anything ${esc(b.to)} should know</label>
      <textarea class="textinput" data-field="note" placeholder="The guest avoids shellfish. Please hold 19:00 at the first two.">${esc(b.note)}</textarea>
    </div>

    <p class="eyebrow" style="margin-bottom:10px">Send by</p>
    <div class="channels">
      <button class="channel" data-act="send:line"><span class="ic">▤</span><span class="lb">LINE</span></button>
      <button class="channel" data-act="send:email"><span class="ic">✉</span><span class="lb">Email</span></button>
      <button class="channel" data-act="send:link"><span class="ic">⧉</span><span class="lb">Copy link</span></button>
    </div>

    <div style="height:16px"></div>
    <p class="tiny">Your assistant opens a working page — conditions, candidates, the reason each was
    chosen, and a booking request line. No account needed.</p>
    <div style="height:24px"></div>
  </div>`;
}

/* ========================================================================= */
/*  6. Assistant View                                                        */
/* ========================================================================= */

function compareRow(label, values) {
  return `<tr><th>${esc(label)}</th>${values.map((v) => `<td>${esc(v)}</td>`).join('')}</tr>`;
}

function screenBrief(tok) {
  const b = store.briefByToken(tok);
  if (!b) return notFound('This brief is not on this device. Open the link that was shared with you, or send one from Share.');
  if (lastBriefOpened !== tok) { store.track('brief_opened', { token: tok }); lastBriefOpened = tok; }
  const q = b.query;
  const rs = b.candidates.map(byId);

  return `
  <div class="role-note">Assistant view · shared by <b>${esc(b.from.name)}</b></div>
  ${topbar({ back: '#/you' })}

  <div class="pad" style="padding-top:8px">
    <p class="eyebrow">Dinner brief · ${esc(b.token)}</p>
    <h1 class="display sm" style="margin-top:8px">${esc(dateLabel(q.date))} · ${esc(b.time)}<br>${q.party} guests</h1>
    <div class="detail-facts" style="margin-top:12px">
      <span>${esc(q.area ? areaLabel(q.area) : 'Area open')}</span>
      <span>${q.privateRoom ? 'Private room' : 'Any seating'}</span>
      <span>${esc((BUDGETS.find((x) => x.id === q.budget) || {}).label || 'Budget open')} per guest</span>
    </div>
    ${b.note ? `<div class="notice" style="margin-top:16px"><b>From ${esc(b.from.name)}:</b> ${esc(b.note)}</div>` : ''}
    <div class="notice" style="margin-top:12px">
      <b>Standing requirement:</b> one guest is not drinking. Every candidate below serves a full
      non-alcohol pairing, so the table is not split.
    </div>
    <hr class="rule">
  </div>

  <div class="pad">
    <h2 class="section">At a glance</h2>
  </div>
  <div style="overflow-x:auto;padding:0 var(--gut) 4px">
    <table style="border-collapse:collapse;font-size:12.5px;min-width:100%">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px 10px 8px 0;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-mute);font-weight:600"></th>
          ${rs.map((r) => `<th style="text-align:left;padding:8px 14px 8px 0;font-family:var(--serif);font-weight:400;font-size:15px;white-space:nowrap">${esc(r.name)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${[
          ['Price / guest', rs.map((r) => priceLabel(r))],
          ['Private room', rs.map((r) => (r.attributes.privateRoom ? 'Yes' : 'Counter only'))],
          ['Takes', rs.map((r) => `${r.capacity.min}–${r.capacity.max}`)],
          ['Pairing', rs.map((r) => `${r.pairing.courses} glasses · ${yen(r.pairing.price)}`)],
          ['Noise', rs.map((r) => r.practical.noise.split('—')[0].trim())],
          ['English', rs.map((r) => r.practical.english.split('—')[0].trim())],
          ['Dietary lead time', rs.map((r) => r.practical.leadTime)],
          ['Nearest', rs.map((r) => r.practical.station)]
        ].map(([k, v]) => `
          <tr>
            <th style="text-align:left;padding:9px 12px 9px 0;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-mute);font-weight:600;white-space:nowrap;border-top:1px solid var(--rule-soft);vertical-align:top">${esc(k)}</th>
            ${v.map((x) => `<td style="padding:9px 14px 9px 0;color:var(--ink-soft);border-top:1px solid var(--rule-soft);vertical-align:top">${esc(x)}</td>`).join('')}
          </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <div class="pad">
    <p class="tiny" style="margin-top:10px">Availability is not live in this prototype — send a request and the house replies.</p>
    <div class="section-head"><span class="eyebrow">Candidates</span></div>
    ${rs.map((r, i) => `
      <article class="card">
        ${cardArt(r, r.photos[0], 'card-art', `<span class="rank">${i === 0 ? "Executive's first choice" : `Option ${i + 1}`}</span>`)}
        <div class="card-body">
          <h3 class="card-title">${esc(r.name)}</h3>
          <p class="card-meta"><b>${esc(r.cuisine)}</b> · ${esc(r.areaLabel)} · ${priceLabel(r)}</p>
          <ul class="reasons">
            <li>${esc(r.why[0])}</li>
            <li>${esc(r.practical.privateRooms)}</li>
            <li>${r.pairing.courses}-glass non-alcohol pairing, ${yen(r.pairing.price)}</li>
          </ul>
          <div class="btn-row" style="margin-top:16px">
            <button class="btn ghost sm" data-nav="#/r/${r.id}">Details</button>
            <button class="btn sm" data-act="request:${r.id}">Request ${esc(b.time)}</button>
          </div>
          <div class="btn-row" style="margin-top:8px">
            <button class="btn quiet sm" data-nav="#/r/${r.id}/dietary" style="padding-left:0">Ingredients</button>
            <button class="btn quiet sm" data-act="ask-about:${r.id}" style="padding-left:0">Ask</button>
          </div>
        </div>
      </article>`).join('')}

    <hr class="rule">
    <h2 class="section">Reply to ${esc(b.from.name)}</h2>
    <p class="small">Confirm the shortlist before you call the houses.</p>
    <div style="height:12px"></div>
    <button class="btn" data-act="reply-brief:${b.token}">Send shortlist confirmation</button>
    <div style="height:10px"></div>
    <button class="btn ghost" data-nav="#/concierge">Open constraint search</button>
    <div style="height:26px"></div>
  </div>`;
}

/* ========================================================================= */
/*  7. Ask / Check a Restaurant                                              */
/* ========================================================================= */

let askLog = [];

const SUGGESTIONS = [
  'Is Kōan alright for a guest who doesn’t drink?',
  'Ginza, 4 guests, private room, around ¥30,000',
  'Does Ardoise have a vegan menu?',
  'Somewhere quiet in Nihonbashi on a Wednesday'
];

function findRestaurantIn(text) {
  const t = text.toLowerCase().replace(/[ōô]/g, 'o').replace(/[āâ]/g, 'a');
  return RESTAURANTS.find((r) => {
    const n = r.name.toLowerCase().replace(/[ōô]/g, 'o').replace(/[āâ]/g, 'a');
    return t.includes(n) || text.includes(r.nameJa);
  });
}

function answer(text) {
  const t = text.toLowerCase();
  const r = findRestaurantIn(text);

  const has = (...ws) => ws.some((w) => t.includes(w));
  const cite = (rr) => `<div class="cite">→ <a data-nav="#/r/${rr.id}">${esc(rr.name)} — full detail</a></div>`;

  if (r) {
    if (has('drink', 'alcohol', 'non-alcohol', 'sober', '飲ま', 'お酒', 'ノンアル')) {
      return `<span class="verdict">Yes — comfortably.</span>
        ${esc(r.name)} serves a ${r.pairing.courses}-glass non-alcohol pairing at ${yen(r.pairing.price)},
        poured in the same glassware as the wine pairing. ${esc(r.pairing.note)}
        ${cite(r)}`;
    }
    if (has('vegan', 'ヴィーガン', 'ビーガン')) {
      const a = assessConstraints(r, ['vegan'])[0];
      return `<span class="verdict">${a.level === 'strong' ? 'Yes.' : a.level === 'workable' ? 'Yes, with notice.' : 'Not recommended.'}</span>
        ${esc(a.detail)} This is what the restaurant states; it is not a certification.
        ${cite(r)}`;
    }
    if (has('vegetarian', 'ベジタリアン')) {
      return `<span class="verdict">${/not recommended/i.test(r.dietary.vegetarian) ? 'Possible, but not the right room.' : 'Yes.'}</span>
        ${esc(r.dietary.vegetarian)}${cite(r)}`;
    }
    if (has('allerg', 'アレルギ', 'shellfish', 'nut', 'gluten', 'dairy')) {
      return `<span class="verdict">Handled in writing.</span>
        ${esc(r.dietary.allergen)} Lead time: ${esc(r.practical.dietary.toLowerCase())}.
        ${cite(r)}`;
    }
    if (has('halal', 'pork', 'beef', 'religio', 'ハラル', '豚')) {
      return `<span class="verdict">Arrangeable — and stated plainly.</span>
        ${esc(r.dietary.religious)} We disclose what the house tells us; we do not certify it.
        ${cite(r)}`;
    }
    if (has('private', 'room', '個室')) {
      return `<span class="verdict">${r.attributes.privateRoom ? 'Yes.' : 'No private room.'}</span>
        ${esc(r.practical.privateRooms)} Noise: ${esc(r.practical.noise.toLowerCase())}.
        ${cite(r)}`;
    }
    if (has('quiet', 'noise', '静か')) {
      return `<span class="verdict">${r.attributes.quiet >= 4 ? 'Quiet enough for a real conversation.' : 'Conversational rather than hushed.'}</span>
        ${esc(r.practical.noise)}${cite(r)}`;
    }
    if (has('english', '英語', 'international', 'overseas')) {
      return `<span class="verdict">${r.attributes.english >= 4 ? 'Yes.' : 'Partly.'}</span>
        ${esc(r.practical.english)}${cite(r)}`;
    }
    if (has('price', 'budget', 'cost', 'いくら', '予算')) {
      return `<span class="verdict">${priceLabel(r)} per guest.</span>
        The non-alcohol pairing is ${yen(r.pairing.price)} on top, ${r.pairing.courses} glasses.
        ${cite(r)}`;
    }
    return `<span class="verdict">${esc(r.name)} — ${esc(r.cuisine)}, ${esc(r.areaLabel)}.</span>
      ${esc(r.lede)} ${priceLabel(r)} per guest, ${r.pairing.courses}-glass non-alcohol pairing at ${yen(r.pairing.price)}.
      ${cite(r)}`;
  }

  // No named restaurant — treat as a search.
  const q = { ...defaultQuery(), pairing: true };
  const area = AREAS.find((a) => t.includes(a.label.toLowerCase()) || text.includes(a.labelJa));
  if (area) q.area = area.id;
  const cuisine = CUISINES.find((c) => t.includes(c.label.toLowerCase()));
  if (cuisine) q.cuisine = cuisine.id;
  const party = t.match(/(\d+)\s*(guests?|people|名|人)/);
  if (party) q.party = Math.min(12, Math.max(2, parseInt(party[1], 10)));
  const budget = t.match(/[¥\\]?\s*([0-9,]{4,7})/);
  if (budget) {
    const v = parseInt(budget[1].replace(/,/g, ''), 10);
    const b = [...BUDGETS].reverse().find((x) => v >= x.min);
    if (b) q.budget = b.id;
  }
  q.privateRoom = has('private', '個室') || q.privateRoom;
  if (has('quiet', '静か')) q.occasion = 'quiet';

  const hits = candidatesFor(q).slice(0, 3);
  if (!hits.length) {
    return `<span class="verdict">Nothing on the list fits that yet.</span>
      The network is deliberately small. Try a wider area, or ask about a house by name.`;
  }
  draft = q;
  return `<span class="verdict">${hits.length} that would work.</span>
    ${esc(querySummary(q))}.
    <div class="cite">${hits.map((m) => `→ <a data-nav="#/r/${m.restaurant.id}">${esc(m.restaurant.name)}</a> — ${esc(m.reasons[0] || m.restaurant.cuisine)}<br>`).join('')}
    <a data-nav="#/results">See all ${hits.length} as a shortlist</a></div>`;
}

function screenAsk(prefill) {
  return `
  ${topbar({ back: '#/' })}
  <div class="pad" style="padding-top:8px">
    <p class="eyebrow">Ask</p>
    <h1 class="display sm" style="margin-top:8px">Check a house<br>before you commit.</h1>
    <p class="small" style="margin-top:10px">Written answers only — availability, ingredients and rooms as the houses have stated them.</p>
    <hr class="rule tight">

    ${askLog.length ? `<div class="ask-log">${askLog.map((m) => m.me
      ? `<div class="bubble me">${esc(m.text)}</div>`
      : `<div class="bubble sys">${m.text}</div>`).join('')}</div>` : `
    <p class="eyebrow" style="margin-top:22px">Try</p>
    <div class="suggests">
      ${SUGGESTIONS.map((s, i) => `<button class="suggest" data-act="ask-suggest:${i}">${esc(s)}</button>`).join('')}
    </div>`}
    ${askLog.length ? `<div style="height:16px"></div><button class="btn quiet sm" data-act="ask-clear" style="padding-left:0">Clear</button>` : ''}
    <div style="height:28px"></div>
  </div>

  <div class="actionbar">
    <div class="composer" style="width:100%">
      <input class="textinput" data-field="ask" placeholder="Ask about a house or a dinner" value="${esc(prefill || '')}">
      <button class="btn sm" data-act="ask-send">Ask</button>
    </div>
  </div>`;
}

/* ========================================================================= */
/*  8. Dietary / Ingredient Disclosure                                       */
/* ========================================================================= */

let dietSelection = ['alcoholfree'];

function screenDietary(id) {
  const r = byId(id);
  if (!r) return notFound();
  const assessed = assessConstraints(r, dietSelection);

  return `
  ${topbar({ back: `#/r/${r.id}` })}
  <div class="pad" style="padding-top:8px">
    <p class="eyebrow">${esc(r.name)}</p>
    <h1 class="display sm" style="margin-top:8px">Ingredients &amp;<br>dietary disclosure</h1>
    <p class="small" style="margin-top:10px">
      Select what the guest needs. We show what has been disclosed to us, and by whom.
    </p>
    <hr class="rule tight">

    <p class="eyebrow" style="margin-bottom:10px">Guest constraints</p>
    <div class="chips">
      ${CONSTRAINTS.map((c) => chip(c.label, dietSelection.includes(c.id), `diet:${c.id}`)).join('')}
    </div>

    <div class="section-head"><span class="eyebrow">Against this house</span></div>
    ${assessed.length ? `<ul class="assess">
      ${assessed.map((a) => `
        <li>
          <span class="dot ${a.level}"></span>
          <div>
            <span class="a-label">${esc(a.label)}</span>
            <span class="a-level">${a.level === 'strong' ? 'Straightforward' : a.level === 'workable' ? 'Arrangeable with notice' : 'Not recommended'}</span>
            <div class="a-detail">${esc(a.detail)}</div>
          </div>
        </li>`).join('')}
    </ul>` : '<p class="small">Select a constraint above.</p>'}

    <div class="section-head"><span class="eyebrow">Disclosure record</span></div>
    <div class="disclosure">
      ${r.disclosure.items.map((d) => `
        <div class="d-item">
          <div class="d-label">
            <span class="badge ${d.kind}">${d.kind === 'coldraw' ? 'COLDRAW verified' : 'Restaurant reported'}</span>
            ${esc(d.label)}
          </div>
          <div class="d-value">${esc(d.value)}</div>
        </div>`).join('')}
    </div>
    <div class="verify-line">Last verified ${esc(r.disclosure.lastVerified)}</div>

    <div style="height:20px"></div>
    <div class="notice">
      <b>Disclosure, not certification.</b>
      COLDRAW states verified facts about its own Nature Packs and the Nature Cocktails made
      from them — composition, alcohol, animal-derived ingredients, allergens, manufacturing.
      Everything about the restaurant’s own menu is reported by the restaurant and dated here.
      COLDRAW does not certify a restaurant as vegan, halal or allergen-free, and nothing on
      this page should be presented to a guest as such.
    </div>

    <div style="height:20px"></div>
    <button class="btn ghost" data-act="diet-copy:${r.id}">Copy disclosure for the guest</button>
    <div style="height:10px"></div>
    <button class="btn" data-act="share-one:${r.id}">Share with my assistant</button>
    <div style="height:26px"></div>
  </div>`;
}

/* ========================================================================= */
/*  9. Concierge Mode                                                        */
/* ========================================================================= */

let conciergeState = { constraints: ['alcoholfree', 'vegan'], area: null, party: 2 };

function riskScore(r, cons) {
  const a = assessConstraints(r, cons);
  const bad = a.filter((x) => x.level === 'not-recommended').length;
  const soft = a.filter((x) => x.level === 'workable').length;
  const strong = a.filter((x) => x.level === 'strong').length;
  return { score: strong * 3 - soft - bad * 20, assessed: a, bad };
}

function screenConcierge() {
  const c = conciergeState;
  const ranked = RESTAURANTS
    .filter((r) => (!c.area || r.area === c.area) && r.capacity.max >= c.party)
    .map((r) => ({ r, ...riskScore(r, c.constraints) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return `
  <div class="role-note">Professional mode · <b>Concierge / DMC</b></div>
  ${topbar({ back: '#/you' })}
  <div class="pad" style="padding-top:8px">
    <p class="eyebrow">Guest constraints</p>
    <h1 class="display sm" style="margin-top:8px">Send the guest<br>without a doubt.</h1>
    <p class="small" style="margin-top:10px">
      Filter by what the guest cannot have. We show what each house has disclosed, what it has not,
      and how long it needs.
    </p>
    <hr class="rule tight">

    <div class="field">
      <label class="eyebrow">Constraints</label>
      <div class="chips">
        ${CONSTRAINTS.map((x) => chip(x.label, c.constraints.includes(x.id), `con:${x.id}`)).join('')}
      </div>
    </div>

    <div class="field">
      <label class="eyebrow">Area</label>
      <div class="chips">
        ${AREAS.map((a) => chip(a.label, c.area === a.id, `con-area:${a.id}`)).join('')}
        ${chip('Anywhere', !c.area, 'con-area:')}
      </div>
    </div>

    <div class="field">
      <label class="eyebrow">Party</label>
      <div class="stepper">
        <button data-act="con-party:-1">−</button>
        <div class="val">${c.party} <span>guests</span></div>
        <button data-act="con-party:1">+</button>
      </div>
    </div>

    <div class="section-head"><span class="eyebrow">${ranked.length} houses ranked by risk</span></div>

    ${ranked.map(({ r, assessed, bad }) => `
      <article class="card">
        <div class="card-body">
          <h3 class="card-title">${esc(r.name)}</h3>
          <p class="card-meta"><b>${esc(r.cuisine)}</b> · ${esc(r.areaLabel)} · ${priceLabel(r)} · ${esc(r.practical.leadTime)} lead time</p>
          <ul class="assess" style="margin-top:12px">
            ${assessed.map((a) => `
              <li>
                <span class="dot ${a.level}"></span>
                <div>
                  <span class="a-label">${esc(a.label)}</span>
                  <span class="a-level">${a.level === 'strong' ? 'Straightforward' : a.level === 'workable' ? 'With notice' : 'Not recommended'}</span>
                  <div class="a-detail">${esc(a.detail)}</div>
                </div>
              </li>`).join('')}
          </ul>
          ${bad ? `<p class="tiny" style="color:var(--stop);margin-top:12px">One or more constraints are not a good fit here — do not place this guest without calling first.</p>` : ''}
          <div class="btn-row" style="margin-top:16px">
            <button class="btn ghost sm" data-nav="#/r/${r.id}">Details</button>
            <button class="btn sm" data-act="con-copy:${r.id}">Copy guest brief</button>
          </div>
        </div>
      </article>`).join('')}

    <div class="notice">
      <b>What we can and cannot state.</b>
      Verified by COLDRAW: the composition, alcohol content, animal-derived ingredients, allergens
      and manufacturing of the Nature Packs and the Nature Cocktails made from them.
      Reported by the restaurant, and dated: everything about its own menu, kitchen and substitutions.
      No house on this network is certified vegan, halal or allergen-free by COLDRAW, and none should
      be described that way to a guest.
    </div>
    <div style="height:26px"></div>
  </div>`;
}

/* ========================================================================= */
/*  10. Post-Dinner                                                          */
/* ========================================================================= */

let postRating = null;

function screenPost(id) {
  const r = byId(id);
  if (!r) return notFound();
  const s = store.get();
  const following = store.isFollowing(r.id);
  const saved = store.isSaved(r.id);
  const done = s.dinners.length;

  return `
  ${topbar({ back: '#/' })}
  <div class="pad" style="padding-top:8px">
    <p class="eyebrow">Last night</p>
    <h1 class="display sm" style="margin-top:8px">${esc(r.name)}<br>How was it?</h1>
    <div style="height:20px"></div>
    <div class="rate">
      <button class="${postRating === 'again' ? 'on' : ''}" data-act="rate:again"><span class="ic">◎</span>Would host here again</button>
      <button class="${postRating === 'fine' ? 'on' : ''}" data-act="rate:fine"><span class="ic">○</span>Fine</button>
      <button class="${postRating === 'no' ? 'on' : ''}" data-act="rate:no"><span class="ic">△</span>Not for this guest</button>
    </div>
  </div>

  ${postRating ? `
  <div class="pad">
    <hr class="rule">
    <h2 class="section">${postRating === 'again' ? 'Keep it close' : 'Noted — we will weight this'}</h2>
    <p class="small">${postRating === 'again'
      ? 'Saved houses come first the next time you search this area.'
      : 'This house will rank lower for you. Tell us nothing more — the pattern is enough.'}</p>
    <div style="height:16px"></div>
    <button class="btn ${saved ? 'ghost' : ''}" data-act="save:${r.id}">${saved ? '✓ Saved' : 'Save this house'}</button>
    <div style="height:10px"></div>
    <button class="btn ghost" data-act="invite:${r.id}">Invite someone here next time</button>
    <div style="height:10px"></div>
    <button class="btn ghost" data-nav="#/find">Find another for this week</button>
  </div>

  <div style="height:30px"></div>
  <div class="patron">
    <p class="eyebrow">The kitchen</p>
    <h3>${esc(r.chef.name)}</h3>
    <p>${esc(r.chef.bio)}</p>
    <div style="height:18px"></div>
    <button class="btn ${following ? 'ghost' : 'gold'}" data-act="follow:${r.id}" style="${following ? 'border-color:rgba(242,237,227,.3);color:#F2EDE3' : ''}">
      ${following ? '✓ Following — you’ll hear when they cook elsewhere' : `Follow ${esc(r.chef.name.split(' ')[0])}`}
    </button>
    <div class="patron-stats">
      <div><b>${done}</b><span>Dinners hosted</span></div>
      <div><b>${s.following.length}</b><span>Kitchens followed</span></div>
      <div><b>2026</b><span>Supporting since</span></div>
    </div>
    <p style="margin-top:18px;font-size:12px;color:rgba(242,237,227,.6)">
      Following a kitchen is not a points scheme. It means you hear first when this chef cooks a
      one-night table, tests a new menu, or opens somewhere else — and the kitchen knows who was
      early.
    </p>
  </div>
  <div style="height:30px"></div>` : '<div style="height:40px"></div>'}
  ${tabbar('')}`;
}

/* ========================================================================= */
/*  You / modes / instrumentation                                            */
/* ========================================================================= */

function screenYou() {
  const s = store.get();
  const c = store.counts();
  const saved = s.saved.map(byId).filter(Boolean);
  const follows = s.following.map(byId).filter(Boolean);

  return `
  ${topbar({ back: '#/' })}
  <div class="pad" style="padding-top:8px">
    <p class="eyebrow">${esc(s.profile.execName)} · ${esc(s.profile.execTitle)}</p>
    <h1 class="display sm" style="margin-top:8px">Your dining</h1>
    <hr class="rule tight">

    <div class="section-head" style="margin-top:16px"><span class="eyebrow">Saved</span></div>
    ${saved.length ? saved.map((r) => `
      <div class="chef-row" data-nav="#/r/${r.id}">
        <div class="chef-av">${art(r.photos[0], r.palette, r.id)}</div>
        <div style="flex:1">
          <div class="chef-name">${esc(r.name)}</div>
          <div class="chef-meta">${esc(r.cuisine)} · ${esc(r.areaLabel)}</div>
        </div>
        <span class="tiny">›</span>
      </div>`).join('') : '<p class="small">Nothing saved yet.</p>'}

    <div class="section-head"><span class="eyebrow">Kitchens you follow</span></div>
    ${follows.length ? follows.map((r) => `
      <div class="chef-row" data-nav="#/r/${r.id}">
        <div class="chef-av">${monogram(r.chef.name, r.palette)}</div>
        <div style="flex:1">
          <div class="chef-name">${esc(r.chef.name)}</div>
          <div class="chef-meta">${esc(r.name)} · ${r.chef.patrons} others follow</div>
        </div>
        <span class="tiny">›</span>
      </div>`).join('') : '<p class="small">Follow a kitchen after a dinner you would repeat.</p>'}

    <div class="section-head"><span class="eyebrow">Briefs sent to your assistant</span></div>
    ${s.briefs.length ? s.briefs.map((b) => `
      <div class="kv" data-nav="#/brief/${b.token}">
        <span class="k">${esc(dateLabel(b.query.date))} · ${b.candidates.length} candidates</span>
        <span class="v">${esc(b.status === 'confirmed' ? 'Shortlist confirmed' : 'Sent')} ›</span>
      </div>`).join('') : '<p class="small">No briefs yet.</p>'}

    <hr class="rule">
    <h2 class="section">Other views</h2>
    <p class="small">This prototype carries three roles. Switch to see what each person gets.</p>
    <div style="height:14px"></div>
    <button class="btn ghost" data-act="open-assistant">Assistant view</button>
    <div style="height:10px"></div>
    <button class="btn ghost" data-nav="#/concierge">Concierge / DMC mode</button>
    <div style="height:10px"></div>
    <button class="btn ghost" data-act="demo-post">Post-dinner view</button>

    <hr class="rule">
    <h2 class="section">Prototype instrumentation</h2>
    <p class="small">The one number that matters is the first.</p>
    <div style="height:10px"></div>
    <div class="kv"><span class="k">Share with my assistant</span><span class="v">${c.share_with_assistant || 0}</span></div>
    <div class="kv"><span class="k">Briefs opened by assistant</span><span class="v">${c.brief_opened || 0}</span></div>
    <div class="kv"><span class="k">Booking requests</span><span class="v">${c.request_booking || 0}</span></div>
    <div class="kv"><span class="k">Searches run</span><span class="v">${c.find_search || 0}</span></div>
    <div class="kv"><span class="k">Questions asked</span><span class="v">${c.ask_query || 0}</span></div>
    <div class="kv"><span class="k">Restaurants viewed</span><span class="v">${c.view_restaurant || 0}</span></div>
    <div class="kv"><span class="k">Saves</span><span class="v">${c.save_restaurant || 0}</span></div>
    <div class="kv"><span class="k">Chefs followed</span><span class="v">${c.follow_chef || 0}</span></div>
    <div style="height:16px"></div>
    <button class="btn quiet sm" data-act="reset" style="padding-left:0">Reset prototype data</button>
    <div style="height:20px"></div>
  </div>
  ${tabbar('you')}`;
}

/* ---------- not found ---------------------------------------------------- */

function notFound(msg) {
  return `${topbar({ back: '#/' })}
  <div class="empty">
    <span class="ic">◇</span>
    <p class="lede">${esc(msg || 'That page is not part of this prototype.')}</p>
    <div style="height:18px"></div>
    <button class="btn ghost" data-nav="#/">Back to start</button>
  </div>`;
}

/* ========================================================================= */
/*  Router                                                                   */
/* ========================================================================= */

function route() {
  const raw = location.hash.slice(1) || '/';
  const [path, qs] = raw.split('?');
  const parts = path.split('/').filter(Boolean);
  const params = new URLSearchParams(qs || '');

  let html;
  if (parts.length === 0) html = screenHome();
  else if (parts[0] === 'find') html = screenFind();
  else if (parts[0] === 'results') html = screenResults();
  else if (parts[0] === 'r' && parts[2] === 'dietary') html = screenDietary(parts[1]);
  else if (parts[0] === 'r') html = screenDetail(parts[1]);
  else if (parts[0] === 'share') html = screenShare();
  else if (parts[0] === 'brief') html = screenBrief(parts[1]);
  else if (parts[0] === 'ask') html = screenAsk(params.get('q'));
  else if (parts[0] === 'concierge') html = screenConcierge();
  else if (parts[0] === 'post') html = screenPost(parts[1]);
  else if (parts[0] === 'you') html = screenYou();
  else html = notFound();

  app.innerHTML = `<div class="screen">${html}</div>`;
  window.scrollTo(0, 0);

  const bar = app.querySelector('.topbar');
  if (bar) {
    const onScroll = () => bar.classList.toggle('scrolled', window.scrollY > 8);
    window.removeEventListener('scroll', window.__cednScroll || (() => {}));
    window.__cednScroll = onScroll;
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  const ask = app.querySelector('[data-field="ask"]');
  if (ask && askLog.length) ask.focus();
}

/* ========================================================================= */
/*  Actions                                                                  */
/* ========================================================================= */

const fieldValue = (name) => {
  const el = app.querySelector(`[data-field="${name}"]`);
  return el ? el.value : '';
};

function openShare(ids) {
  shareDraft = buildShareDraft(ids);
  go('#/share');
}

function sendBrief(channel) {
  const b = shareDraft;
  b.time = fieldValue('time') || b.time;
  b.note = fieldValue('note') || '';
  store.saveBrief(b);
  store.track('share_with_assistant', { channel, candidates: b.candidates.length });
  const text = briefText(b);

  if (channel === 'email') {
    const subject = `Dinner ${dateLabel(b.query.date)} — ${b.candidates.length} candidates`;
    location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    toast('Opening your mail app…');
  } else if (channel === 'line') {
    copy(text).then((ok) => toast(ok ? 'Message copied — paste into LINE' : 'Prototype: LINE send is simulated'));
  } else {
    copy(`${location.origin}${location.pathname}#/brief/${b.token}`)
      .then((ok) => toast(ok ? 'Link copied' : `Link: #/brief/${b.token}`));
  }

  setTimeout(() => go(`#/brief/${b.token}`), 700);
}

app.addEventListener('click', (e) => {
  const navEl = e.target.closest('[data-nav]');
  const actEl = e.target.closest('[data-act]');

  if (actEl) {
    e.preventDefault();
    e.stopPropagation();
    handleAction(actEl.dataset.act);
    return;
  }
  if (navEl) {
    e.preventDefault();
    go(navEl.dataset.nav);
  }
});

app.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.matches('[data-field="ask"]')) {
    e.preventDefault();
    handleAction('ask-send');
  }
});

function handleAction(act) {
  const [name, arg] = act.split(':');

  switch (name) {
    /* --- Find a Dinner --- */
    case 'area': draft.area = arg || null; return route();
    case 'date': draft.date = arg; return route();
    case 'budget': draft.budget = arg; return route();
    case 'cuisine': draft.cuisine = arg || null; return route();
    case 'occ': draft.occasion = arg; return route();
    case 'party':
      draft.party = Math.min(12, Math.max(1, draft.party + parseInt(arg, 10)));
      return route();
    case 'toggle':
      draft[arg] = !draft[arg];
      return route();
    case 'search':
      store.track('find_search', { ...draft });
      return go('#/results');

    case 'preset': {
      const presets = [
        { area: 'ginza', party: 4, privateRoom: true, budget: 'b30' },
        { area: 'marunouchi', party: 2, privateRoom: false, budget: 'b20' },
        { area: 'azabudai', party: 6, privateRoom: true, budget: 'b30', occasion: 'international' }
      ];
      draft = { ...defaultQuery(), ...presets[parseInt(arg, 10)] };
      store.track('find_search', { preset: arg, ...draft });
      return go('#/results');
    }

    /* --- Sharing (the KPI) --- */
    case 'share-set':
      return openShare(candidatesFor(draft).slice(0, 3).map((m) => m.restaurant.id));
    case 'share-one':
      return openShare([arg]);
    case 'send':
      return sendBrief(arg);

    /* --- Detail --- */
    case 'back':
      return history.length > 1 ? history.back() : go('#/');
    case 'save': {
      const on = store.toggleSaved(arg);
      if (on) store.track('save_restaurant', { id: arg });
      toast(on ? 'Saved' : 'Removed');
      return route();
    }
    case 'follow': {
      const on = store.toggleFollow(arg);
      if (on) store.track('follow_chef', { id: arg });
      toast(on ? `Following ${byId(arg).chef.name}` : 'Unfollowed');
      return route();
    }
    case 'request': {
      store.track('request_booking', { id: arg });
      const r = byId(arg);
      toast(`Request sent to ${r.name} — they reply within the day`);
      return;
    }
    case 'invite':
      store.track('invite_guest', { id: arg });
      return toast('Prototype: an invitation would go out from here');

    /* --- Ask --- */
    case 'ask-suggest': {
      const q = SUGGESTIONS[parseInt(arg, 10)];
      askLog.push({ me: true, text: q });
      askLog.push({ me: false, text: answer(q) });
      store.track('ask_query', { q });
      return route();
    }
    case 'ask-send': {
      const q = fieldValue('ask').trim();
      if (!q) return;
      askLog.push({ me: true, text: q });
      askLog.push({ me: false, text: answer(q) });
      store.track('ask_query', { q });
      return route();
    }
    case 'ask-clear':
      askLog = [];
      return route();
    case 'ask-about': {
      const r = byId(arg);
      const q = `Is ${r.name} alright for a guest who doesn’t drink?`;
      askLog = [{ me: true, text: q }, { me: false, text: answer(q) }];
      store.track('ask_query', { q, from: 'assistant' });
      return go('#/ask');
    }

    /* --- Dietary --- */
    case 'diet': {
      const i = dietSelection.indexOf(arg);
      if (i >= 0) dietSelection.splice(i, 1);
      else dietSelection.push(arg);
      return route();
    }
    case 'diet-copy': {
      const r = byId(arg);
      const text = [
        `${r.name} — ingredient disclosure (last verified ${r.disclosure.lastVerified})`,
        ...r.disclosure.items.map((d) => `[${d.kind === 'coldraw' ? 'COLDRAW verified' : 'Restaurant reported'}] ${d.label}: ${d.value}`),
        '',
        'Disclosure, not certification. COLDRAW verifies facts about its Nature Packs and the Nature Cocktails made from them. Restaurant menu information is reported by the restaurant.'
      ].join('\n');
      copy(text).then((ok) => toast(ok ? 'Disclosure copied' : 'Copy unavailable in this browser'));
      return;
    }

    /* --- Concierge --- */
    case 'con': {
      const i = conciergeState.constraints.indexOf(arg);
      if (i >= 0) conciergeState.constraints.splice(i, 1);
      else conciergeState.constraints.push(arg);
      return route();
    }
    case 'con-area': conciergeState.area = arg || null; return route();
    case 'con-party':
      conciergeState.party = Math.min(12, Math.max(1, conciergeState.party + parseInt(arg, 10)));
      return route();
    case 'con-copy': {
      const r = byId(arg);
      const a = assessConstraints(r, conciergeState.constraints);
      const text = [
        `${r.name} — ${r.cuisine}, ${r.areaLabel}, ${priceLabel(r)} per guest`,
        `Lead time for dietary arrangements: ${r.practical.dietary}`,
        '',
        'Guest constraints:',
        ...a.map((x) => `• ${x.label} — ${x.level === 'strong' ? 'straightforward' : x.level === 'workable' ? 'arrangeable with notice' : 'NOT RECOMMENDED'}: ${x.detail}`),
        '',
        `Non-alcohol pairing: ${r.pairing.courses} glasses, ${yen(r.pairing.price)}`,
        `Disclosure last verified ${r.disclosure.lastVerified}. Reported by the restaurant unless marked COLDRAW verified. Not a certification.`
      ].join('\n');
      copy(text).then((ok) => toast(ok ? 'Guest brief copied' : 'Copy unavailable in this browser'));
      return;
    }

    /* --- Assistant --- */
    case 'reply-brief': {
      const b = store.briefByToken(arg);
      if (b) { b.status = 'confirmed'; store.saveBrief(b); }
      store.track('assistant_confirmed', { token: arg });
      toast('Shortlist confirmed — the executive is notified');
      return;
    }
    case 'open-assistant': {
      const b = store.get().briefs[0];
      if (!b) return toast('Share a shortlist first — then open it as your assistant');
      return go(`#/brief/${b.token}`);
    }
    case 'demo-post': {
      const s = store.get();
      const id = s.dinners[0]?.id || s.saved[0] || 'koan';
      postRating = null;
      return go(`#/post/${id}`);
    }

    /* --- Post-dinner --- */
    case 'rate': {
      postRating = arg;
      const id = location.hash.split('/')[2];
      store.recordDinner(id, arg);
      store.track('post_dinner_rating', { id, rating: arg });
      return route();
    }

    case 'reset':
      store.reset();
      draft = defaultQuery();
      askLog = [];
      shareDraft = null;
      postRating = null;
      toast('Prototype data cleared');
      return go('#/');

    default:
      return;
  }
}

/* ---------- boot --------------------------------------------------------- */

window.addEventListener('hashchange', route);
route();
