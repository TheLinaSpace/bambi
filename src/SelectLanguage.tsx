import { useState } from 'react'
import './SelectLanguage.css'

const illustration = '/assets/bambi-illustration.png'

const languages = ['Arabic', 'English', 'German', 'Japanese', 'Spanish']

export default function SelectLanguage({ onNext }: { onNext: () => void }) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="select-language-page">
      <div className="select-illustration-top">
        <div className="select-illustration-inner">
          <img alt="" src={illustration} />
        </div>
      </div>

      <h1 className="select-title">Select Language</h1>

      <div className="language-list">
        {languages.map((lang) => (
          <button
            key={lang}
            className={`language-option${selected === lang ? ' selected' : ''}`}
            onClick={() => setSelected(lang)}
          >
            <div className="language-checkbox">
              <span className="checkmark">✓</span>
            </div>
            <span className="language-label">{lang}</span>
          </button>
        ))}
      </div>

      <button
        className={`select-button${selected ? ' active' : ''}`}
        disabled={!selected}
        onClick={onNext}
      >
        Select
      </button>
    </div>
  )
}
