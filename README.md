# testing

**ETF tracker** — live quotes and a simple portfolio view for a JSON watchlist (via [Yahoo Finance](https://finance.yahoo.com/) through `yfinance`).

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Track ETFs

Edit `watchlist.json` with tickers and optional share counts, then:

```bash
python3 track.py
```

One-off symbols (no config file):

```bash
python3 track.py --symbols SPY QQQ VTI
```

Options:

- `-c path/to/watchlist.json` — custom config
- `--no-portfolio` — quotes only, ignore `holdings`

### Watchlist format

```json
{
  "etfs": ["SPY", "QQQ", "VTI"],
  "holdings": {
    "SPY": 10,
    "VTI": 25.5
  }
}
```

`holdings` is optional; when present, the tracker prints per-line market value and estimated day P/L.

---

## Legacy: MNIST classifier (optional)

The repo also includes a small PyTorch MNIST demo under `models/` and `train.py`. It is unrelated to the ETF tracker; install `torch` separately if you use it.
