import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'
import * as RadioGroup from '@radix-ui/react-radio-group'
import './SelectLanguage.css'

const illustration = '/assets/bambi-illustration.png'

const languages = ['Lebanese Arabic', 'French', 'German', 'Japanese']

export default function SelectLanguage() {
  const [selected, setSelected] = useState<string | null>(null)
  const navigate = useNavigate()
  const setLanguage = useMutation(api.userPreferences.setLanguage)

  return (
    <div className="select-language-page">
      <div className="select-illustration-top">
        <div className="select-illustration-inner">
          <img alt="" src={illustration} />
        </div>
      </div>

      <h1 className="select-title">Select Language</h1>

      <RadioGroup.Root
        className="language-list"
        value={selected ?? undefined}
        onValueChange={setSelected}
      >
        {languages.map((lang) => (
          <RadioGroup.Item key={lang} value={lang} asChild>
            <button
              className={`language-option${selected === lang ? ' selected' : ''}`}
            >
              <div className="language-checkbox">
                <span className="checkmark">✓</span>
              </div>
              <span className="language-label">{lang}</span>
            </button>
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>

      <button
        className={`select-button${selected ? ' active' : ''}`}
        disabled={!selected}
        onClick={() => {
          if (selected) {
            setLanguage({ selectedLanguage: selected })
          }
          navigate('/set-goal')
        }}
      >
        Select
      </button>
    </div>
  )
}
