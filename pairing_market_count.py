#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
pairing_market_count.py

食べログと一休で「ペアリング」関連4キーワードの検索ヒット総件数を取得し、
ノンアルコールペアリング/ペアリングの比率とギャップ店舗数を表示する。

- requests + 正規表現で取得
- リクエスト間隔 3秒
- 計8回のみ（2サイト × 4キーワード）
- HTML構造が想定と違って件数が取れない場合は、HTMLから件数らしき表記を探して報告
"""

import re
import sys
import time
import urllib.parse

import requests

KEYWORDS = [
    "ペアリング",
    "ワインペアリング",
    "ノンアルコールペアリング",
    "ノンアルペアリング",
]

REQUEST_INTERVAL = 3  # 秒
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": (
        "text/html,application/xhtml+xml,application/xml;q=0.9,"
        "image/avif,image/webp,*/*;q=0.8"
    ),
    "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
}


def build_url(site, keyword):
    enc = urllib.parse.quote(keyword)
    if site == "tabelog":
        return f"https://tabelog.com/rstLst/?sw={enc}"
    elif site == "ikyu":
        return f"https://restaurant.ikyu.com/search?keyword={enc}"
    raise ValueError(site)


def fetch(url):
    resp = requests.get(url, headers=HEADERS, timeout=30)
    resp.encoding = resp.apparent_encoding or resp.encoding
    return resp


# ---- 件数抽出ロジック ----

def parse_int(s):
    return int(re.sub(r"[^\d]", "", s))


def extract_tabelog(html):
    """
    食べログ: 検索結果の総件数は本文/メタの「お店 21,272件」のような表記に出る。
    （「次の20件」等のページネーション表記を誤検出しないよう、件数を限定する）
    h1 例: <h1>全国の○○に関するお店</h1> / 「お店 N件」
    """
    patterns = [
        r'人気のお店\s*([\d,]+)\s*件',          # メタ description / 見出し横
        r'に関するお店</h1>\s*<[^>]*>\s*([\d,]+)\s*件',
        r'お店\s*([\d,]+)\s*件',                # 「お店 21,272件」
        r'該当する?店舗?\s*[:：]?\s*([\d,]+)\s*件',
        r'list-condition__count[^>]*>\s*([\d,]+)\s*<',
    ]
    for pat in patterns:
        m = re.search(pat, html)
        if m:
            return parse_int(m.group(1)), pat
    return None, None


def extract_ikyu(html):
    """
    一休: 「○○件」「該当 ○○件」「検索結果 ○○件」等のパターンを探す。
    """
    patterns = [
        r'検索結果[^<]*?([\d,]+)\s*件',
        r'該当[^<]*?([\d,]+)\s*件',
        r'"?(?:total|count|hitCount|resultCount)"?\s*[:=]\s*"?([\d,]+)',
        r'([\d,]+)\s*件',
    ]
    for pat in patterns:
        m = re.search(pat, html)
        if m:
            return parse_int(m.group(1)), pat
    return None, None


def find_count_like(html, limit=8):
    """件数が取れない場合、HTML中の『数字＋件』らしき表記を抜き出して報告する。"""
    found = []
    for m in re.finditer(r'.{0,30}?([\d,]{1,9})\s*件.{0,5}', html):
        snippet = re.sub(r'\s+', ' ', m.group(0)).strip()
        found.append(snippet)
        if len(found) >= limit:
            break
    return found


def main():
    results = {}  # (site) -> {keyword: count or None}
    request_no = 0
    total_requests = len(KEYWORDS) * 2  # 8回

    sites = ["tabelog", "ikyu"]
    extractors = {"tabelog": extract_tabelog, "ikyu": extract_ikyu}
    site_label = {"tabelog": "食べログ", "ikyu": "一休"}

    for site in sites:
        results[site] = {}
        for kw in KEYWORDS:
            request_no += 1
            url = build_url(site, kw)
            print(f"[{request_no}/{total_requests}] {site_label[site]} / 「{kw}」")
            print(f"    GET {url}")
            count = None
            try:
                resp = fetch(url)
                print(f"    HTTP {resp.status_code}, {len(resp.text)} bytes")
                count, used_pat = extractors[site](resp.text)
                if count is not None:
                    print(f"    → 件数: {count:,} 件  (pattern: {used_pat})")
                else:
                    print("    → 件数を想定パターンで取得できませんでした。")
                    print("    HTMLから件数らしき表記を探索:")
                    candidates = find_count_like(resp.text)
                    if candidates:
                        for c in candidates:
                            print(f"        | {c}")
                    else:
                        # タイトルや結果なし表記を報告
                        title = re.search(r'<title>(.*?)</title>', resp.text, re.S)
                        if title:
                            print(f"        <title>: {title.group(1).strip()[:120]}")
                        if re.search(r'(該当|見つかりませ|0\s*件|ありません)', resp.text):
                            print("        『該当なし/0件』系の表記を検出しました。")
                        print("        『○○件』表記は見つかりませんでした。")
            except Exception as e:
                print(f"    リクエスト失敗: {e!r}")

            results[site][kw] = count

            # 最後のリクエスト以外は3秒待機
            if request_no < total_requests:
                time.sleep(REQUEST_INTERVAL)
            print()

    # ---- 集計・レポート ----
    print("=" * 60)
    print("【検索ヒット件数まとめ】")
    print("=" * 60)
    header = f"{'キーワード':<22}{'食べログ':>12}{'一休':>12}{'合計':>12}"
    print(header)
    print("-" * 60)

    totals = {}
    for kw in KEYWORDS:
        tb = results["tabelog"].get(kw)
        ik = results["ikyu"].get(kw)
        tb_s = f"{tb:,}" if tb is not None else "取得不可"
        ik_s = f"{ik:,}" if ik is not None else "取得不可"
        if tb is not None or ik is not None:
            tot = (tb or 0) + (ik or 0)
            totals[kw] = tot
            tot_s = f"{tot:,}"
        else:
            totals[kw] = None
            tot_s = "取得不可"
        # 全角を考慮した簡易整形
        print(f"{kw:<22}{tb_s:>12}{ik_s:>12}{tot_s:>12}")

    print("=" * 60)
    print("【比率とギャップ（ノンアルコールペアリング vs ペアリング）】")
    print("=" * 60)

    base = totals.get("ペアリング")
    nonalc = totals.get("ノンアルコールペアリング")

    if base is None or nonalc is None:
        print("件数を取得できなかったため、比率・ギャップを算出できません。")
        print(f"  ペアリング合計            : {base}")
        print(f"  ノンアルコールペアリング合計: {nonalc}")
    else:
        print(f"  ペアリング 総件数             : {base:,} 件")
        print(f"  ノンアルコールペアリング 総件数: {nonalc:,} 件")
        if base > 0:
            ratio = nonalc / base
            print(f"  比率 (ノンアル ÷ ペアリング)  : {ratio:.4f}  ({ratio*100:.2f}%)")
        else:
            print("  比率: ペアリング件数が0のため算出不可")
        gap = base - nonalc
        print(f"  差分 / ギャップ店舗数          : {gap:,} 件")
        print(f"    （ペアリング対応はあるがノンアルコール未対応の概算ギャップ）")


if __name__ == "__main__":
    main()
