import { useNavigate } from 'react-router-dom'
import './App.css'

const bambiBottom = '/assets/bambi-bottom.png'
const bambiTop = '/assets/bambi-top.png'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="landing-page">
      <div className="illustration-top">
        <div className="illustration-top-inner">
          <img alt="" src={bambiTop} />
        </div>
      </div>

      <h1 className="title">Bambi</h1>

      <button className="open-button" onClick={() => navigate('/select-language')}>
        Open
      </button>

      <div className="illustration-bottom">
        <img alt="" src={bambiBottom} />
      </div>
    </div>
  )
}
