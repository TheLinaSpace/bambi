import { Routes, Route } from 'react-router-dom'
import { Authenticated, Unauthenticated } from 'convex/react'
import './App.css'
import SignIn from './SignIn'
import Landing from './Landing'
import SelectLanguage from './SelectLanguage'
import SetGoal from './SetGoal'
import Rules from './Rules'
import LetsGo from './LetsGo'
import Day from './Day'
import Test from './Test'
import Progress from './Progress'

function App() {
  return (
    <>
      <Unauthenticated>
        <SignIn />
      </Unauthenticated>
      <Authenticated>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/select-language" element={<SelectLanguage />} />
          <Route path="/set-goal" element={<SetGoal />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/lets-go" element={<LetsGo />} />
          <Route path="/day" element={<Day />} />
          <Route path="/test" element={<Test />} />
          <Route path="/progress" element={<Progress />} />
        </Routes>
      </Authenticated>
    </>
  )
}

export default App
