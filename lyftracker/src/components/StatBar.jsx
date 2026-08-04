export default function StatBar({ completedToday, total, bestStreak }) {
  const pct = total === 0 ? 0 : Math.round((completedToday / total) * 100)
  return (
    <section className="statbar">
      <div className="stat">
        <span className="stat__value">
          {completedToday}
          <span className="stat__muted">/{total}</span>
        </span>
        <span className="stat__label">Done today</span>
      </div>
      <div className="stat">
        <span className="stat__value">{pct}%</span>
        <span className="stat__label">Completion</span>
      </div>
      <div className="stat">
        <span className="stat__value">🔥 {bestStreak}</span>
        <span className="stat__label">Best streak</span>
      </div>
    </section>
  )
}
