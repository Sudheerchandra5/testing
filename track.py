#!/usr/bin/env python3
"""Track ETF quotes and optional portfolio value from a watchlist file."""

from __future__ import annotations

import argparse
from pathlib import Path

from rich.console import Console
from rich.table import Table

from etf_tracker.quotes import EtfSnapshot, fetch_etf_snapshots
from etf_tracker.watchlist import load_watchlist


def _fmt_money(value: float | None) -> str:
    if value is None:
        return "—"
    return f"${value:,.2f}"


def _fmt_pct(value: float | None) -> str:
    if value is None:
        return "—"
    sign = "+" if value >= 0 else ""
    return f"{sign}{value:.2f}%"


def _fmt_shares(value: float) -> str:
    if value == int(value):
        return str(int(value))
    return f"{value:.4f}".rstrip("0").rstrip(".")


def print_quotes(console: Console, rows: list[EtfSnapshot]) -> None:
    table = Table(title="ETF watchlist", show_lines=False)
    table.add_column("Symbol", style="bold")
    table.add_column("Name", max_width=36, overflow="ellipsis")
    table.add_column("Price", justify="right")
    table.add_column("Day", justify="right")
    table.add_column("Expense", justify="right")
    table.add_column("Category", max_width=24, overflow="ellipsis")

    for row in rows:
        day_style = "green" if (row.change_pct or 0) >= 0 else "red"
        expense = "—" if row.expense_ratio is None else f"{row.expense_ratio:.2f}%"
        table.add_row(
            row.symbol,
            row.name,
            _fmt_money(row.price),
            f"[{day_style}]{_fmt_pct(row.change_pct)}[/{day_style}]",
            expense,
            row.category or "—",
        )
    console.print(table)


def print_portfolio(
    console: Console, rows: list[EtfSnapshot], holdings: dict[str, float]
) -> None:
    if not holdings:
        return

    by_symbol = {r.symbol: r for r in rows}
    table = Table(title="Portfolio (mark-to-market)", show_lines=False)
    table.add_column("Symbol", style="bold")
    table.add_column("Shares", justify="right")
    table.add_column("Price", justify="right")
    table.add_column("Value", justify="right")
    table.add_column("Day P/L", justify="right")

    total = 0.0
    day_pl = 0.0
    for sym in sorted(holdings.keys()):
        qty = holdings[sym]
        snap = by_symbol.get(sym)
        price = snap.price if snap else None
        value = price * qty if price is not None else None
        if value is not None:
            total += value
        row_day = None
        if snap and snap.change_pct is not None and price is not None and snap.previous_close:
            row_day = (price - snap.previous_close) * qty
            day_pl += row_day
        day_style = "green" if (row_day or 0) >= 0 else "red"
        table.add_row(
            sym,
            _fmt_shares(qty),
            _fmt_money(price),
            _fmt_money(value),
            f"[{day_style}]{_fmt_money(row_day)}[/{day_style}]",
        )

    day_style = "green" if day_pl >= 0 else "red"
    table.add_section()
    table.add_row(
        "Total",
        "",
        "",
        _fmt_money(total),
        f"[{day_style}]{_fmt_money(day_pl)}[/{day_style}]",
        style="bold",
    )
    console.print(table)


def main() -> None:
    parser = argparse.ArgumentParser(description="Track ETFs from a JSON watchlist")
    parser.add_argument(
        "-c",
        "--config",
        type=Path,
        default=Path("watchlist.json"),
        help="Path to watchlist JSON (default: watchlist.json)",
    )
    parser.add_argument(
        "--symbols",
        nargs="+",
        help="Override watchlist with one or more ticker symbols",
    )
    parser.add_argument(
        "--no-portfolio",
        action="store_true",
        help="Skip portfolio table even if holdings are defined",
    )
    args = parser.parse_args()

    console = Console()

    if args.symbols:
        symbols = [s.upper() for s in args.symbols]
        holdings: dict[str, float] = {}
    else:
        if not args.config.is_file():
            console.print(f"[red]Watchlist not found:[/red] {args.config}")
            raise SystemExit(1)
        wl = load_watchlist(args.config)
        symbols = wl.etfs
        holdings = wl.holdings

    rows = fetch_etf_snapshots(symbols)
    print_quotes(console, rows)
    if not args.no_portfolio and holdings:
        print_portfolio(console, rows, holdings)


if __name__ == "__main__":
    main()
