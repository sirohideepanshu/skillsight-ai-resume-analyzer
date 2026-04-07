import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../services/api'
import { setAuthSession } from '../utils/authSession'   // ✅ IMPORTANT FIX
import SkillSightLogo from '../components/SkillSightLogo'

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const res = await API.post('/auth/login', {
  email,
  password
})

      console.log("Login success:", res.data)

      const token = res.data.token

if (!token) {
  throw new Error("Token not received")
}
      const user = res.data.user || res.data

      // ✅ Save session
      setAuthSession({
        token,
        userRole: user.role || 'student',
        userId: user.id,
        userName: user.name || '',
        profilePhoto: user.profile_photo || ''
      })

      // ✅ Redirect FIX
      const role = (user.role || '').toLowerCase()

      if (role === 'recruiter') {
        navigate('/dashboard/recruiter')
      } else {
        navigate('/dashboard/student')
      }

    } catch (err) {
      console.error('Login error:', err)

      if (err.response) {
        setError(err.response.data?.error || err.response.data?.message || 'Login failed')
      } else {
        setError('Cannot connect to server')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 p-6 bg-slate-800 rounded-xl">
        <h2 className="text-xl font-bold">Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded bg-slate-700"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded bg-slate-700"
        />

        {error && <p className="text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-cyan-400 text-black p-3 rounded"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>

        <p>
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  )
}