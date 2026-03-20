import './LetsGo.css'

const illustration = '/assets/bambi-illustration.png'

export default function LetsGo() {
  return (
    <div className="letsgo-page">
      <div className="letsgo-illustration">
        <div className="letsgo-illustration-inner">
          <img alt="" src={illustration} />
        </div>
      </div>

      <p className="letsgo-text">
        {'LET"S GOOOOOOOOOOO'.split('').map((char, i) => (
          <span key={i} style={{ animationDelay: `${0.8 + i * 0.04}s` }}>
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </p>
    </div>
  )
}
