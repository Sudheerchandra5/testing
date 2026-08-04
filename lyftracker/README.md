# ✅ LyfTracker

A simple, beautiful **habit & life tracker** — add habits, check them off each
day, and watch your streaks grow. Built with **React + Vite**. All data is
stored locally in your browser (no account, no backend).

## ✨ Features

- Add habits with an emoji icon
- One-tap daily check-off across a rolling 7-day week strip
- 🔥 Current streak per habit + best streak overall
- Today's completion % at a glance
- Persists to `localStorage` automatically
- Responsive, dark, modern UI

## 🚀 Preview instantly (no install)

Open the app live in your browser via StackBlitz (runs the dev server in-browser):

**https://stackblitz.com/github/Sudheerchandra5/testing/tree/cursor/add-lyftracker-project-3231/lyftracker**

> After it's merged to the default branch, the StackBlitz path becomes
> `.../github/Sudheerchandra5/testing/tree/main/lyftracker`.

## 🧑‍💻 Run locally

```bash
cd lyftracker
npm install
npm run dev
```

Then open the printed `http://localhost:5173` URL.

Build for production:

```bash
npm run build
npm run preview
```

## 🌐 Deploy to GitHub Pages

A workflow at `.github/workflows/deploy-pages.yml` builds and deploys `lyftracker`
to GitHub Pages. To enable: repo **Settings → Pages → Build and deployment →
Source: GitHub Actions**. After it runs, the site is at
`https://sudheerchandra5.github.io/testing/`.

## 🗂️ Project structure

```
lyftracker/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── styles.css
    ├── components/
    │   ├── AddHabitForm.jsx
    │   ├── HabitCard.jsx
    │   └── StatBar.jsx
    └── lib/
        ├── date.js
        └── storage.js
```
