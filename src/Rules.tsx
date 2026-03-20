import { useNavigate } from 'react-router-dom'
import './Rules.css'

const steps = [
  'Pick Language and set word goals',
  'Pick words by taking or uploading a picture. or selecting a song, video.',
  'Bambi translates them, and generates flash cards.',
  'You can study the flash cards, and take test. You have nine lives!',
  "Don't kill Bambi",
]

export default function Rules() {
  const navigate = useNavigate()

  return (
    <div className="rules-page">
      <h1 className="rules-title">How Bambi works:</h1>

      <div className="rules-steps">
        {steps.map((text, i) => (
          <div key={i} className="rules-step">
            <div className="step-number">{i + 1}</div>
            <p className="step-text">{text}</p>
          </div>
        ))}
      </div>

      <button className="ready-button" onClick={() => navigate('/lets-go')}>Ready?</button>
    </div>
  )
}
