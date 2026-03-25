import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'
import './SetGoal.css'

const bambiSuggest = '/assets/bambi-suggest.png'

export default function SetGoal() {
  const [goal, setGoal] = useState('')
  const navigate = useNavigate()
  const setGoalMutation = useMutation(api.userPreferences.setGoal)

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
        <img className="goal-suggest-illustration" alt="" src={bambiSuggest} />
      </div>

      <button
        className={`goal-select-button${hasGoal ? ' active' : ''}`}
        disabled={!hasGoal}
        onClick={() => {
          const num = Number(goal.trim())
          if (num >= 1) setGoalMutation({ dailyGoal: num })
          navigate('/rules')
        }}
      >
        Select
      </button>
    </div>
  )
}
