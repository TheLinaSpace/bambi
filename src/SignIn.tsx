import { useState } from 'react'
import { useAuthActions } from '@convex-dev/auth/react'
import './SignIn.css'

export default function SignIn() {
  const { signIn } = useAuthActions()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn('password', {
        email,
        password,
        flow: isSignUp ? 'signUp' : 'signIn',
      })
    } catch {
      setError(isSignUp ? 'Could not create account. Try a different email.' : 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signin-page">
      <h1 className="signin-title">Bambi</h1>
      <p className="signin-subtitle">{isSignUp ? 'Create Account' : 'Welcome Back'}</p>

      <form className="signin-form" onSubmit={handleSubmit}>
        <input
          className="signin-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="signin-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />

        {error && <p className="signin-error">{error}</p>}

        <button className="signin-submit" type="submit" disabled={loading}>
          {loading ? '...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <button className="signin-toggle" onClick={() => { setIsSignUp(!isSignUp); setError('') }}>
        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
      </button>
    </div>
  )
}
