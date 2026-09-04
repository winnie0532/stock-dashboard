#!/usr/bin/env python3
"""Fetch ETF NAV / premium-discount data published on TWSE ETF product pages."""

from __future__ import annotations

import json
import re
import subprocess
from datetime import UTC, datetime
from pathlib import Path


ETF_IDS = (
    "0050",
    "00910",
    "00935",
    "00981A",
    "006208",
    "009816",
    "00733",
)
TWSE_URL = "https://www.twse.com.tw/zh/ETFortune-institute/etfInfo/{etf_id}"
OUTPUT_PATH = Path(__file__).resolve().parents[1] / "public" / "data" / "etf-nav.json"


def fetch_chart_data(etf_id: str) -> dict:
    result = subprocess.run(
        [
            "curl",
            "--fail",
            "--location",
            "--silent",
            "--show-error",
            "--max-time",
            "60",
            "--user-agent",
            "Mozilla/5.0 (compatible; stock-dashboard-etf-data/1.0)",
            TWSE_URL.format(etf_id=etf_id),
        ],
        check=True,
        capture_output=True,
        text=True,
    )

    page = result.stdout

    match = re.search(r"let\s+chartData\s*=\s*(\{.*?\});", page, re.DOTALL)

    if not match:
        raise RuntimeError(f"TWSE page did not contain chart data for {etf_id}")

    return json.loads(match.group(1))


def build_etf_payload(etf_id: str, chart_data: dict) -> dict:
    prices = chart_data.get("close1", [])
    navs = chart_data.get("netPrice", [])
    premiums = chart_data.get("atmps", [])

    if not prices or not navs or not premiums:
        raise RuntimeError(f"TWSE returned incomplete NAV data for {etf_id}")

    nav_by_date = {item["date"]: item["count"] for item in navs}
    premium_by_date = {item["date"]: item["count"] for item in premiums}

    history = [
        {
            "date": item["date"],
            "marketPrice": item["count"],
            "nav": nav_by_date.get(item["date"]),
            "premiumDiscountPercent": premium_by_date.get(item["date"]),
        }
        for item in prices
        if item["date"] in nav_by_date and item["date"] in premium_by_date
    ]

    if not history:
        raise RuntimeError(f"TWSE returned no aligned history for {etf_id}")

    # TWSE 日期只有月／日，補上年份。
    labels = [item["date"] for item in history]
    current_year = datetime.now(UTC).year

    for index in range(len(history) - 1, -1, -1):
        month, day = map(int, labels[index].split("/"))

        if index < len(history) - 1:
            next_month = int(labels[index + 1].split("/")[0])

            if month > next_month:
                current_year -= 1

        history[index]["date"] = f"{current_year:04d}-{month:02d}-{day:02d}"

    return {
        "history": history,
        "latest": history[-1],
        "monthlyAum": chart_data.get("totalMonthAv", []),
    }


def merge_history(existing: list[dict], incoming: list[dict]) -> list[dict]:
    existing = [
        item
        for item in existing
        if re.fullmatch(r"\d{4}-\d{2}-\d{2}", item.get("date", ""))
    ]

    merged = {item["date"]: item for item in existing}
    merged.update({item["date"]: item for item in incoming})

    return [merged[date] for date in sorted(merged)]


def main() -> None:
    previous = {}

    if OUTPUT_PATH.exists():
        previous = json.loads(OUTPUT_PATH.read_text(encoding="utf-8"))

    payload = {
        "generatedAt": datetime.now(UTC).isoformat(),
        "source": "TWSE ETF e添富",
        "etfs": {},
    }

    for etf_id in ETF_IDS:
        etf_data = build_etf_payload(
            etf_id,
            fetch_chart_data(etf_id),
        )

        previous_history = (
            previous.get("etfs", {})
            .get(etf_id, {})
            .get("history", [])
        )

        etf_data["history"] = merge_history(
            previous_history,
            etf_data["history"],
        )

        etf_data["latest"] = etf_data["history"][-1]
        payload["etfs"][etf_id] = etf_data

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    OUTPUT_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()