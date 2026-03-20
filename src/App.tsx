import { useState } from 'react'
import './App.css'
import SelectLanguage from './SelectLanguage'
import SetGoal from './SetGoal'
import Rules from './Rules'
import LetsGo from './LetsGo'

const illustration = '/assets/bambi-illustration.png'

type Screen = 'landing' | 'select-language' | 'set-goal' | 'rules' | 'lets-go'

function App() {
  const [screen, setScreen] = useState<Screen>('landing')

  if (screen === 'lets-go') {
    return <LetsGo />
  }

  if (screen === 'rules') {
    return <Rules onNext={() => setScreen('lets-go')} />
  }

  if (screen === 'set-goal') {
    return <SetGoal onNext={() => setScreen('rules')} />
  }

  if (screen === 'select-language') {
    return <SelectLanguage onNext={() => setScreen('set-goal')} />
  }

  return (
    <div className="landing-page">
      <div className="illustration-bottom">
        <img alt="" src={illustration} />
      </div>

      <div className="illustration-top">
        <div className="illustration-top-inner">
          <img alt="" src={illustration} />
        </div>
      </div>

      <h1 className="title">Bambi</h1>

      <button className="open-button" onClick={() => setScreen('select-language')}>
        Open
      </button>
    </div>
  )
}

export default App
