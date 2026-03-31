import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'

import * as Dialog from '@radix-ui/react-dialog'
import './Progress.css'
import { useUserPreferences } from './useUserPreferences'

const languageFlags: Record<string, string> = {
  'Lebanese Arabic': '/assets/flag-lb.png',

  German: '/assets/flag-de.png',
  Japanese: '/assets/flag-jp.png',

  French: '/assets/flag-fr.png',
}

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay()
}

export default function Progress() {
  const navigate = useNavigate()
  const prefs = useUserPreferences()
  const setGoalMutation = useMutation(api.userPreferences.setGoal)
  const selectedLanguage = prefs.selectedLanguage
  const flagSrc = languageFlags[selectedLanguage] || '/assets/flag-gb.png'
  const [showMenu, setShowMenu] = useState(false)
  const [dailyGoal, setDailyGoal] = useState(prefs.dailyGoal)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [goalInput, setGoalInput] = useState('')

  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const yearMonth = `${viewYear}-${String(viewMonth).padStart(2, '0')}`
  const monthData = useQuery(api.dailyWords.getByMonth, { language: selectedLanguage, yearMonth })
  const allWordsData = useQuery(api.dailyWords.getAllWords, { language: selectedLanguage })

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth)
  const monthName = new Date(viewYear, viewMonth - 1).toLocaleString('en', { month: 'long' })

  // Group words by day
  const wordsByDay: Record<number, string[]> = {}
  if (monthData) {
    for (const entry of monthData) {
      const day = Number(entry.date.split('-')[2])
      if (!wordsByDay[day]) wordsByDay[day] = []
      wordsByDay[day].push(entry.word)
    }
  }

  const isToday = viewYear === today.getFullYear() && viewMonth === today.getMonth() + 1

  const selectedWords = selectedDay !== null ? (wordsByDay[selectedDay] || []) : []
  const selectedPercentage = selectedDay !== null && dailyGoal > 0 ? Math.min(Math.round((selectedWords.length / dailyGoal) * 100), 100) : 0
  const selectedDateStr = selectedDay !== null ? new Date(viewYear, viewMonth - 1, selectedDay).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) : ''

  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewYear(viewYear - 1)
      setViewMonth(12)
    } else {
      setViewMonth(viewMonth - 1)
    }
    setSelectedDay(null)
  }

  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewYear(viewYear + 1)
      setViewMonth(1)
    } else {
      setViewMonth(viewMonth + 1)
    }
    setSelectedDay(null)
  }

  // Build calendar grid rows (7 cells per row)
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const rows: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7))
  }

  return (
    <div className="progress-page">
      <div className="progress-topbar">
        <button className="progress-menu-btn" onClick={() => setShowMenu(!showMenu)}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 10H27M5 16H27M5 22H27" stroke="#1E1E1E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {showMenu && (
          <div className="day-menu-overlay" onClick={() => setShowMenu(false)}>
            <div className="day-menu-dropdown" onClick={(e) => e.stopPropagation()}>
              <button className="day-menu-item" onClick={() => { setShowMenu(false); navigate('/day') }}>
                Words Today
              </button>
              <button className="day-menu-item" onClick={() => { setShowMenu(false) }}>
                Progress
              </button>
            </div>
          </div>
        )}
        <img className="progress-flag" alt={selectedLanguage} src={flagSrc} />
        <div className="progress-lives">
          <img alt="" src={`/assets/cat-lives-${prefs.catLives}.png`} />
        </div>
      </div>

      <h1 className="progress-title">Progress</h1>

      <div className="progress-month-selector">
        <button className="progress-arrow" onClick={prevMonth}>‹</button>
        <span className="progress-month-label">{monthName} {viewYear}</span>
        <button className="progress-arrow" onClick={nextMonth}>›</button>
      </div>

      <div className="progress-calendar">
        <div className="progress-day-headers">
          {dayLabels.map((d, i) => (
            <span key={i} className="progress-day-header">{d}</span>
          ))}
        </div>
        {rows.map((row, ri) => (
          <div key={ri} className="progress-week-row">
            {row.map((day, ci) => {
              if (day === null) return <div key={ci} className="progress-day-cell empty" />
              const count = wordsByDay[day]?.length || 0
              const isTodayCell = isToday && day === today.getDate()
              const isSelected = day === selectedDay
              const cellDate = new Date(viewYear, viewMonth - 1, day)
              const isFuture = cellDate > today
              const isPast = !isFuture && !isTodayCell
              const goalReached = isPast && count >= dailyGoal
              const goalMissed = isPast && count > 0 && count < dailyGoal
              return (
                <button
                  key={ci}
                  className={`progress-day-cell${isSelected ? ' selected' : ''}${isTodayCell ? ' today' : ''}${isFuture ? ' future' : ''}${goalReached ? ' goal-reached' : ''}${goalMissed ? ' goal-missed' : ''}`}
                  onClick={() => !isFuture && setSelectedDay(day)}
                  disabled={isFuture}
                >
                  <span className="progress-day-num">{day}</span>
                  <span className="progress-day-count">{isFuture ? '' : count > 0 ? count : '-'}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {selectedDay !== null && (
        <div className="progress-day-detail">
          <div className="progress-detail-header">
            <span className="progress-detail-title">Day {Math.max(1, Math.floor((new Date(viewYear, viewMonth - 1, selectedDay).getTime() - (prefs.startedAt ?? Date.now())) / (1000 * 60 * 60 * 24)) + 1)} Progress</span>
            <span className="progress-detail-date">{selectedDateStr}</span>
          </div>
          <div className="progress-detail-stats">
            <span className="progress-detail-percentage">{selectedPercentage}%</span>
            <span className="progress-detail-label">{selectedWords.length} out of {dailyGoal} words</span>
          </div>
        </div>
      )}

      <div className="progress-bottom-bar">
        <button
          className="progress-revise-btn"
          onClick={() => {
            const source = selectedDay !== null
              ? selectedWords
              : [...new Set((allWordsData ?? []).map((d) => d.word))]
            if (source.length > 0) {
              const unique = [...new Set(source)]
              const testWords = unique.sort(() => Math.random() - 0.5).slice(0, 20)
              localStorage.setItem('testWords', JSON.stringify(testWords))
              navigate('/test')
            }
          }}
        >
          Revise Words
        </button>
        <button
          className="progress-update-goal-btn"
          onClick={() => {
            setGoalInput(String(dailyGoal))
            setShowGoalModal(true)
          }}
        >
          Update Goal
        </button>
      </div>

      <Dialog.Root open={showGoalModal} onOpenChange={setShowGoalModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="progress-goal-overlay" />
          <Dialog.Content className="progress-goal-modal">
            <Dialog.Title className="progress-goal-modal-title">Update Daily Goal</Dialog.Title>
            <input
              className="progress-goal-input"
              type="number"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="ex: 8"
            />
            <button
              className="progress-goal-save-btn"
              disabled={!goalInput.trim() || Number(goalInput) < 1}
              onClick={() => {
                const newGoal = Number(goalInput)
                if (newGoal >= 1) {
                  setGoalMutation({ dailyGoal: newGoal })
                  setDailyGoal(newGoal)
                  setShowGoalModal(false)
                }
              }}
            >
              Save
            </button>
            <button
              className="progress-goal-cancel-btn"
              onClick={() => setShowGoalModal(false)}
            >
              Cancel
            </button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
