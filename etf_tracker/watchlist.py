from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Watchlist:
    etfs: list[str]
    holdings: dict[str, float]


def load_watchlist(path: Path) -> Watchlist:
    data = json.loads(path.read_text(encoding="utf-8"))
    etfs = [str(s).strip().upper() for s in data.get("etfs", []) if str(s).strip()]
    holdings_raw = data.get("holdings") or {}
    holdings: dict[str, float] = {}
    for sym, qty in holdings_raw.items():
        key = str(sym).strip().upper()
        if not key:
            continue
        holdings[key] = float(qty)
    symbols = list(dict.fromkeys(etfs + list(holdings.keys())))
    return Watchlist(etfs=symbols, holdings=holdings)
