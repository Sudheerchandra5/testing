from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

import yfinance as yf


@dataclass(frozen=True)
class EtfSnapshot:
    symbol: str
    name: str
    price: float | None
    previous_close: float | None
    change_pct: float | None
    volume: int | None
    expense_ratio: float | None
    category: str | None


def _safe_float(value: object) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def fetch_etf_snapshots(symbols: Iterable[str]) -> list[EtfSnapshot]:
    unique = []
    seen: set[str] = set()
    for raw in symbols:
        sym = raw.strip().upper()
        if not sym or sym in seen:
            continue
        seen.add(sym)
        unique.append(sym)

    if not unique:
        return []

    tickers = yf.Tickers(" ".join(unique))
    rows: list[EtfSnapshot] = []

    for sym in unique:
        ticker = tickers.tickers.get(sym)
        if ticker is None:
            rows.append(
                EtfSnapshot(sym, sym, None, None, None, None, None, None)
            )
            continue

        fast = ticker.fast_info
        info = ticker.info or {}

        price = _safe_float(getattr(fast, "last_price", None) or fast.get("lastPrice"))
        prev = _safe_float(
            getattr(fast, "previous_close", None) or fast.get("previousClose")
        )
        change_pct = None
        if price is not None and prev and prev != 0:
            change_pct = (price - prev) / prev * 100

        volume_raw = getattr(fast, "last_volume", None) or fast.get("lastVolume")
        volume = int(volume_raw) if volume_raw is not None else None

        name = str(info.get("shortName") or info.get("longName") or sym)
        expense = _safe_float(info.get("annualReportExpenseRatio"))
        if expense is not None and expense <= 1:
            expense = expense * 100
        category = info.get("category")
        if category is not None:
            category = str(category)

        rows.append(
            EtfSnapshot(
                symbol=sym,
                name=name,
                price=price,
                previous_close=prev,
                change_pct=change_pct,
                volume=volume,
                expense_ratio=expense,
                category=category,
            )
        )

    return rows
