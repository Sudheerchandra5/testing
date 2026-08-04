import { useState } from 'react'

const EMOJIS = ['⭐', '💧', '🏃', '📚', '🧘', '💤', '🥗', '💪', '🎯', '🧹']

export default function AddHabitForm({ onAdd }) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(EMOJIS[0])

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name, emoji)
    setName('')
    setEmoji(EMOJIS[0])
  }

  return (
    <form className="addform" onSubmit={handleSubmit}>
      <div className="addform__emoji">
        <select
          aria-label="Habit icon"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
        >
          {EMOJIS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>
      <input
        className="addform__input"
        type="text"
        placeholder="Add a habit, e.g. Drink water"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={60}
      />
      <button className="addform__btn" type="submit">
        Add
      </button>
    </form>
  )
}
