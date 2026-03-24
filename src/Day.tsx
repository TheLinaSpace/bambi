import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAction, useQuery, useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'
import './Day.css'
import { getCatLives } from './lives'

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
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [word, setWord] = useState('')
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null)
  const [slideDirection, setSlideDirection] = useState<'up' | 'down'>('up')
  const [wordDetails, setWordDetails] = useState<WordDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [scannedWords, setScannedWords] = useState<string[]>([])
  const [selectedScanned, setSelectedScanned] = useState<Set<string>>(new Set())
  const [showScanModal, setShowScanModal] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [goalCelebrated, setGoalCelebrated] = useState(false)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const selectedLanguage = localStorage.getItem('selectedLanguage') || 'English'
  const flagSrc = languageFlags[selectedLanguage] || '/assets/flag-gb.png'
  const dailyGoal = localStorage.getItem('dailyGoal') || '8'
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const dateStr = today.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const dailyWordsData = useQuery(api.dailyWords.getByDate, { language: selectedLanguage, date: todayStr })
  const addWord = useMutation(api.dailyWords.addWord)
  const removeWord = useMutation(api.dailyWords.removeWord)
  const words = dailyWordsData?.map((d) => d.word) ?? []
  const [draggingWord, setDraggingWord] = useState<string | null>(null)
  const [dropZoneActive, setDropZoneActive] = useState(false)
  const selectedWord = selectedWordIndex !== null ? words[selectedWordIndex] ?? null : null
  const prevWord = selectedWordIndex !== null && selectedWordIndex > 0 ? words[selectedWordIndex - 1] : null
  const nextWord = selectedWordIndex !== null && selectedWordIndex < words.length - 1 ? words[selectedWordIndex + 1] : null

  const generateWordDetails = useAction(api.wordActions.generateWordDetails)
  const scanWordsFromImage = useAction(api.wordActions.scanWordsFromImage)

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxSize = 1024
        let { width, height } = img
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        } else if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
        resolve(dataUrl.split(',')[1])
      }
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setScanning(true)
    setShowScanModal(true)

    try {
      const base64 = await compressImage(file)
      const words = await scanWordsFromImage({
        imageBase64: base64,
        language: selectedLanguage,
      })
      setScannedWords(words)
      setSelectedScanned(new Set(words))
    } catch {
      setScannedWords([])
    } finally {
      setScanning(false)
    }

    // Reset input so same file can be selected again
    e.target.value = ''
  }

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

  useEffect(() => {
    if (!goalCelebrated && words.length >= Number(dailyGoal) && words.length > 0) {
      setShowCelebration(true)
      setGoalCelebrated(true)
    }
  }, [words.length, dailyGoal, goalCelebrated])

  return (
    <div className="day-page">
      <div className="day-topbar">
        <button className="day-menu-btn" onClick={() => setShowMenu(!showMenu)}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 10H27M5 16H27M5 22H27" stroke="#1E1E1E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {showMenu && (
          <div className="day-menu-overlay" onClick={() => setShowMenu(false)}>
            <div className="day-menu-dropdown" onClick={(e) => e.stopPropagation()}>
              <button className="day-menu-item" onClick={() => { setShowMenu(false) }}>
                Words Today
              </button>
              <button className="day-menu-item" onClick={() => { setShowMenu(false); navigate('/progress') }}>
                Progress
              </button>
            </div>
          </div>
        )}
        <img className="day-flag" alt={selectedLanguage} src={flagSrc} />
        <div className="day-lives">
          <img alt="" src={`/assets/cat-lives-${getCatLives()}.png`} />
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
        <>
          <div className="day-words-grid">
            {words.map((w, i) => (
              <div
                key={i}
                className="day-word-card"
                draggable
                onClick={() => setSelectedWordIndex(i)}
                onDragStart={(e) => {
                  setDraggingWord(w)
                  e.dataTransfer.setData('text/plain', w)
                }}
                onDragEnd={() => {
                  setDraggingWord(null)
                  setDropZoneActive(false)
                }}
              >
                <span>{w}</span>
              </div>
            ))}
          </div>
          {draggingWord && (
            <div
              className={`day-delete-zone${dropZoneActive ? ' active' : ''}`}
              onDragOver={(e) => {
                e.preventDefault()
                setDropZoneActive(true)
              }}
              onDragLeave={() => setDropZoneActive(false)}
              onDrop={(e) => {
                e.preventDefault()
                const w = e.dataTransfer.getData('text/plain')
                if (w) {
                  removeWord({ word: w, language: selectedLanguage, date: todayStr })
                }
                setDraggingWord(null)
                setDropZoneActive(false)
              }}
            >
              🗑️ Drop to delete
            </div>
          )}
        </>
      )}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        style={{ display: 'none' }}
      />
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        onChange={handleCameraCapture}
        style={{ display: 'none' }}
      />

      <div className="day-bottom-bar">
        {words.length >= Number(dailyGoal) && (
          <button className="day-test-button" onClick={() => {
            localStorage.setItem('testWords', JSON.stringify(words))
            navigate('/test')
          }}>
            Test Me
          </button>
        )}
        <div className="day-action-buttons">
          <button className="day-action-btn" onClick={() => cameraInputRef.current?.click()}>
            <img alt="Camera" src="/assets/icon-camera.png" />
          </button>
          <button className="day-action-btn" onClick={() => uploadInputRef.current?.click()}>
            <img alt="Upload" src="/assets/icon-upload.png" />
          </button>
          <button className="day-action-btn" onClick={() => setShowModal(true)}>
            <img alt="Add" src="/assets/icon-plus.png" />
          </button>
        </div>
      </div>

      {selectedWordIndex !== null && selectedWord && (
        <div className="word-detail-overlay" onClick={() => setSelectedWordIndex(null)}>
          <div className="word-detail-modal" onClick={(e) => e.stopPropagation()}>
            {prevWord && (
              <div className="word-detail-prev" onClick={() => { setSlideDirection('down'); setSelectedWordIndex(selectedWordIndex - 1); }}>
                <h2 className="word-detail-prev-text">{prevWord}</h2>
              </div>
            )}
            <div key={selectedWordIndex} className={`word-detail-body slide-${slideDirection}`}>
              {loading ? (
                <p className="word-detail-loading">Loading...</p>
              ) : wordDetails ? (
                <>
                  <div className="word-detail-translation">
                    <div className="word-detail-translation-row">
                      <span className="word-detail-original">{wordDetails.word}</span>
                      <span className="word-detail-equals">=</span>
                    </div>
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
            {nextWord && (
              <div className="word-detail-next" onClick={() => { setSlideDirection('up'); setSelectedWordIndex(selectedWordIndex + 1); }}>
                <h2 className="word-detail-next-text">{nextWord}</h2>
              </div>
            )}
          </div>
        </div>
      )}

      {showScanModal && (
        <div className="day-modal-overlay" onClick={() => { setShowScanModal(false); setScannedWords([]); }}>
          <div className="day-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="day-modal-title">Words Found</h2>
            {scanning ? (
              <p className="scan-loading">Scanning image...</p>
            ) : scannedWords.length === 0 ? (
              <p className="scan-loading">No words found. Try another photo.</p>
            ) : (
              <>
                <div className="scan-words-list">
                  {scannedWords.map((w) => (
                    <button
                      key={w}
                      className={`scan-word-item${selectedScanned.has(w) ? ' selected' : ''}`}
                      onClick={() => {
                        const next = new Set(selectedScanned)
                        if (next.has(w)) next.delete(w)
                        else next.add(w)
                        setSelectedScanned(next)
                      }}
                    >
                      <div className="language-checkbox">
                        <span className="checkmark">✓</span>
                      </div>
                      <span>{w}</span>
                    </button>
                  ))}
                </div>
                <button
                  className="day-modal-submit"
                  disabled={selectedScanned.size === 0}
                  onClick={() => {
                    Array.from(selectedScanned).forEach((w) =>
                      addWord({ word: w, language: selectedLanguage, date: todayStr })
                    )
                    setShowScanModal(false)
                    setScannedWords([])
                    setSelectedScanned(new Set())
                  }}
                >
                  Add {selectedScanned.size} word{selectedScanned.size !== 1 ? 's' : ''}
                </button>
              </>
            )}
            <button
              className="day-modal-cancel"
              onClick={() => { setShowScanModal(false); setScannedWords([]); }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showCelebration && (
        <div className="celebration-overlay" onClick={() => setShowCelebration(false)}>
          <div className="celebration-modal" onClick={(e) => e.stopPropagation()}>
            <div className="celebration-close-row">
              <button className="celebration-close" onClick={() => setShowCelebration(false)}>✕</button>
            </div>
            <h2 className="celebration-title">YAY! You reached your Word Goal</h2>
            <div className="celebration-illustration">
              <img alt="" src="/assets/bambi-tank.png" />
            </div>
            <p className="celebration-caption">Cat filled the word tank</p>
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
                addWord({ word: word.trim(), language: selectedLanguage, date: todayStr })
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
