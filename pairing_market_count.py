#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
食べログ・一休でのペアリング関連キーワードの検索ヒット件数を取得する。

- 食べログ: https://tabelog.com/rstLst/?sw=キーワード
- 一休    : https://restaurant.ikyu.com/search?keyword=キーワード

対象キーワード（4種）:
  ペアリング / ワインペアリング / ノンアルコールペアリング / ノンアルペアリング

requests + 正規表現で件数を取得。リクエスト間隔は3秒、計8回（4キーワード×2サイト）のみ。
最後に「ノンアルコールペアリング ÷ ペアリング」の比率と差分（ギャップ店舗数）を表示する。
件数が取れない場合は、取得HTMLから件数らしき表記を探して報告する。
"""

import re
import sys
import time
import urllib.parse

import requests

INTERVAL_SEC = 3.0
TIMEOUT_SEC = 20

KEYWORDS = [
    "ペアリング",
    "ワインペアリング",
    "ノンアルコールペアリング",
    "ノンアルペアリング",
]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
}

# 「○○件」のような件数らしき表記を拾う汎用パターン（フォールバック報告用）
COUNT_LIKE_RE = re.compile(r"([\d,]{1,12})\s*件")


def to_int(num_str):
    """'1,234' -> 1234"""
    return int(num_str.replace(",", ""))


def fetch(url):
    """URLを取得して (status_code, text) を返す。失敗時は (None, error文字列)。"""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT_SEC)
        return resp.status_code, resp.text
    except requests.RequestException as e:
        return None, "REQUEST_ERROR: {}".format(e)


def parse_tabelog_count(html):
    """食べログの検索結果HTMLから総件数を抽出。取れなければ None。"""
    patterns = [
        # <span class="list-condition__count">1,234</span> 件
        r'list-condition__count[^>]*>\s*([\d,]+)\s*<',
        # "件" の直前にある件数（"1,234 件 の店舗" など）
        r'([\d,]+)\s*件\s*</span>',
        r'検索結果\D*([\d,]+)\s*件',
        r'([\d,]+)\s*件中',
        r'全\s*([\d,]+)\s*件',
    ]
    for pat in patterns:
        m = re.search(pat, html)
        if m:
            return to_int(m.group(1)), pat
    return None, None


def parse_ikyu_count(html):
    """一休の検索結果HTMLから総件数を抽出。取れなければ None。"""
    patterns = [
        r'([\d,]+)\s*件\s*中',
        r'全\s*([\d,]+)\s*件',
        r'検索結果\D*([\d,]+)\s*件',
        r'"totalCount"\s*:\s*"?([\d,]+)"?',
        r'"hitCount"\s*:\s*"?([\d,]+)"?',
        r'([\d,]+)\s*件\s*の',
        r'([\d,]+)\s*件',
    ]
    for pat in patterns:
        m = re.search(pat, html)
        if m:
            return to_int(m.group(1)), pat
    return None, None


def report_count_like(html, limit=10):
    """件数らしき表記（'○○件'）を抽出して上位を返す（フォールバック報告用）。"""
    found = COUNT_LIKE_RE.findall(html)
    # 件数として現実的な値のみ・重複除去・出現順を維持
    seen = []
    for f in found:
        if f not in seen:
            seen.append(f)
    return seen[:limit]


def build_url(site, keyword):
    enc = urllib.parse.quote(keyword)
    if site == "tabelog":
        return "https://tabelog.com/rstLst/?sw={}".format(enc)
    return "https://restaurant.ikyu.com/search?keyword={}".format(enc)


def run():
    sites = [
        ("tabelog", "食べログ", parse_tabelog_count),
        ("ikyu", "一休", parse_ikyu_count),
    ]

    # results[site_key][keyword] = count(int) or None
    results = {"tabelog": {}, "ikyu": {}}

    request_count = 0
    print("=" * 70)
    print("ペアリング関連キーワード 検索ヒット件数 取得")
    print("=" * 70)

    for site_key, site_name, parser in sites:
        for kw in KEYWORDS:
            url = build_url(site_key, kw)
            request_count += 1
            print("\n[{}/8] {} / 「{}」".format(request_count, site_name, kw))
            print("  URL: {}".format(url))

            status, html = fetch(url)

            # 間隔を空ける（最後のリクエストの後も待たない）
            if request_count < 8:
                time.sleep(INTERVAL_SEC)

            if status is None:
                print("  取得失敗: {}".format(html))
                results[site_key][kw] = None
                continue

            print("  HTTP status: {}".format(status))
            if status != 200:
                print("  ステータス異常のため件数抽出スキップ。")
                snippets = report_count_like(html)
                if snippets:
                    print("  HTML内の件数らしき表記: {}".format(snippets))
                results[site_key][kw] = None
                continue

            count, used_pat = parser(html)
            if count is not None:
                print("  → 件数: {:,} 件  (pattern: {})".format(count, used_pat))
                results[site_key][kw] = count
            else:
                print("  → 想定パターンで件数を抽出できませんでした。")
                snippets = report_count_like(html)
                if snippets:
                    print("  HTML内の『○○件』表記（出現順・上位）: {}".format(snippets))
                else:
                    print("  HTML内に『○○件』表記は見つかりませんでした。")
                    print("  HTML先頭500文字: {}".format(html[:500].replace("\n", " ")))
                results[site_key][kw] = None

    # ---- 集計表示 ----
    print("\n" + "=" * 70)
    print("結果サマリ")
    print("=" * 70)
    header = "{:<24}{:>14}{:>14}".format("キーワード", "食べログ", "一休")
    print(header)
    print("-" * 70)
    for kw in KEYWORDS:
        tb = results["tabelog"].get(kw)
        ik = results["ikyu"].get(kw)
        tb_s = "{:,}".format(tb) if isinstance(tb, int) else "取得不可"
        ik_s = "{:,}".format(ik) if isinstance(ik, int) else "取得不可"
        print("{:<24}{:>14}{:>14}".format(kw, tb_s, ik_s))

    # ---- 比率・ギャップ ----
    print("\n" + "=" * 70)
    print("ノンアルコールペアリング ÷ ペアリング の比率とギャップ")
    print("=" * 70)

    def ratio_gap(site_key, site_name):
        base = results[site_key].get("ペアリング")          # 分母
        na = results[site_key].get("ノンアルコールペアリング")  # 分子
        if isinstance(base, int) and isinstance(na, int) and base > 0:
            ratio = na / base
            gap = base - na
            print("\n[{}]".format(site_name))
            print("  ペアリング              : {:,} 件".format(base))
            print("  ノンアルコールペアリング: {:,} 件".format(na))
            print("  比率 (ノンアル/ペアリング): {:.4f}  ({:.2f}%)".format(ratio, ratio * 100))
            print("  ギャップ店舗数 (差分)     : {:,} 件".format(gap))
        else:
            print("\n[{}] 件数が揃わないため比率・ギャップを算出できません。"
                  " (ペアリング={}, ノンアル={})".format(site_name, base, na))

    ratio_gap("tabelog", "食べログ")
    ratio_gap("ikyu", "一休")

    # 両サイト合算
    tb_base = results["tabelog"].get("ペアリング")
    tb_na = results["tabelog"].get("ノンアルコールペアリング")
    ik_base = results["ikyu"].get("ペアリング")
    ik_na = results["ikyu"].get("ノンアルコールペアリング")
    if all(isinstance(v, int) for v in [tb_base, tb_na, ik_base, ik_na]):
        total_base = tb_base + ik_base
        total_na = tb_na + ik_na
        if total_base > 0:
            print("\n[両サイト合算]")
            print("  ペアリング合計            : {:,} 件".format(total_base))
            print("  ノンアルコールペアリング合計: {:,} 件".format(total_na))
            print("  比率: {:.4f}  ({:.2f}%)".format(total_na / total_base, total_na / total_base * 100))
            print("  ギャップ店舗数 (差分)     : {:,} 件".format(total_base - total_na))

    print("\n総リクエスト回数: {} 回".format(request_count))


if __name__ == "__main__":
    try:
        run()
    except KeyboardInterrupt:
        print("\n中断されました。", file=sys.stderr)
        sys.exit(1)
