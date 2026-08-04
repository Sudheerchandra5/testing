# 🧭 Life OS for Notion

A complete, opinionated blueprint for building an all‑in‑one **"Life OS"** in
Notion — tailored for a **software engineer** who also tracks **investments**,
**health**, **family**, and **personal goals**.

Notion can't be provisioned via a script from here, so this repo gives you
everything you need to recreate the system by hand (copy/paste in minutes):
page structure, database schemas, formulas, views, and ready‑to‑use templates.

## What you get

```
life-os-notion/
├── README.md                      ← you are here (overview + quick start)
├── 01-setup-guide.md              ← full page hierarchy + how to build it
├── 02-databases.md                ← every database: properties, formulas, views
└── templates/
    ├── daily-journal.md           ← daily entry template
    ├── weekly-review.md           ← weekly review template
    ├── monthly-review.md          ← monthly review template
    ├── goal.md                    ← goal page template
    └── investment-log.md          ← investment / net-worth entry template
```

## The sections

| Icon | Section | Purpose |
|------|---------|---------|
| 👨‍💻 | **Career & Learning** | Skills, courses, reading, projects, brag doc |
| 💰 | **Investments & Net Worth** | Accounts, holdings, monthly net-worth snapshots |
| 🏋️ | **Health** | Workouts, sleep, weight, habits |
| 👨‍👩‍👦 | **Family** | People, important dates, plans |
| 🎯 | **Goals** | Yearly → quarterly → monthly goals with progress |
| 📅 | **Daily Journal** | Consistent daily entries via a template |
| 📊 | **Reviews** | Weekly and monthly reflection |

## Quick start (15 minutes)

1. Create one top-level page in Notion called **`Life OS`**.
2. Follow **[`01-setup-guide.md`](01-setup-guide.md)** to add the sub-pages.
3. Create the databases from **[`02-databases.md`](02-databases.md)** (copy the
   property tables — Notion lets you add properties one by one quickly).
4. Turn the entries in **[`templates/`](templates/)** into Notion **templates**
   (open a database → the ▾ next to the blue **New** button → **+ New template**),
   then paste the template body.
5. Start with today's **Daily Journal** entry. Build the habit first; expand later.

## Design principles

- **One home page.** Everything hangs off `Life OS` so it's one click from the sidebar.
- **Databases over loose pages.** Anything you'll review over time is a database row.
- **Templates for consistency.** Daily/weekly/monthly entries always look the same.
- **Roll-ups, not manual math.** Let formulas compute net worth, streaks, and progress.
- **Review cadence.** Daily capture → weekly tidy → monthly reflect.

> Tip: build it lean. Start with **Daily Journal + Goals + Habits**, and add
> Investments/Health/Family once the daily habit sticks.
