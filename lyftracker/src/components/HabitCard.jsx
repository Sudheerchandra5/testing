export default function HabitCard({
  habit,
  week,
  todayKey,
  toKey,
  weekdayLabel,
  streak,
  onToggleDay,
  onRemove,
}) {
  return (
    <li className="habit" style={{ '--accent': habit.accent }}>
      <div className="habit__top">
        <div className="habit__identity">
          <span className="habit__emoji">{habit.emoji}</span>
          <span className="habit__name">{habit.name}</span>
        </div>
        <div className="habit__meta">
          <span className="habit__streak" title="Current streak">
            🔥 {streak}
          </span>
          <button
            className="habit__remove"
            type="button"
            aria-label={`Remove ${habit.name}`}
            onClick={() => onRemove(habit.id)}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="week">
        {week.map((day) => {
          const key = toKey(day)
          const done = Boolean(habit.log[key])
          const isToday = key === todayKey
          return (
            <button
              key={key}
              type="button"
              className={
                'day' +
                (done ? ' day--done' : '') +
                (isToday ? ' day--today' : '')
              }
              onClick={() => onToggleDay(habit.id, key)}
              aria-pressed={done}
              title={key}
            >
              <span className="day__label">{weekdayLabel(day)}</span>
              <span className="day__dot">{done ? '✓' : ''}</span>
            </button>
          )
        })}
      </div>
    </li>
  )
}
