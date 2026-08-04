// Thin wrapper around localStorage so the app degrades gracefully when storage
// is unavailable (private mode, SSR, quota errors).

const STORAGE_KEY = 'lyftracker.habits.v1'

export function loadHabits() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveHabits(habits) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits))
  } catch {
    // Ignore write failures; the in-memory state remains the source of truth.
  }
}
