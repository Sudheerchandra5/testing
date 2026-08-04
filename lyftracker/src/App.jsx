import { useEffect, useMemo, useState } from 'react'
import { loadHabits, saveHabits } from './lib/storage.js'
import {
  todayKey,
  lastNDays,
  toKey,
  weekdayLabel,
  currentStreak,
  bestStreak,
} from './lib/date.js'
import HabitCard from './components/HabitCard.jsx'
import AddHabitForm from './components/AddHabitForm.jsx'
import StatBar from './components/StatBar.jsx'

const ACCENTS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6']

const SAMPLE = [
  { name: 'Drink water', emoji: '💧' },
  { name: 'Read 20 min', emoji: '📚' },
  { name: 'Workout', emoji: '🏋️' },
]

function createHabit(name, emoji) {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    emoji: emoji || '⭐',
    accent: ACCENTS[Math.floor(Math.random() * ACCENTS.length)],
    createdAt: todayKey(),
    // Map of "YYYY-MM-DD" -> true for completed days.
    log: {},
  }
}

export default function App() {
  const [habits, setHabits] = useState(() => loadHabits())

  useEffect(() => {
    saveHabits(habits)
  }, [habits])

  const week = useMemo(() => lastNDays(7), [])
  const today = todayKey()

  function addHabit(name, emoji) {
    if (!name.trim()) return
    setHabits((prev) => [...prev, createHabit(name, emoji)])
  }

  function addSamples() {
    setHabits((prev) => [
      ...prev,
      ...SAMPLE.map((s) => createHabit(s.name, s.emoji)),
    ])
  }

  function toggleDay(habitId, dayKey) {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h
        const log = { ...h.log }
        if (log[dayKey]) {
          delete log[dayKey]
        } else {
          log[dayKey] = true
        }
        return { ...h, log }
      }),
    )
  }

  function removeHabit(habitId) {
    setHabits((prev) => prev.filter((h) => h.id !== habitId))
  }

  const stats = useMemo(() => {
    const completedToday = habits.filter((h) => h.log[today]).length
    const total = habits.length
    let bestOverall = 0
    for (const h of habits) {
      const set = new Set(Object.keys(h.log))
      bestOverall = Math.max(bestOverall, bestStreak(set))
    }
    return { completedToday, total, bestOverall }
  }, [habits, today])

  return (
    <div className="app">
      <header className="app__header">
        <div className="brand">
          <span className="brand__mark">✓</span>
          <div>
            <h1 className="brand__title">LyfTracker</h1>
            <p className="brand__tagline">Small habits, big life.</p>
          </div>
        </div>
      </header>

      <StatBar
        completedToday={stats.completedToday}
        total={stats.total}
        bestStreak={stats.bestOverall}
      />

      <AddHabitForm onAdd={addHabit} />

      {habits.length === 0 ? (
        <div className="empty">
          <p className="empty__emoji">🌱</p>
          <p className="empty__title">No habits yet</p>
          <p className="empty__text">
            Add your first habit above and start building momentum today.
          </p>
          <button className="empty__btn" type="button" onClick={addSamples}>
            Add sample habits
          </button>
        </div>
      ) : (
        <ul className="habits">
          {habits.map((habit) => {
            const set = new Set(Object.keys(habit.log))
            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                week={week}
                todayKey={today}
                toKey={toKey}
                weekdayLabel={weekdayLabel}
                streak={currentStreak(set)}
                onToggleDay={toggleDay}
                onRemove={removeHabit}
              />
            )
          })}
        </ul>
      )}

      <footer className="app__footer">
        Data is stored locally in your browser. LyfTracker · built with React
      </footer>
    </div>
  )
}
