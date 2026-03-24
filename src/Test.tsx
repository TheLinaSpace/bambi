import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAction } from 'convex/react'
import { api } from '../convex/_generated/api'
import './Test.css'
import { getCatLives } from './lives'

interface Question {
  word: string
  correctAnswer: string
  options: string[]
}

const languageFlags: Record<string, string> = {
  Arabic: '/assets/flag-lb.png',

  German: '/assets/flag-de.png',
  Japanese: '/assets/flag-jp.png',

  French: '/assets/flag-fr.png',
}

export default function Test() {
  const navigate = useNavigate()
  const generateQuiz = useAction(api.wordActions.generateQuiz)
  const selectedLanguage = localStorage.getItem('selectedLanguage') || 'English'
  const flagSrc = languageFlags[selectedLanguage] || '/assets/flag-gb.png'

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState<('correct' | 'wrong' | null)[]>([])
  const [loading, setLoading] = useState(true)
  const [lives, setLivesState] = useState(() => getCatLives())
  const [attempt] = useState(() => {
    const stored = localStorage.getItem('testAttempt')
    return stored ? Number(stored) : 1
  })

  const setLives = (updater: number | ((prev: number) => number)) => {
    setLivesState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      localStorage.setItem('catLives', String(next))
      return next
    })
  }

  useEffect(() => {
    const storedWords = localStorage.getItem('testWords')
    if (!storedWords) {
      navigate('/day')
      return
    }
    const words: string[] = JSON.parse(storedWords)
    setLoading(true)
    generateQuiz({ words, language: selectedLanguage })
      .then((qs) => {
        setQuestions(qs)
        setResults(new Array(qs.length).fill(null))
      })
      .catch(() => navigate('/day'))
      .finally(() => setLoading(false))
  }, [generateQuiz, selectedLanguage, navigate])

  const currentQuestion = questions[currentIndex]
  const isCorrect = submitted && selectedAnswer === currentQuestion?.correctAnswer
  const isFinished = currentIndex >= questions.length && questions.length > 0

  const handleSubmit = () => {
    if (!selectedAnswer || !currentQuestion) return
    setSubmitted(true)
    const newResults = [...results]
    if (selectedAnswer === currentQuestion.correctAnswer) {
      newResults[currentIndex] = 'correct'
    } else {
      newResults[currentIndex] = 'wrong'
      setLives((l) => Math.max(0, l - 1))
    }
    setResults(newResults)
  }

  const handleNext = () => {
    setSelectedAnswer(null)
    setSubmitted(false)
    setCurrentIndex((i) => i + 1)
  }

  if (loading) {
    return (
      <div className="test-page">
        <p className="test-loading">Generating quiz...</p>
      </div>
    )
  }

  if (isFinished) {
    const correct = results.filter((r) => r === 'correct').length
    const percentage = Math.round((correct / questions.length) * 100)
    return (
      <div className="test-page">
        <div className="test-topbar">
          <button className="test-back-btn" onClick={() => navigate('/day')}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 10H27M5 16H27M5 22H27" stroke="#1E1E1E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <img className="test-flag" alt={selectedLanguage} src={flagSrc} />
          <div className="test-lives">
            <img alt="" src={`/assets/cat-lives-${lives}.png`} />
          </div>
        </div>

        <h1 className="test-title">Results</h1>
        <p className="test-subtitle">Attempt {attempt}</p>

        <div className="test-results-ring">
          <svg className="test-ring-svg" viewBox="0 0 300 300">
            {/* Outer thin circle */}
            <circle cx="150" cy="150" r="140" fill="none" stroke="#000" strokeWidth="2" />
            {/* Inner thin circle */}
            <circle cx="150" cy="150" r="120" fill="none" stroke="#000" strokeWidth="2" />
            {/* Progress arc */}
            <circle
              cx="150" cy="150" r="130"
              fill="none"
              stroke="#000"
              strokeWidth="18"
              strokeLinecap="round"
              strokeDasharray={`${(percentage / 100) * 2 * Math.PI * 130} ${2 * Math.PI * 130}`}
              transform="rotate(-90 150 150)"
            />
          </svg>
          <div className="test-ring-content">
            <span className="test-ring-percentage">{percentage}%</span>
            <span className="test-ring-label">{correct} out of {questions.length} words correct</span>
          </div>
        </div>

        <div className="test-results-illustration">
          <img alt="" src="/assets/bambi-results.png" />
        </div>

        <div className="test-bottom-bar">
          <button className="test-submit-btn" onClick={() => navigate('/day')}>
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="test-page">
      <div className="test-topbar">
        <button className="test-back-btn" onClick={() => navigate('/day')}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 10H27M5 16H27M5 22H27" stroke="#1E1E1E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <img className="test-flag" alt={selectedLanguage} src={flagSrc} />
        <div className="test-lives">
          <img alt="" src={`/assets/cat-lives-${lives}.png`} />
        </div>
      </div>

      <h1 className="test-title">Test</h1>
      <p className="test-subtitle">Attempt {attempt}</p>

      <div className="test-progress">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`test-progress-dot${
              results[i] === 'correct' ? ' correct' : ''
            }${results[i] === 'wrong' ? ' wrong' : ''}${
              i === currentIndex && !results[i] ? ' current' : ''
            }`}
          />
        ))}
      </div>

      {currentQuestion && (
        <>
          <div className="test-word-card">
            <span>{currentQuestion.word}</span>
          </div>

          <div className="test-options">
            {currentQuestion.options.map((option) => {
              let cls = 'test-option'
              if (submitted) {
                if (option === currentQuestion.correctAnswer) {
                  cls += option === selectedAnswer ? ' correct-selected' : ' correct-reveal'
                } else if (option === selectedAnswer) {
                  cls += ' wrong-selected'
                } else {
                  cls += ' wrong-reveal'
                }
              } else if (option === selectedAnswer) {
                cls += ' selected'
              }
              return (
                <button
                  key={option}
                  className={cls}
                  onClick={() => !submitted && setSelectedAnswer(option)}
                  disabled={submitted}
                >
                  {submitted && option === currentQuestion.correctAnswer && (
                    <span className="test-option-icon">✓</span>
                  )}
                  {submitted && option !== currentQuestion.correctAnswer && (
                    <span className="test-option-icon">✕</span>
                  )}
                  {option}
                </button>
              )
            })}
          </div>

          {submitted && (
            <div className="test-feedback">
              <img
                className="test-feedback-img"
                alt=""
                src={isCorrect ? '/assets/bambi-chill.png' : '/assets/bambi-accident.png'}
              />
            </div>
          )}

          <div className="test-bottom-bar">
            {!submitted ? (
              <button
                className={`test-submit-btn${selectedAnswer ? '' : ' disabled'}`}
                disabled={!selectedAnswer}
                onClick={handleSubmit}
              >
                Submit
              </button>
            ) : (
              <button className="test-submit-btn" onClick={handleNext}>
                Next
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
