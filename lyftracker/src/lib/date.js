// Date helpers used across LyfTracker. All dates are handled as local-time
// "YYYY-MM-DD" keys so a habit logged today stays on today regardless of TZ.

export function toKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayKey() {
  return toKey(new Date())
}

export function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

// Returns the last `count` days ending today, oldest first.
export function lastNDays(count) {
  const today = new Date()
  const days = []
  for (let i = count - 1; i >= 0; i--) {
    days.push(addDays(today, -i))
  }
  return days
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function weekdayLabel(date) {
  return WEEKDAY_LABELS[date.getDay()]
}

// Longest run of consecutive completed days ending today (current streak).
export function currentStreak(completedSet) {
  let streak = 0
  let cursor = new Date()
  while (completedSet.has(toKey(cursor))) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

// Best streak ever recorded across all completed days.
export function bestStreak(completedSet) {
  const keys = [...completedSet].sort()
  let best = 0
  let run = 0
  let prev = null
  for (const key of keys) {
    if (prev && toKey(addDays(new Date(prev), 1)) === key) {
      run += 1
    } else {
      run = 1
    }
    best = Math.max(best, run)
    prev = key
  }
  return best
}
