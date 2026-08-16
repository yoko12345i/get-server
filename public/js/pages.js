/* ============================================================
   UNDERCURRENT — 各画面
   ============================================================ */

import {
  BRAND, creators, experiences, labSessions, me, getCreator,
  experiencesOf, LEDGER_LABELS
} from './data.js';
import {
  esc, yen, qs, jaMonth, monthsSince, axesBlock, kindTag, stat,
  recordCard, registerTable, experienceRow, issuance
} from './ui.js';
import { signatureSVG } from './signature.js';

/* ============================================================
   HOME
   ============================================================ */

export function home() {
  const featured = ['mori', 'arakawa', 'tsuji', 'nakamura'].map(getCreator);
  const p = me.patronages[0];

  const loop = [
    ['Support', '好きな作り手のPassを持つ。割引券ではなく、関係の契約。'],
    ['Experience', 'Dinner、Tasting、開発中の試作。回数ではなく密度。'],
    ['Contribution', '評価を返す。人を連れてくる。開発に立ち会う。'],
    ['Recognition', 'その全部が、あなたの名前で記録される。'],
    ['Access', '返ってくるのは値引きではなく、作り手との距離。'],
    ['Co-creation', '気づくと、作り手側にいる。']
  ];

  return `
<section class="hero">
  <div class="wrap">
    <p class="label hero__tag fx">${esc(BRAND.tagline)}</p>
    <h1 class="display fx">有名になる前から<br>この人を知っていた、を<br>証明できる場所。</h1>
    <p class="lede hero__lede fx">
      面白い作り手を見つける。通う。友人を連れていく。新作の開発に立ち会う。
      その全部が記録され、数年後、あなたのTasteの証拠として残ります。
    </p>
    <div class="hero__meta">
      ${stat(creators.length, 'Creators')}
      ${stat('982', 'Supporters')}
      ${stat('50', 'Lab Founding Members')}
      ${stat('2026', 'Since')}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap cols">
    <div>
      <p class="label">01 — The Record</p>
    </div>
    <div class="stack-lg">
      <h2 class="h1">先に、完成形をお見せします。</h2>
      <p class="lede read">
        これは1年間このサービスを使った人の記録です。<br>
        金額は、どこにも書かれていません。書かれているのは、いつから支えていたか、何回体験したか、何人を連れてきたか、開発に何回立ち会ったかだけです。
      </p>
      <div style="max-width:520px">${recordCard(p, { dark: true })}</div>
      <p class="body read">
        数年後、森果穂が世界的に知られるようになったとき、この記録は
        <strong>「私はこの人を2026年から支えていた」</strong>という、自分では言えないことを、
        あなたの代わりに言ってくれます。
      </p>
      <div class="callout read">
        <p class="body body--ink">
          ワインの世界では、それを「あのヴィンテージを、あの値段の頃から買っていた」という
          <em>モノの所有</em>で証明します。だから資金のある人が勝ちます。<br>
          ここでは<em>行動の履歴</em>で証明します。だから早く気づいて動いた人が勝ちます。
        </p>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap cols">
    <div><p class="label">02 — The Loop</p></div>
    <div class="stack-lg">
      <h2 class="h1">支えると、近づく。</h2>
      <p class="lede read">
        上位のSupporterへのReward は、値引きではありません。作り手との距離です。
      </p>
      <div class="loop">
        ${loop
          .map(
            ([t, d], i) => `<div class="loop__step">
              <span class="loop__n">${String(i + 1).padStart(2, '0')}</span>
              <p class="loop__t">${t}</p>
              <p class="small">${d}</p>
            </div>`
          )
          .join('')}
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="cols" style="margin-bottom:26px">
      <div><p class="label">03 — Creators</p></div>
      <div>
        <h2 class="h1">いま、何かを作っている人。</h2>
        <p class="lede read" style="margin-top:20px">
          並び順は、人気順でも新着順でもありません。<strong>いま開発中のものがある人</strong>が上に来ます。
          完成したものを買う場所ではないからです。
        </p>
      </div>
    </div>
    ${featured.map(creatorRow).join('')}
    <p style="margin-top:32px"><a class="textlink" href="/creators">${creators.length}人すべてを見る</a></p>
  </div>
</section>

<section class="section">
  <div class="wrap cols">
    <div><p class="label">04 — For you</p></div>
    <div class="stack-lg">
      <h2 class="h1">食べることには、<br>誰よりも本気なのに。</h2>
      <div class="read stack">
        <p class="lede">
          月に何度も、目的を持って店に行く。予約が取れない店に通う。シェフと話す。友人を連れていく。
          食への熱量では、たぶん上位数パーセントにいる。
        </p>
        <p class="lede">
          それなのに、カウンターで「お酒は飲まれないんですね」と言われるたびに、
          静かに一段下に置かれる。
        </p>
        <p class="lede">
          ワインが好きな人には、学ぶ体系があり、資格があり、語彙があり、コミュニティがあり、
          生産者に会う機会があります。<strong>飲まない人には、それが何もありません。</strong>
        </p>
      </div>
      <div class="callout callout--ember read">
        <p class="body body--ink">
          ここは「ノンアルコール飲料のサービス」ではありません。<br>
          <strong>飲まないことが不利にならない、飲料の趣味と専門性とコミュニティ</strong>を、
          最初から作り直そうとしている場所です。
        </p>
      </div>
      <p class="body read">
        しかも、飲まない人は評価者として優れています。4杯目の判断が1杯目と同じ精度で下せる。
        記憶が正確に残る。だから作り手は、あなたの意見を最も必要としています。
      </p>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="cols" style="margin-bottom:30px">
      <div><p class="label">05 — Ways in</p></div>
      <div>
        <h2 class="h1">入口は3つ。</h2>
        <p class="lede read" style="margin-top:18px">
          導入店舗もSKUも、まだ十分にありません。だからこそ今は、
          <strong>「まだ出来上がっていないものの中に入れる」</strong>ことを商品にしています。
        </p>
      </div>
    </div>
    <div class="ways">
      <a class="way" href="/lab">
        <p class="label label--cold">Founding Member · 上限50名</p>
        <h3 class="h2">COLDRAW Lab</h3>
        <p class="small">小伝馬町の開発拠点へ。開発中のものを飲み、評価し、商品化を投票で決める。通し番号は永久に残ります。</p>
        <p class="way__price">¥180,000 / 年 &nbsp;·&nbsp; ${50 - 43} seats left</p>
      </a>
      <a class="way" href="/creators">
        <p class="label label--cold">Creator ごとに発行</p>
        <h3 class="h2">Creator Pass</h3>
        <p class="small">特定の作り手を継続的に体験し、支える。回数券ではありません。「残り◯回」を数える設計にしていません。</p>
        <p class="way__price">¥72,000 – ¥150,000 / 年</p>
      </a>
      <a class="way" href="/table">
        <p class="label label--cold">8 – 12名</p>
        <h3 class="h2">Creator's Table</h3>
        <p class="small">作り手と少人数で囲む食卓。席順はこちらで組みます。誰が来るかは、事前に公開しません。</p>
        <p class="way__price">¥18,000 – ¥35,000 / 回</p>
      </a>
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="wrap read">
    <p class="label">Note</p>
    <p class="body" style="margin-top:14px">
      運営はsPods。抽出技術はCOLDRAWによるものですが、このサービスの主役は機械ではありません。
      作り手と、それを見つけたあなたです。
    </p>
  </div>
</section>`;
}

function creatorRow(c) {
  return `<a class="creator-row" href="/creator?id=${c.id}">
    <span class="creator-row__sig">${signatureSVG(c.taste, c.hue, c.id)}</span>
    <span>
      <h3 class="creator-row__name">${esc(c.name)}</h3>
      <p class="creator-row__latin">${esc(c.latin)} · ${esc(c.discipline)} · ${esc(c.base)}</p>
      <p class="creator-row__belief">${esc(c.belief)}</p>
      ${c.developing ? `<p class="developing" style="margin-top:14px">Now developing</p>` : ''}
    </span>
    <span class="creator-row__meta">
      <span class="small mono">Supporters ${c.supporters}</span>
      <span class="small mono">Since ${c.sinceEarliest}</span>
    </span>
  </a>`;
}

/* ============================================================
   DISCOVER CREATORS
   ============================================================ */

export function creatorsPage() {
  const disciplines = [...new Set(creators.map((c) => c.discipline))];
  const axesFilters = [
    ['bitterness', '苦味が強い'],
    ['acidity', '酸が強い'],
    ['aroma', '香りが強い'],
    ['finish', '余韻が長い']
  ];

  return `
<section class="section">
  <div class="wrap">
    <p class="label">Discover</p>
    <h1 class="h1" style="margin-top:18px;max-width:14em">作り手から探す。</h1>
    <p class="lede read" style="margin-top:22px">
      ジャンルや価格帯では並べません。<strong>いま開発中のものがある人</strong>が上に来ます。
      星の数もレビューもありません。あるのは、その人が何を信じているかだけです。
    </p>

    <div class="filters" style="margin-top:44px">
      <button class="chip" data-f="all" aria-pressed="true">All</button>
      ${disciplines.map((d) => `<button class="chip" data-f="d:${esc(d)}" aria-pressed="false">${esc(d)}</button>`).join('')}
      <span style="width:14px"></span>
      ${axesFilters.map(([k, l]) => `<button class="chip" data-f="a:${k}" aria-pressed="false">${l}</button>`).join('')}
    </div>

    <div id="creator-list" style="margin-top:34px">
      ${sortedCreators().map(creatorRow).join('')}
    </div>
  </div>
</section>`;
}

function sortedCreators(filter = 'all') {
  let list = creators.slice();
  if (filter.startsWith('d:')) list = list.filter((c) => c.discipline === filter.slice(2));
  if (filter.startsWith('a:')) {
    const k = filter.slice(2);
    list = list.filter((c) => c.taste[k] >= 70).sort((a, b) => b.taste[k] - a.taste[k]);
    return list;
  }
  // default: Now developing が先。次に支援開始の古い順
  return list.sort((a, b) => {
    const d = (b.developing ? 1 : 0) - (a.developing ? 1 : 0);
    return d !== 0 ? d : a.sinceEarliest.localeCompare(b.sinceEarliest);
  });
}

export function creatorsPageBind() {
  const chips = [...document.querySelectorAll('.chip[data-f]')];
  const list = document.getElementById('creator-list');
  chips.forEach((chip) =>
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      const rows = sortedCreators(chip.dataset.f);
      list.innerHTML = rows.length
        ? rows.map(creatorRow).join('')
        : '<p class="lede" style="padding:40px 0">該当する作り手はまだいません。</p>';
    })
  );
}

/* ============================================================
   CREATOR PROFILE
   ============================================================ */

export function creatorPage() {
  const c = getCreator(qs('id')) || creators[0];
  const xs = experiencesOf(c.id);
  const mine = me.patronages.find((p) => p.creatorId === c.id);

  return `
<section class="creator-head">
  <div class="wrap creator-head__grid">
    <div>
      <p class="label">${esc(c.discipline)} · ${esc(c.base)}</p>
      <h1 class="creator-head__name" style="margin-top:16px">${esc(c.name)}</h1>
      <p class="label" style="margin-top:12px">${esc(c.latin)}</p>
      <p class="creator-head__belief">${esc(c.belief)}</p>
      <div style="display:flex;gap:40px;flex-wrap:wrap;margin-top:44px;padding-top:22px;border-top:1px solid rgba(244,241,236,.2)">
        <div class="stat"><span class="stat__n">${c.supporters}</span><span class="stat__k" style="color:rgba(244,241,236,.55)">Supporters</span></div>
        <div class="stat"><span class="stat__n">${c.sinceEarliest}</span><span class="stat__k" style="color:rgba(244,241,236,.55)">Earliest supporter</span></div>
        <div class="stat"><span class="stat__n">${c.foundingIssued}/${c.foundingCap}</span><span class="stat__k" style="color:rgba(244,241,236,.55)">Founding supporters</span></div>
      </div>
    </div>
    <div>
      <div style="width:100%;aspect-ratio:1">${signatureSVG(c.taste, c.hue, c.id, { onDark: true })}</div>
      <div style="margin-top:24px">${axesBlock(c.taste, true)}</div>
    </div>
  </div>
</section>

${
  c.developing
    ? `<section class="section section--tight" style="background:var(--paper-2);border-bottom:1px solid var(--line)">
  <div class="wrap cols">
    <div><p class="developing">Now developing</p></div>
    <div>
      <p class="h2 serif read">${esc(c.developing)}</p>
      <p class="small" style="margin-top:16px">
        完成していないものを隠しません。Pass保持者は、これを最初に飲みます。
      </p>
    </div>
  </div>
</section>`
    : ''
}

<section class="section">
  <div class="wrap cols">
    <div><p class="label">About</p></div>
    <div class="read stack">
      ${c.bio.map((p) => `<p class="lede">${esc(p)}</p>`).join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap cols">
    <div><p class="label">Works</p></div>
    <div>
      ${c.works
        .map(
          (w) => `<div class="item" style="grid-template-columns:80px 1fr;cursor:default">
          <span class="item__when">${w.year}</span>
          <span>
            <span class="item__title">${esc(w.title)}</span>
            <p class="item__sub">${esc(w.note)}</p>
          </span>
        </div>`
        )
        .join('')}
    </div>
  </div>
</section>

<section class="section" id="experiences">
  <div class="wrap cols">
    <div><p class="label">Upcoming</p></div>
    <div>
      ${xs.length ? xs.map(experienceRow).join('') : '<p class="lede">現在、予定されているExperienceはありません。</p>'}
    </div>
  </div>
</section>

<section class="section" id="register">
  <div class="wrap cols">
    <div>
      <p class="label">Supporter Register</p>
      <p class="small" style="margin-top:14px;max-width:24ch">
        順位はつけません。金額も出しません。並び順は、体験・紹介・開発参加の重み付けです。
      </p>
    </div>
    <div>
      <h2 class="h2" style="margin-bottom:8px">この人を支えてきた人たち</h2>
      <p class="small" style="margin-bottom:26px">
        Founding Supporter は先着${c.foundingCap}名で固定されています。以後、増えません。
      </p>
      ${registerTable(c)}
      ${
        mine
          ? `<div style="margin-top:34px;max-width:480px">
              <p class="label" style="margin-bottom:14px">Your record with ${esc(c.latin)}</p>
              ${recordCard(mine)}
            </div>`
          : ''
      }
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap cols">
    <div><p class="label">Support</p></div>
    <div>
      <h2 class="h1" style="max-width:14em">この人を、続けて支える。</h2>
      <p class="lede read" style="margin-top:22px">${esc(c.pass.creatorNote)}</p>
      <p class="small mono" style="margin-top:14px">— ${esc(c.latin)}</p>
      <p style="margin-top:34px"><a class="btn" href="/pass?id=${c.id}">${esc(c.name)} の Creator Pass を見る</a></p>
    </div>
  </div>
</section>`;
}

/* ============================================================
   CREATOR PASS
   ============================================================ */

export function passPage() {
  const c = getCreator(qs('id')) || creators[0];
  const mine = me.patronages.find((p) => p.creatorId === c.id);

  return `
<section class="section">
  <div class="wrap">
    <p class="label"><a href="/creator?id=${c.id}" style="text-decoration:none">${esc(c.name)}</a> — Creator Pass</p>
    <h1 class="h1" style="margin-top:18px">回数券ではありません。<br>関係の契約です。</h1>
    <p class="lede read" style="margin-top:24px">
      このページに「1回あたり◯円」は書いてありません。「残り◯回」も表示しません。
      Passは消化するものではなく、<strong>あなたがこの人の支援者であること</strong>そのものだからです。
    </p>

    <div class="pass" style="margin-top:52px">
      <div class="pass__left">
        <p class="label">Includes</p>
        <ul class="includes" style="margin-top:22px">
          ${c.pass.includes.map((i) => `<li><span>${esc(i)}</span></li>`).join('')}
        </ul>
        <div class="rule" style="margin:32px 0"></div>
        <p class="label">Not included</p>
        <ul class="excludes" style="margin-top:18px">
          <li><span>割引・優待価格</span></li>
          <li><span>1回あたりの単価表示</span></li>
          <li><span>他のCreatorへの流用</span></li>
        </ul>
      </div>
      <div class="pass__right">
        <p class="label">From ${esc(c.latin)}</p>
        <p class="h3 serif" style="margin-top:18px;line-height:1.85">${esc(c.pass.creatorNote)}</p>
        <div class="rule" style="margin:32px 0"></div>
        <p class="label">Issuance</p>
        ${issuance(c.pass.issued, c.pass.cap)}
        <p class="small" style="margin-top:18px">
          発行上限を設けているのは、希少性の演出ではありません。
          ${esc(c.name)}が1年に会える人数に上限があるからです。
        </p>
      </div>
    </div>

    <div class="cols" style="margin-top:64px">
      <div><p class="label">Where the money goes</p></div>
      <div class="read stack">
        <p class="body">
          Pass代金の <strong class="mono">70%</strong> は ${esc(c.name)} に渡ります。
          残りが運営費です。<strong>作り手から集客手数料は取りません。</strong>
        </p>
        <p class="body">
          運営の収益源はあなたからの会費であって、作り手からの送客手数料ではありません。
          これが、グルメメディアや予約サイトとの決定的な違いです。
        </p>
      </div>
    </div>

    <div class="cols" style="margin-top:56px">
      <div><p class="label">Price</p></div>
      <div>
        <p class="mono" style="font-size:20px">${yen(c.pass.price)} / 年</p>
        <p class="small" style="margin-top:10px">体験ごとの代金は別途。Passは優先予約権とAccessの権利です。</p>
        <p style="margin-top:26px">
          ${
            mine
              ? `<span class="btn btn--ghost">${jaMonth(mine.since)}から支援中 — ${monthsSince(mine.since)}ヶ月</span>`
              : `<a class="btn" href="#">Passを開始する</a>`
          }
        </p>
        ${
          mine
            ? `<div style="max-width:460px;margin-top:32px">${recordCard(mine)}</div>`
            : ''
        }
      </div>
    </div>
  </div>
</section>`;
}

/* ============================================================
   EXPERIENCES (一覧)
   ============================================================ */

export function experiencesPage() {
  const sorted = experiences.slice().sort((a, b) => a.date.localeCompare(b.date));
  return `
<section class="section">
  <div class="wrap">
    <p class="label">Experiences</p>
    <h1 class="h1" style="margin-top:18px">Dinner、Tasting、そして<br>まだ商品ではないもの。</h1>
    <p class="lede read" style="margin-top:22px">
      同席者は事前に公開しません。誰が来るかで参加を決めてほしくないからです。
      決めてほしいのは、<strong>誰の、何を体験するか</strong>だけです。
    </p>
    <div style="margin-top:44px">${sorted.map(experienceRow).join('')}</div>
  </div>
</section>`;
}

/* ============================================================
   EXPERIENCE DETAIL
   ============================================================ */

export function experiencePage() {
  const x = experiences.find((e) => e.id === qs('id')) || experiences[0];
  const c = x.creatorId ? getCreator(x.creatorId) : null;
  const full = x.taken >= x.seats;

  return `
<section class="section">
  <div class="wrap">
    <p class="label">${kindTag(x.kind)} &nbsp; ${c ? `<a href="/creator?id=${c.id}" style="text-decoration:none">${esc(c.name)}</a>` : 'UNDERCURRENT Lab'}</p>
    <h1 class="h1" style="margin-top:20px;max-width:16em">${esc(x.title)}</h1>

    <div class="hero__meta" style="margin-top:44px">
      <div class="stat"><span class="stat__n">${x.date}</span><span class="stat__k">Date</span></div>
      <div class="stat"><span class="stat__n" style="font-size:20px">${esc(x.time)}</span><span class="stat__k">Time</span></div>
      <div class="stat"><span class="stat__n">${x.seats}</span><span class="stat__k">Seats</span></div>
      <div class="stat"><span class="stat__n">${full ? '満席' : x.seats - x.taken}</span><span class="stat__k">${full ? 'Status' : 'Remaining'}</span></div>
    </div>

    <div class="cols" style="margin-top:64px">
      <div><p class="label">What happens</p></div>
      <div class="read stack">
        ${x.prose.map((p) => `<p class="lede">${esc(p)}</p>`).join('')}
        ${
          x.kind === 'prototype'
            ? `<div class="callout callout--ember"><p class="body body--ink">
                 あなたの評価は、商品化の判断に直接使われます。感想ではなく判定を求められます。
               </p></div>`
            : ''
        }
      </div>
    </div>

    ${
      x.prompt
        ? `<div class="cols" style="margin-top:56px">
      <div><p class="label">On the table</p></div>
      <div>
        <p class="small read">当日、テーブルに1枚だけ置かれる問いです。会話の起点を偶然に任せません。</p>
        <p class="h2 serif read" style="margin-top:20px">「${esc(x.prompt)}」</p>
        <p class="small read" style="margin-top:20px">
          議論の対象を人ではなくモノに固定すると、初対面でも意見の交換が成立します。
          その結果として、人となりが伝わります。
        </p>
      </div>
    </div>`
        : ''
    }

    <div class="cols" style="margin-top:56px">
      <div><p class="label">Practical</p></div>
      <div class="read">
        <div class="record">
          <dl class="record__rows">
            <div class="record__row"><dt>Place</dt><dd style="font-family:var(--sans)">${esc(x.place)}</dd></div>
            <div class="record__row"><dt>Seats</dt><dd>${x.taken} / ${x.seats}</dd></div>
            <div class="record__row"><dt>Price</dt><dd>${x.price ? yen(x.price) : '—'}</dd></div>
            <div class="record__row"><dt>Eligibility</dt><dd style="font-family:var(--sans);font-size:13px">${
              x.labOnly ? 'Lab Founding Member' : x.passOnly ? 'Creator Pass 保持者' : '誰でも（Pass保持者が優先）'
            }</dd></div>
          </dl>
        </div>
        <p class="small" style="margin-top:18px">
          席順はこちらで組みます。同じ作り手を支援していて、入口が違う方を隣にします。
          名札に書くのは、お名前と、この作り手を支援している期間だけです。職業は書きません。
        </p>
        <p style="margin-top:28px">
          ${full ? '<span class="btn btn--ghost">満席 — キャンセル待ちに入る</span>' : '<a class="btn" href="#">参加する</a>'}
        </p>
      </div>
    </div>
  </div>
</section>`;
}

/* ============================================================
   MY PROFILE
   ============================================================ */

export function mePage() {
  const totals = me.patronages.reduce(
    (a, p) => ({
      exp: a.exp + p.exp,
      intro: a.intro + p.intro,
      proto: a.proto + p.proto,
      recipes: a.recipes + p.recipes,
      down: a.down + p.downstream
    }),
    { exp: 0, intro: 0, proto: 0, recipes: 0, down: 0 }
  );

  const top = me.patronages[0];
  const topCreator = getCreator(top.creatorId);

  return `
<section class="section">
  <div class="wrap">
    <p class="label">My Record</p>
    <h1 class="h1" style="margin-top:18px">${esc(me.name)}</h1>
    <p class="label" style="margin-top:10px">${esc(me.latin)} · Founding Member No. ${String(me.labNo).padStart(3, '0')} · Since ${me.joined}</p>
    <p class="small mono" style="margin-top:8px">Introduced by ${esc(me.introducedBy)}</p>

    <div class="hero__meta">
      ${stat(totals.exp, 'Experiences')}
      ${stat(totals.intro, 'Introduced')}
      ${stat(totals.down, 'Downstream')}
      ${stat(totals.proto, 'Prototypes')}
      ${stat(totals.recipes, 'Recipes')}
    </div>
  </div>
</section>

${
  me.notices.length
    ? `<section class="section section--tight" style="background:var(--paper-2);border-top:1px solid var(--line);border-bottom:1px solid var(--line)">
  <div class="wrap cols">
    <div><p class="label label--cold">Notice</p><p class="small mono" style="margin-top:8px">${me.notices[0].date}</p></div>
    <div><p class="h2 serif read">${esc(me.notices[0].body)}</p></div>
  </div>
</section>`
    : ''
}

<section class="section">
  <div class="wrap cols">
    <div>
      <p class="label">Patronage</p>
      <p class="small" style="margin-top:14px;max-width:24ch">
        誰を、いつから、どのくらい支えてきたか。金額は記録しません。
      </p>
    </div>
    <div>
      <h2 class="h1" style="max-width:12em;margin-bottom:34px">あなたが支えてきた人。</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px">
        ${me.patronages
          .map(
            (p) => `<a href="/creator?id=${p.creatorId}#register" style="text-decoration:none">
              ${recordCard(p)}
              <p class="small mono" style="margin-top:10px">${p.status} · ${monthsSince(p.since)} months</p>
            </a>`
          )
          .join('')}
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap cols">
    <div><p class="label">Status</p></div>
    <div class="read">
      <p class="h2 serif" style="line-height:1.75">
        あなたは <strong>${esc(topCreator.name)}</strong> の <strong>${top.status}</strong> です。<br>
        ${jaMonth(top.since)}から支援し、${top.exp}回体験し、${top.intro}人を紹介しました。<br>
        現在のSupporter ${topCreator.supporters}名のうち、最も早い${topCreator.foundingCap}名の一人です。
      </p>
      <p class="small" style="margin-top:26px">
        進捗バーも、次の段階までの残り回数も表示しません。Statusは達成するものではなく、
        振り返ったときにそこにあるものだからです。
      </p>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap cols">
    <div>
      <p class="label">Taste Profile</p>
      <p class="small" style="margin-top:14px;max-width:24ch">
        あなたが選んだExperienceと、返した評価から作られています。自己申告ではありません。
      </p>
    </div>
    <div style="display:grid;grid-template-columns:200px 1fr;gap:44px;align-items:start">
      <div style="width:200px;aspect-ratio:1">${signatureSVG(me.taste, 210, 'me')}</div>
      <div>
        ${axesBlock(me.taste)}
        <div class="stack" style="margin-top:28px">
          ${me.tasteWords.map((w) => `<p class="body">— ${esc(w)}</p>`).join('')}
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap cols">
    <div>
      <p class="label">Access available</p>
      <p class="small" style="margin-top:14px;max-width:24ch">
        Rewardは値引きではありません。作り手との距離です。
      </p>
    </div>
    <div>
      ${me.access
        .map(
          (a) => `<div class="item" style="grid-template-columns:1fr auto;cursor:default;opacity:${a.open ? 1 : 0.45}">
          <span>
            <span class="item__title">${esc(a.label)}</span>
            <p class="item__sub">${esc(a.detail)}</p>
          </span>
          <span class="item__right">${a.open ? 'Open' : 'Not yet'}</span>
        </div>`
        )
        .join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap cols">
    <div><p class="label">Contributions</p></div>
    <div>
      <h2 class="h2" style="margin-bottom:26px">してきたこと。</h2>
      <div class="ledger">
        ${me.ledger
          .map(
            (l) => `<div class="ledger__row">
            <span class="ledger__date">${l.date}</span>
            <span class="ledger__type">${LEDGER_LABELS[l.type]}</span>
            <p class="ledger__what">${esc(l.what)}</p>
            <span class="ledger__who">${esc(l.who)}</span>
          </div>`
          )
          .join('')}
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap cols">
    <div><p class="label">Share</p></div>
    <div>
      <h2 class="h1" style="">自分で言わなくても、<br>伝わる形にする。</h2>
      <p class="lede read" style="margin-top:22px">
        金額も順位も入りません。入るのは、いつから支えているかと、何をしてきたかだけです。
      </p>
      <p style="margin-top:30px"><a class="btn" href="/share?creator=${top.creatorId}">記録カードを作る</a></p>
    </div>
  </div>
</section>`;
}

/* ============================================================
   COLDRAW LAB
   ============================================================ */

export function labPage() {
  const upcoming = labSessions.filter((s) => s.status === 'upcoming');
  const past = labSessions.filter((s) => s.status === 'done');

  return `
<section class="section">
  <div class="wrap">
    <p class="label">${esc(BRAND.lab)} · Founding Member 上限50名</p>
    <h1 class="display" style="margin-top:22px">まだ出来て<br>いないものの、<br>中に入る。</h1>
    <p class="lede read" style="margin-top:32px">
      小伝馬町に、作り手との共創拠点があります。ここで飲めるものの多くは、まだ商品ではありません。
      商品にするかどうかを、その場にいる人の投票で決めています。
    </p>
    <div class="hero__meta">
      ${stat('43 / 50', 'Founding Members')}
      ${stat('26', 'Sessions held')}
      ${stat('9', 'Products shipped')}
      ${stat('¥180,000', 'Per year')}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap cols">
    <div><p class="label">Why this comes first</p></div>
    <div class="read stack">
      <p class="lede">
        導入店もSKUもまだ十分ではありません。この段階で巨大なDiscovery Platformを作れば、
        空のディレクトリができるだけです。
      </p>
      <p class="lede">
        だから逆にしました。<strong>在庫が少ないことを、そのまま価値にします。</strong>
        早く入った人ほど、まだ何も決まっていない状態に立ち会えます。50という上限は、
        後から入れないことを保証するための数字です。
      </p>
      <div class="callout">
        <p class="body body--ink">
          Founding Member No. は、脱退しても消えません。数年後に「No.007 だった」という事実は残ります。
          それが、このメンバーシップが本当に売っているものです。
        </p>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap cols">
    <div><p class="label">Includes</p></div>
    <div>
      <ul class="includes read">
        <li><span>Lab Session 参加権 年6回 — 開発中のものを飲み、評価する</span></li>
        <li><span>商品化投票権 — 投票結果は実際にSKUの決定に使われます</span></li>
        <li><span>Prototype Tasting への優先案内</span></li>
        <li><span>同伴1名の権利 年2回</span></li>
        <li><span>Founding Member No. の永久保持</span></li>
      </ul>
      <div class="rule" style="margin:32px 0;max-width:660px"></div>
      <ul class="excludes read">
        <li><span>割引・優待価格</span></li>
        <li><span>ポイント・スタンプの類</span></li>
      </ul>
      <div style="max-width:420px;margin-top:32px">${issuance(43, 50)}</div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap cols">
    <div><p class="label">Next session</p></div>
    <div>
      ${upcoming
        .map(
          (s) => `<div class="item" style="grid-template-columns:80px 1fr auto;cursor:default">
        <span class="item__when">#${s.n}</span>
        <span>
          <span class="item__title">${esc(s.title)}</span>
          <p class="item__sub">${esc(s.note || '')}</p>
        </span>
        <span class="item__right">${s.date}</span>
      </div>`
        )
        .join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap cols">
    <div>
      <p class="label">What was decided</p>
      <p class="small" style="margin-top:14px;max-width:24ch">
        投票の結果と、その後どうなったかを全部公開します。参加した人の貢献の証明になるからです。
      </p>
    </div>
    <div>
      ${past
        .map(
          (s) => `<div style="padding:26px 0;border-bottom:1px solid var(--line-soft)">
        <div style="display:flex;gap:18px;align-items:baseline;flex-wrap:wrap">
          <span class="item__when">#${s.n}</span>
          <span class="item__when">${s.date}</span>
          <span class="item__title">${esc(s.title)}</span>
        </div>
        <p class="body" style="margin-top:12px;max-width:60ch">${esc(s.outcome)}</p>
        <p class="small mono" style="margin-top:8px">${esc(s.votes)}</p>
      </div>`
        )
        .join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <p><a class="btn" href="#">Founding Member に申し込む — ${50 - 43}枠</a></p>
    <p class="small" style="margin-top:14px">申込後、まず一度Lab Sessionに参加していただきます。合わないと感じたら、そこで終わりで構いません。</p>
  </div>
</section>`;
}

/* ============================================================
   CREATOR'S TABLE
   ============================================================ */

export function tablePage() {
  const tables = experiences.filter((x) => x.kind === 'table');

  return `
<section class="section">
  <div class="wrap">
    <p class="label">Creator's Table · 8 – 12 seats</p>
    <h1 class="display" style="margin-top:22px">人に会うために<br>集まらない。</h1>
    <p class="lede read" style="margin-top:32px">
      同じ作り手を支えている8〜12人が、その人を囲んで食事をします。
      全員がその作品に興味を持っているので、最初から共通の言葉があります。
    </p>
  </div>
</section>

<section class="section">
  <div class="wrap cols">
    <div><p class="label">The difference</p></div>
    <div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid var(--line)">
        <div style="padding:32px;border-right:1px solid var(--line)">
          <p class="label">交流会・マッチング</p>
          <p class="h3 serif" style="margin-top:16px">「何のお仕事をされていますか？」</p>
          <p class="small" style="margin-top:16px">
            出会いに来たという意図が全員に見えている。だから探り合いになる。
          </p>
        </div>
        <div style="padding:32px;background:var(--paper-2)">
          <p class="label label--cold">Creator's Table</p>
          <p class="h3 serif" style="margin-top:16px">「この前の山椒のRecipe、どうでした？」</p>
          <p class="small" style="margin-top:16px">
            参加理由が作り手にあるので、会話が作品から始まる。人となりは、その結果として伝わる。
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap cols">
    <div><p class="label">How we seat you</p></div>
    <div class="read stack">
      <p class="lede">席順はこちらで組みます。選べません。これは制約ではなく、この体験の中身です。</p>
      <ul class="includes">
        <li><span>Taste Profileが近いだけの人を隣にしません。似すぎていると会話が起きません。</span></li>
        <li><span>同じ作り手を支えていて、<strong>入口が違う人</strong>を隣にします。</span></li>
        <li><span>支援歴の長い人と短い人を混ぜます。先輩が語れる構造になります。</span></li>
        <li><span>名札に書くのは、お名前と、その作り手を支援している期間だけ。職業も会社も書きません。</span></li>
        <li><span>参加者は事前に公開しません。誰が来るかで参加を決めてほしくないからです。</span></li>
      </ul>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap cols">
    <div><p class="label">On the table</p></div>
    <div>
      <p class="lede read">会話の起点は、偶然に任せません。テーブルに1枚だけ、その日の問いが置かれます。</p>
      <div class="stack-lg" style="margin-top:32px">
        ${[
          '今日の2番と4番、どちらを商品化すべきか。理由を一つ。',
          'この香りを、自分ならどの料理に合わせるか。',
          'この作り手を、誰に紹介したいか。'
        ]
          .map((q) => `<p class="h2 serif read">「${esc(q)}」</p>`)
          .join('')}
      </div>
      <p class="small read" style="margin-top:32px">
        議論の対象を人ではなくモノに固定すると、初対面でも意見の交換が成立します。
        恋人でも、友人でも、仕事仲間でも構いません。関係の種類は限定しません。
      </p>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap cols">
    <div><p class="label">Upcoming tables</p></div>
    <div>${tables.map(experienceRow).join('')}</div>
  </div>
</section>`;
}

/* ============================================================
   SHAREABLE RECORD
   ============================================================ */

export function sharePage() {
  const cid = qs('creator') || me.patronages[0].creatorId;
  const p = me.patronages.find((x) => x.creatorId === cid) || me.patronages[0];
  const c = getCreator(p.creatorId);

  const rows = [
    ['Supporting since', jaMonth(p.since)],
    ['Experiences', p.exp],
    ['Introduced', p.intro],
    ['Prototype tastings', p.proto]
  ];

  return `
<section class="section">
  <div class="wrap">
    <p class="label">Shareable Record</p>
    <h1 class="h1" style="margin-top:18px">自慢しなくていい。<br>事実だけを、綺麗に組む。</h1>
    <p class="lede read" style="margin-top:22px">
      金額も、順位も、パーセンタイルも入りません。読んだ人に伝わってほしいのは
      「この人は本当にこの作り手が好きなんだな」であって、「この人は金を使っているな」ではありません。
    </p>

    <div class="filters" style="margin-top:40px">
      ${me.patronages
        .map(
          (x) =>
            `<a class="chip" href="/share?creator=${x.creatorId}" aria-pressed="${x.creatorId === cid}" style="text-decoration:none">${esc(
              getCreator(x.creatorId).name
            )}</a>`
        )
        .join('')}
    </div>

    <div class="card-stage" style="margin-top:32px">
      <div class="sharecard">
        <div class="sharecard__sig">${signatureSVG(c.taste, c.hue, c.id, { onDark: true, rings: 5 })}</div>
        <p class="sharecard__brand">Undercurrent</p>
        <div style="margin-top:28px;position:relative">
          <p class="sharecard__name">${esc(c.name)}</p>
          <p class="sharecard__role">${esc(c.discipline)} · ${esc(c.base)}</p>
        </div>
        <div class="sharecard__rows">
          ${rows
            .map(([k, v]) => `<div class="sharecard__row"><span>${k}</span><span>${esc(v)}</span></div>`)
            .join('')}
          <div class="sharecard__row" style="border-bottom:0">
            <span>${esc(me.latin)}</span>
            <span>${p.no ? 'No. ' + String(p.no).padStart(3, '0') : '—'}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="cols" style="margin-top:56px">
      <div><p class="label">What is never printed</p></div>
      <div>
        <ul class="excludes read">
          <li><span>支払った金額</span></li>
          <li><span>Supporterの中での順位・パーセンタイル</span></li>
          <li><span>他の人との比較</span></li>
          <li><span>ポイント、スコア、レベル</span></li>
        </ul>
        <p class="small read" style="margin-top:26px">
          共有ボタンは目立たせていません。これは拡散のための道具ではなく、
          自分の記録を保存しておくためのものです。結果として共有されるなら、それでいい。
        </p>
      </div>
    </div>
  </div>
</section>`;
}
