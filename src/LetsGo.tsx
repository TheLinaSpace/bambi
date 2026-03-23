import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './LetsGo.css'

const bambiLaptop = '/assets/bambi-laptop.png'

const text = 'LET"S G' + 'O'.repeat(200)

export default function LetsGo() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/day')
    }, 15000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="letsgo-page">
      <div className="letsgo-illustration">
        <img alt="" src={bambiLaptop} />
      </div>

      <div className="letsgo-text-container">
        <p className="letsgo-text">
          {text.split('').map((char, i) => (
            <span key={i} style={{ animationDelay: `${0.8 + i * 0.03}s` }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </p>
      </div>
    </div>
  )
}
