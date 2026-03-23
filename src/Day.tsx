import { useState, useEffect } from 'react'
import { useAction } from 'convex/react'
import { api } from '../convex/_generated/api'
import './Day.css'

interface WordDetails {
  word: string
  language: string
  translation: string
  type: string
  example: string
  conjugation?: { pronoun: string; present: string; past: string }[]
  prepositions?: { name: string; explanation: string; example: string }[]
}

const dayLabels: Record<string, string> = {
  Arabic: 'يوم',
  English: 'Day',
  German: 'Tag',
  Japanese: '日',
  Spanish: 'Día',
}

const emptyStateLabels: Record<string, string> = {
  Arabic: '!لم تتم إضافة كلمات بعد',
  English: 'No Words Added Yet!',
  German: 'Noch keine Wörter hinzugefügt!',
  Japanese: 'まだ単語が追加されていません！',
  Spanish: '¡Aún no se han añadido palabras!',
}

const languageFlags: Record<string, string> = {
  Arabic: '/assets/flag-sa.png',
  English: '/assets/flag-gb.png',
  German: '/assets/flag-de.png',
  Japanese: '/assets/flag-jp.png',
  Spanish: '/assets/flag-es.png',
}

export default function Day() {
  const [showModal, setShowModal] = useState(false)
  const [word, setWord] = useState('')
  const [words, setWords] = useState<string[]>([])
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [wordDetails, setWordDetails] = useState<WordDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const selectedLanguage = localStorage.getItem('selectedLanguage') || 'English'
  const flagSrc = languageFlags[selectedLanguage] || '/assets/flag-gb.png'
  const dailyGoal = localStorage.getItem('dailyGoal') || '8'
  const today = new Date()
  const dateStr = today.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const generateWordDetails = useAction(api.wordActions.generateWordDetails)

  useEffect(() => {
    if (!selectedWord) {
      setWordDetails(null)
      return
    }

    setLoading(true)
    generateWordDetails({ word: selectedWord, language: selectedLanguage })
      .then((data) => setWordDetails(data))
      .catch(() => setWordDetails(null))
      .finally(() => setLoading(false))
  }, [selectedWord, selectedLanguage, generateWordDetails])

  return (
    <div className="day-page">
      <div className="day-topbar">
        <button className="day-menu-btn">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 10H27M5 16H27M5 22H27" stroke="#1E1E1E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <img className="day-flag" alt={selectedLanguage} src={flagSrc} />
        <div className="day-lives">
          <img alt="" src="/assets/icon-cat-lives.svg" />
        </div>
      </div>

      <h1 className="day-title">{dayLabels[selectedLanguage] || 'Day'} 1</h1>
      <p className="day-date">{dateStr}</p>

      <div className="day-progress-row">
        <div className="day-progress-bar">
          <div className="day-progress-fill" style={{ width: `${Math.min((words.length / Number(dailyGoal)) * 100, 100)}%` }} />
        </div>
        <span className="day-progress-text">{words.length} / {dailyGoal}</span>
      </div>

      {words.length === 0 ? (
        <div className="day-empty-state">
          <div className="day-illustration">
            <img alt="" src="/assets/bambi-box.png" />
          </div>
          <p className="day-empty-text">{emptyStateLabels[selectedLanguage] || 'No Words Added Yet!'}</p>
        </div>
      ) : (
        <div className="day-words-grid">
          {words.map((w, i) => (
            <div key={i} className="day-word-card" onClick={() => setSelectedWord(w)}>
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      <div className="day-action-buttons">
        <button className="day-action-btn">
          <img alt="Camera" src="/assets/icon-camera.png" />
        </button>
        <button className="day-action-btn">
          <img alt="Upload" src="/assets/icon-upload.png" />
        </button>
        <button className="day-action-btn" onClick={() => setShowModal(true)}>
          <img alt="Add" src="/assets/icon-plus.png" />
        </button>
      </div>

      {selectedWord && (
        <div className="word-detail-overlay" onClick={() => setSelectedWord(null)}>
          <div className="word-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="word-detail-header">
              <h2 className="word-detail-word">{selectedWord}</h2>
            </div>
            <div className="word-detail-body">
              {loading ? (
                <p className="word-detail-loading">Loading...</p>
              ) : wordDetails ? (
                <>
                  <div className="word-detail-translation">
                    <span className="word-detail-original">{wordDetails.word}</span>
                    <span className="word-detail-equals">=</span>
                    <span className="word-detail-meaning">{wordDetails.translation}</span>
                  </div>
                  <p className="word-detail-type">({wordDetails.type})</p>

                  <p className="word-detail-example">
                    <span className="word-detail-label">ZB: </span>
                    <span>{wordDetails.example}</span>
                  </p>

                  {wordDetails.conjugation && wordDetails.conjugation.length > 0 && (
                    <>
                      <h3 className="word-detail-section-title">Konjugation:</h3>
                      <div className="word-detail-conjugation">
                        <div className="word-detail-col">
                          {wordDetails.conjugation.map((c, i) => (
                            <p key={i}>{c.pronoun}</p>
                          ))}
                        </div>
                        <div className="word-detail-col">
                          {wordDetails.conjugation.map((c, i) => (
                            <p key={i}>{c.present}</p>
                          ))}
                        </div>
                        <div className="word-detail-col">
                          {wordDetails.conjugation.map((c, i) => (
                            <p key={i}>{c.past}</p>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {wordDetails.prepositions && wordDetails.prepositions.length > 0 && (
                    <>
                      <h3 className="word-detail-section-title">Prepositionen:</h3>
                      <div className="word-detail-prepositions">
                        <ol>
                          {wordDetails.prepositions.map((p, i) => (
                            <li key={i}>
                              <span className="prep-name">{p.name}: </span>
                              <span>{p.explanation}</span>
                              <br />
                              BS: {p.example}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p className="word-detail-loading">Failed to load word details.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="day-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="day-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="day-modal-title">Add a word you Learned Today</h2>
            <input
              className="day-modal-input"
              type="text"
              placeholder="ex: Bootie Catootie"
              value={word}
              onChange={(e) => setWord(e.target.value)}
            />
            <button
              className="day-modal-submit"
              disabled={!word.trim()}
              onClick={() => {
                setWords([...words, word.trim()])
                setWord('')
                setShowModal(false)
              }}
            >
              Submit
            </button>
            <button
              className="day-modal-cancel"
              onClick={() => {
                setWord('')
                setShowModal(false)
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
