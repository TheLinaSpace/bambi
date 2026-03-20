import { useState } from 'react'
import './SetGoal.css'

const illustration = '/assets/bambi-illustration.png'

export default function SetGoal({ onNext }: { onNext: () => void }) {
  const [goal, setGoal] = useState('')

  const hasGoal = goal.trim().length > 0

  return (
    <div className="set-goal-page">
      <h1 className="goal-title">Set Goal</h1>
      <p className="goal-subtitle">how many words would you like to learn per day?</p>

      <input
        className="goal-input"
        type="text"
        placeholder="ex: 3 words per day"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      />

      <div className="goal-character-area">
        <div className="goal-illustration">
          <div className="goal-illustration-inner">
            <img alt="" src={illustration} />
          </div>
        </div>

        <img className="bubble-dot bubble-dot-1" alt="" src="/assets/bubble-dot-1.svg" />
        <img className="bubble-dot bubble-dot-2" alt="" src="/assets/bubble-dot-2.svg" />
        <img className="bubble-dot bubble-dot-3" alt="" src="/assets/bubble-dot-3.svg" />

        <div className="thought-bubble">
          <img alt="" src="/assets/thought-bubble.svg" />
          <span className="thought-bubble-text">Suggested: start with 7 words per day</span>
        </div>
      </div>

      <button
        className={`goal-select-button${hasGoal ? ' active' : ''}`}
        disabled={!hasGoal}
        onClick={onNext}
      >
        Select
      </button>
    </div>
  )
}
