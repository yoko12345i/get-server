/* ============================================================
   Taste Signature — 5軸の Taste Profile から決定論的に生成する図形
   写真の代わりの視覚アイデンティティ（docs/03-design-language.md §4）
   ============================================================ */

import { AXES } from './data.js';

/** 決定論的な擬似乱数（mulberry32） */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFrom(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 制御点をなめらかな閉曲線（Catmull-Rom → Bezier）に変換 */
function closedSpline(pts) {
  const n = pts.length;
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(2)} ${c1[1].toFixed(2)}, ${c2[0].toFixed(2)} ${c2[1].toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d + ' Z';
}

/**
 * Taste Signature を SVG 文字列で返す。
 * @param {object} taste  { aroma, acidity, bitterness, sweetness, finish } 0-100
 * @param {number} hue    基調色相
 * @param {string} key    決定論のためのシード文字列（creator.id など）
 * @param {object} [opt]  { rings, onDark }
 */
export function signatureSVG(taste, hue, key, opt = {}) {
  const rings = opt.rings || 4;
  const onDark = !!opt.onDark;
  const rand = rng(seedFrom(key));
  const S = 200;
  const c = S / 2;
  const values = AXES.map((a) => Math.max(8, Math.min(100, taste[a.key] ?? 50)));

  // 5軸を 40 点に補間しつつ、seed 由来のゆらぎを足す
  const density = 40;
  const layers = [];

  for (let L = 0; L < rings; L++) {
    const scale = 0.98 - L * 0.16;
    const wobble = 0.05 + L * 0.045;
    const rot = rand() * Math.PI * 2;
    const pts = [];
    for (let i = 0; i < density; i++) {
      const t = (i / density) * values.length;
      const i0 = Math.floor(t) % values.length;
      const i1 = (i0 + 1) % values.length;
      const f = t - Math.floor(t);
      const smooth = f * f * (3 - 2 * f);
      const base = values[i0] * (1 - smooth) + values[i1] * smooth;
      const r = (base / 100) * (S * 0.42) * scale * (1 + (rand() - 0.5) * wobble);
      const a = rot + (i / density) * Math.PI * 2;
      pts.push([c + Math.cos(a) * r, c + Math.sin(a) * r]);
    }
    layers.push(closedSpline(pts));
  }

  const sat = onDark ? 34 : 30;
  const light = onDark ? 62 : 26;
  const fill = `hsl(${hue} ${sat}% ${light}%)`;

  const shapes = layers
    .map((d, i) => {
      const op = (onDark ? 0.16 : 0.12) + i * 0.035;
      return `<path d="${d}" fill="${fill}" fill-opacity="${op.toFixed(3)}"/>`;
    })
    .join('');

  const outline = `<path d="${layers[0]}" fill="none" stroke="${fill}" stroke-opacity="${
    onDark ? 0.6 : 0.45
  }" stroke-width="1"/>`;

  // 5軸のヘアライン
  const hairs = values
    .map((v, i) => {
      const a = -Math.PI / 2 + (i / values.length) * Math.PI * 2;
      const r = (v / 100) * (S * 0.42);
      return `<line x1="${c}" y1="${c}" x2="${(c + Math.cos(a) * r).toFixed(2)}" y2="${(
        c +
        Math.sin(a) * r
      ).toFixed(2)}" stroke="${fill}" stroke-opacity="${onDark ? 0.3 : 0.22}" stroke-width="0.6"/>`;
    })
    .join('');

  return `<svg viewBox="0 0 ${S} ${S}" width="100%" height="100%" role="img" aria-label="Taste signature" xmlns="http://www.w3.org/2000/svg">${shapes}${hairs}${outline}</svg>`;
}

/** 2つの Taste Profile を重ねる（Consumer と Creator の相性表現） */
export function overlaySVG(a, hueA, keyA, b, hueB, keyB) {
  const one = signatureSVG(a, hueA, keyA, { rings: 3 });
  const two = signatureSVG(b, hueB, keyB, { rings: 3 });
  return `<div style="position:relative;width:100%;aspect-ratio:1">
    <div style="position:absolute;inset:0">${one}</div>
    <div style="position:absolute;inset:0;mix-blend-mode:multiply">${two}</div>
  </div>`;
}
