# 🏗️ Setup Guide — Building the Life OS Page Structure

This guide walks you through creating the full **Life OS** hierarchy in Notion.
Work top‑down: create the home page, then the sections, then the databases
(defined in [`02-databases.md`](02-databases.md)), then wire them together.

---

## 1. The home page

Create a new page in your Notion sidebar:

- **Title:** `Life OS`
- **Icon:** 🧭 (or anything you like)
- **Cover:** optional, pick something calming

Paste this at the top of the page as your dashboard skeleton:

```
# 🧭 Life OS

> "Small habits, big life."

## 📅 Today
/linked view of Daily Journal → filter Date is Today

## 🎯 Focus
/linked view of Goals → filter Status is In progress

## 🔗 Sections
👨‍💻 Career & Learning   💰 Investments & Net Worth   🏋️ Health
👨‍👩‍👦 Family            🎯 Goals                    📅 Daily Journal
📊 Reviews
```

> In Notion, type `/linked` to insert a **Linked view of database** — this lets
> the home page surface today's journal entry and active goals without
> duplicating data.

---

## 2. The page hierarchy

Create these as **sub-pages** of `Life OS` (type `/page` or drag pages under it):

```
🧭 Life OS
├── 📅 Daily Journal            (database — see 02-databases.md)
├── 🎯 Goals                    (database)
├── ✅ Habits                   (database)
├── 📊 Reviews
│   ├── 🗓️ Weekly Reviews       (database)
│   └── 📈 Monthly Reviews      (database)
├── 👨‍💻 Career & Learning
│   ├── 🧠 Skills               (database)
│   ├── 📚 Reading & Courses    (database)
│   ├── 🚀 Projects             (database)
│   └── 🏆 Brag Doc             (database)
├── 💰 Investments & Net Worth
│   ├── 🏦 Accounts             (database)
│   ├── 📊 Holdings             (database)
│   └── 💵 Net Worth Snapshots  (database)
├── 🏋️ Health
│   ├── 🏃 Workouts             (database)
│   └── 📏 Metrics              (database — weight, sleep, etc.)
└── 👨‍👩‍👦 Family
    ├── 👥 People               (database)
    └── 🎉 Important Dates      (database)
```

You don't have to build all of it on day one. The **minimum viable Life OS** is:

1. **📅 Daily Journal**
2. **🎯 Goals**
3. **✅ Habits**

Add the rest as you need them.

---

## 3. Build order (recommended)

1. **Habits** database → so daily entries can check them off.
2. **Goals** database → so daily entries can link to what you're working toward.
3. **Daily Journal** database → the heart of the system; relate it to Habits and Goals.
4. **Weekly / Monthly Reviews** → relate them back to Daily Journal.
5. **Career, Investments, Health, Family** → add each section when you're ready.

---

## 4. Wiring sections together (relations)

Notion **Relations** connect databases so you can navigate and roll up data:

| From | Relation → To | Why |
|------|---------------|-----|
| Daily Journal | → Habits | Check which habits you did today |
| Daily Journal | → Goals | Log progress toward a goal |
| Daily Journal | → Mood/Energy | Track how you felt |
| Goals | → Career / Health / Investments items | Tie a goal to its domain |
| Weekly Review | → Daily Journal | Pull the week's entries |
| Monthly Review | → Weekly Reviews + Net Worth Snapshots | Summarize the month |
| Holdings | → Accounts | Group holdings under an account |
| Net Worth Snapshots | → Accounts (roll-up) | Auto-sum total net worth |

> To add a relation: in the target database add a property → type **Relation** →
> pick the other database. Enable **"Show on <other DB>"** to make it two-way.

---

## 5. Dashboard views to add on the home page

On `Life OS`, add these **linked views** for a true "command center":

- **Today** — Daily Journal filtered `Date = Today`, layout: Board or Page.
- **This week's habits** — Habits with a rollup of completion.
- **Active goals** — Goals filtered `Status = In progress`, sorted by Due date.
- **Net worth trend** — Net Worth Snapshots, layout: Table, sorted by Month desc.
- **Upcoming family dates** — Important Dates filtered `Date` within next 30 days.

---

## 6. Make templates (critical for consistency)

For each database that gets repeated entries (Daily Journal, Weekly/Monthly
Reviews, Goals, Investment snapshots):

1. Open the database.
2. Click the **▾** next to the blue **New** button → **+ New template**.
3. Name it (e.g. `Daily Entry`).
4. Paste the matching file from [`templates/`](templates/) into the template body.
5. Optionally set it as the **default** template so every new row starts from it.

See the [`templates/`](templates/) folder for the exact content to paste.

---

## 7. Daily / weekly / monthly rhythm

| When | Do this |
|------|---------|
| **Every morning** | Create today's Daily Journal entry from the template; set intentions + top 3. |
| **Every evening** | Fill in what happened, check habits, quick gratitude. |
| **Every Sunday** | Weekly Review: wins, misses, next week's focus. |
| **End of month** | Monthly Review: net-worth snapshot, goal progress, reflection. |

Consistency beats completeness — a 2-minute daily entry sustained for a year is
worth more than an elaborate system you abandon in a week.
