/**
 * Prototype state + instrumentation.
 *
 * 最重要KPIは "Share with my assistant"。Like / 会員登録より上に置く。
 * Everything is localStorage-only — no accounts, no server-side persistence.
 */

const KEY = 'cedn:v1';

const EMPTY = {
  profile: {
    execName: 'K. Arai',
    execTitle: 'Representative Director',
    assistantName: 'Ms. Mori'
  },
  query: null,        // last Find a Dinner query
  briefs: [],         // shared briefs (executive → assistant)
  saved: [],          // restaurant ids
  following: [],      // chef ids (restaurant id used as key)
  dinners: [],        // completed dinners, for the patronage layer
  events: []          // instrumentation
};

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(EMPTY);
    return Object.assign(structuredClone(EMPTY), JSON.parse(raw));
  } catch {
    return structuredClone(EMPTY);
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* private mode — prototype still works in-memory */
  }
}

export const get = () => state;

export function update(fn) {
  fn(state);
  persist();
  return state;
}

/** 検証用イベント。KPI は share_with_assistant。 */
export function track(name, props = {}) {
  state.events.push({ name, props, at: Date.now() });
  if (state.events.length > 400) state.events.splice(0, state.events.length - 400);
  persist();
  if (window.__cednDebug) console.log('📩 event:', name, props);
}

export function counts() {
  const c = {};
  for (const e of state.events) c[e.name] = (c[e.name] || 0) + 1;
  return c;
}

export const token = () => Math.random().toString(36).slice(2, 8).toUpperCase();

export function saveBrief(brief) {
  update((s) => {
    const i = s.briefs.findIndex((b) => b.token === brief.token);
    if (i >= 0) s.briefs[i] = brief;
    else s.briefs.unshift(brief);
  });
  return brief;
}

export const briefByToken = (t) => state.briefs.find((b) => b.token === t);

export function toggleSaved(id) {
  update((s) => {
    const i = s.saved.indexOf(id);
    if (i >= 0) s.saved.splice(i, 1);
    else s.saved.push(id);
  });
  return state.saved.includes(id);
}

export function toggleFollow(id) {
  update((s) => {
    const i = s.following.indexOf(id);
    if (i >= 0) s.following.splice(i, 1);
    else s.following.push(id);
  });
  return state.following.includes(id);
}

export const isSaved = (id) => state.saved.includes(id);
export const isFollowing = (id) => state.following.includes(id);

export function recordDinner(id, rating) {
  update((s) => {
    s.dinners.unshift({ id, rating, at: Date.now() });
  });
}

export function reset() {
  state = structuredClone(EMPTY);
  persist();
}
