import { Routes, Route } from 'react-router-dom'
import './App.css'
import Landing from './Landing'
import SelectLanguage from './SelectLanguage'
import SetGoal from './SetGoal'
import Rules from './Rules'
import LetsGo from './LetsGo'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/select-language" element={<SelectLanguage />} />
      <Route path="/set-goal" element={<SetGoal />} />
      <Route path="/rules" element={<Rules />} />
      <Route path="/lets-go" element={<LetsGo />} />
    </Routes>
  )
}

export default App
