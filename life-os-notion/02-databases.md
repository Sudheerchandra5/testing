# 🗄️ Database Schemas

Copy these into Notion. For each database, create it (`/database - full page` or
inline), then add the **properties** listed. Formula and rollup snippets are
provided where useful — paste them into a **Formula** / **Rollup** property.

> Notion property types used below: `Title`, `Text`, `Number`, `Select`,
> `Multi-select`, `Date`, `Checkbox`, `Relation`, `Rollup`, `Formula`, `Files`,
> `URL`, `Person`.

---

## 📅 Daily Journal

The core database — one row per day.

| Property | Type | Notes |
|----------|------|-------|
| Name | Title | e.g. `2026-08-04 · Tuesday` |
| Date | Date | The day this entry covers |
| Mood | Select | 😄 Great / 🙂 Good / 😐 Okay / 😕 Low / 😫 Rough |
| Energy | Select | 🔋 High / ⚡ Medium / 🪫 Low |
| Top 3 | Text | The 3 things that matter most today |
| Habits | Relation → Habits | Which habits you're tracking today |
| Goals | Relation → Goals | Goals you moved forward |
| Gratitude | Text | 1–3 things you're grateful for |
| Highlight | Text | Best moment of the day |
| Water (glasses) | Number | Optional quick health metric |
| Sleep (hrs) | Number | Optional |

**Suggested formula — nice title from the date** (Formula property `Name` or a
helper property):

```
formatDate(prop("Date"), "YYYY-MM-DD · dddd")
```

**Views:** `Today` (filter Date is Today), `This Week` (Date within one week),
`Calendar` (calendar layout on Date), `All entries` (table, sort Date desc).

---

## ✅ Habits

One row per habit. Completion is tracked by relating Daily Journal entries.

| Property | Type | Notes |
|----------|------|-------|
| Name | Title | e.g. `Drink water`, `Read 20 min`, `Workout` |
| Icon | Text/Emoji | 💧 📚 🏋️ etc. |
| Category | Select | Health / Career / Mind / Family |
| Active | Checkbox | Uncheck to archive without deleting |
| Journal Entries | Relation → Daily Journal | Auto-populated when you tag it in a day |
| Times done | Rollup | Rollup of `Journal Entries` → **Count** |
| Target / week | Number | e.g. 5 |

**Streak note:** Notion has no native streak counter. Practical approaches:
- Track completion via the `Journal Entries` relation + a weekly **Count** rollup.
- Or add a checkbox per day in a simple table if you prefer a visual grid.

---

## 🎯 Goals

Yearly → quarterly → monthly goals with progress.

| Property | Type | Notes |
|----------|------|-------|
| Name | Title | The goal |
| Status | Select | 🔵 Not started / 🟡 In progress / 🟢 Done / ⚪ Paused |
| Horizon | Select | Year / Quarter / Month |
| Domain | Select | Career / Investments / Health / Family / Personal |
| Start | Date | |
| Due | Date | |
| Progress | Number | 0–100 (percent) |
| Progress bar | Formula | Visual bar, see below |
| Parent goal | Relation → Goals (self) | Link monthly goals to their quarterly parent |
| Daily Entries | Relation → Daily Journal | Days you worked on it |
| Notes | Text | |

**Progress bar formula:**

```
slice("██████████", 0, floor(prop("Progress") / 10)) +
slice("──────────", 0, 10 - floor(prop("Progress") / 10)) +
" " + format(prop("Progress")) + "%"
```

**Views:** `Active` (Status = In progress), `By domain` (board grouped by Domain),
`This quarter` (Horizon = Quarter).

---

## 🗓️ Weekly Reviews

| Property | Type | Notes |
|----------|------|-------|
| Name | Title | e.g. `Week of 2026-08-03` |
| Week of | Date | Monday of the week |
| Wins | Text | |
| Misses / lessons | Text | |
| Habit completion | Rollup | From related Daily Journal entries |
| Next week focus | Text | |
| Daily Entries | Relation → Daily Journal | The week's entries |

---

## 📈 Monthly Reviews

| Property | Type | Notes |
|----------|------|-------|
| Name | Title | e.g. `2026-08 · August` |
| Month | Date | First of the month |
| Reflection | Text | What went well / what to change |
| Goal progress | Text | Summary of goal movement |
| Net worth | Relation → Net Worth Snapshots | This month's snapshot |
| Weekly Reviews | Relation → Weekly Reviews | The month's weeks |
| Rating | Select | ⭐️1–5 |

---

## 👨‍💻 Career & Learning

### 🧠 Skills

| Property | Type | Notes |
|----------|------|-------|
| Name | Title | e.g. `System design`, `Rust`, `Leadership` |
| Level | Select | Novice / Working / Proficient / Expert |
| Target level | Select | Where you want to be |
| Related Goals | Relation → Goals | |
| Resources | Relation → Reading & Courses | |

### 📚 Reading & Courses

| Property | Type | Notes |
|----------|------|-------|
| Title | Title | Book / course / article |
| Type | Select | Book / Course / Article / Talk |
| Status | Select | To do / In progress / Done |
| Rating | Select | ⭐️1–5 |
| Link | URL | |
| Notes | Text | Key takeaways |

### 🚀 Projects

| Property | Type | Notes |
|----------|------|-------|
| Name | Title | |
| Status | Select | Idea / Building / Shipped / Archived |
| Stack | Multi-select | React, Go, Postgres, … |
| Repo | URL | |
| Related Goals | Relation → Goals | |

### 🏆 Brag Doc

Track accomplishments for reviews/promotions.

| Property | Type | Notes |
|----------|------|-------|
| Achievement | Title | What you did |
| Date | Date | |
| Impact | Text | Quantify it (%, $, users, time saved) |
| Category | Select | Shipped / Leadership / Learning / Impact |

---

## 💰 Investments & Net Worth

### 🏦 Accounts

| Property | Type | Notes |
|----------|------|-------|
| Name | Title | e.g. `401k`, `Brokerage`, `Savings`, `Crypto` |
| Type | Select | Retirement / Brokerage / Cash / Crypto / Real estate / Debt |
| Institution | Text | |
| Current value | Number (format: currency) | Update manually or per snapshot |
| Holdings | Relation → Holdings | |

### 📊 Holdings

| Property | Type | Notes |
|----------|------|-------|
| Ticker / Name | Title | e.g. `VTI`, `BTC` |
| Account | Relation → Accounts | |
| Quantity | Number | |
| Cost basis | Number (currency) | |
| Current price | Number (currency) | Manual update |
| Market value | Formula | `prop("Quantity") * prop("Current price")` |
| Gain/Loss | Formula | `prop("Market value") - prop("Cost basis")` |

### 💵 Net Worth Snapshots

One row per month — the backbone of net-worth tracking.

| Property | Type | Notes |
|----------|------|-------|
| Name | Title | e.g. `2026-08` |
| Month | Date | First of the month |
| Assets | Number (currency) | |
| Liabilities | Number (currency) | |
| Net worth | Formula | `prop("Assets") - prop("Liabilities")` |
| MoM change | Number (currency) | Optional: this month − last month |
| Notes | Text | |

**View:** Table sorted by Month desc; add a **line chart** (Notion charts) on
`Net worth` over `Month` for a trend line.

---

## 🏋️ Health

### 🏃 Workouts

| Property | Type | Notes |
|----------|------|-------|
| Name | Title | e.g. `Push day`, `5k run` |
| Date | Date | |
| Type | Select | Strength / Cardio / Mobility / Sport |
| Duration (min) | Number | |
| Notes | Text | RPE, PRs, how it felt |

### 📏 Metrics

| Property | Type | Notes |
|----------|------|-------|
| Date | Date (or Title) | |
| Weight | Number | |
| Sleep (hrs) | Number | |
| Resting HR | Number | |
| Steps | Number | |

---

## 👨‍👩‍👦 Family

### 👥 People

| Property | Type | Notes |
|----------|------|-------|
| Name | Title | |
| Relationship | Select | Partner / Child / Parent / Sibling / Friend |
| Birthday | Date | |
| Notes | Text | Preferences, gift ideas |
| Dates | Relation → Important Dates | |

### 🎉 Important Dates

| Property | Type | Notes |
|----------|------|-------|
| Event | Title | e.g. `Anniversary`, `Mom's birthday` |
| Date | Date | Enable **reminder** on the date |
| Person | Relation → People | |
| Type | Select | Birthday / Anniversary / Appointment / Trip |
| Plan | Text | Gift / reservation ideas |

---

## Formula cheat sheet

```txt
# Percent progress bar (10 blocks)
slice("██████████", 0, floor(prop("Progress")/10)) + slice("──────────", 0, 10 - floor(prop("Progress")/10))

# Days until a date
dateBetween(prop("Due"), now(), "days")

# Overdue flag
if(prop("Due") < now() and prop("Status") != "Done", "⚠️ Overdue", "")

# Net worth
prop("Assets") - prop("Liabilities")

# Market value of a holding
prop("Quantity") * prop("Current price")

# Pretty date title
formatDate(prop("Date"), "YYYY-MM-DD · dddd")
```

> Note: Notion updated its formula syntax ("Formulas 2.0"). The snippets above
> use widely-supported functions; if your workspace shows a different editor,
> the same logic applies — Notion will suggest the current function names.
