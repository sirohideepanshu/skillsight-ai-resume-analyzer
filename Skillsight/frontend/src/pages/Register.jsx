import { useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../services/api'
import SkillSightLogo from '../components/SkillSightLogo'

const roleOptions = [
  {
    value: 'student',
    label: 'Student',
    description: 'Apply to roles and track progress.'
  },
  {
    value: 'recruiter',
    label: 'Recruiter',
    description: 'Create jobs and review candidates.'
  }
]

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    experience_years: ''
  })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleRegister(e) {
    e.preventDefault()
    setSuccess('')
    setError('')
    setIsSubmitting(true)

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        experience_years:
          formData.role === 'student' && formData.experience_years !== ''
            ? Number(formData.experience_years)
            : null
      }

      await API.post('/auth/register', payload)
      setSuccess('Account created. You can sign in now.')
    } catch (err) {
      const message =
        err.response?.data?.error ||
        (err.code === 'ERR_NETWORK'
  ? 'Cannot reach server. Backend might be down or URL incorrect.'
          : err.message || 'Registration failed')
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedRole = roleOptions.find((option) => option.value === formData.role)

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.1),transparent_24%),linear-gradient(180deg,#07111f_0%,#08101c_52%,#0b1524_100%)] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.025)_1px,transparent_1px)] bg-[size:96px_96px] [mask-image:radial-gradient(circle_at_top,black,transparent_80%)]" />

      <main className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-xl">
          <div className="mb-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300/40 hover:bg-cyan-400/15"
            >
              <SkillSightLogo className="h-8 w-8" />
              SkillSight
            </Link>
          </div>

          <div className="rounded-[32px] border border-slate-800/90 bg-slate-900/78 p-6 shadow-[0_30px_120px_-70px_rgba(34,211,238,0.45)] backdrop-blur sm:p-8">
            <div className="rounded-[28px] border border-slate-800 bg-slate-950/82 p-6 sm:p-8">
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Create account</p>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Join SkillSight
                </h1>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Choose your role and create your account.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Role
                  </label>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {roleOptions.map((option) => {
                      const active = formData.role === option.value
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData((data) => ({ ...data, role: option.value }))}
                          className={`rounded-2xl border px-4 py-4 text-left transition ${
                            active
                              ? 'border-cyan-400/40 bg-cyan-400/10 text-white'
                              : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          <div className="font-semibold">{option.label}</div>
                          <div className="mt-2 text-sm leading-6">{option.description}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <FormField
                  id="name"
                  label="Full name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData((data) => ({ ...data, name: e.target.value }))}
                />

                <FormField
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData((data) => ({ ...data, email: e.target.value }))}
                />

                <FormField
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={(e) => setFormData((data) => ({ ...data, password: e.target.value }))}
                />

                {formData.role === 'student' ? (
                  <FormField
                    id="experience"
                    label="Experience"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={formData.experience_years}
                    onChange={(e) => setFormData((data) => ({ ...data, experience_years: e.target.value }))}
                    required={false}
                    hint="Optional"
                  />
                ) : null}

                {success && (
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                    {success}
                  </div>
                )}

                {error && (
                  <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400 px-5 py-4 text-base font-semibold text-slate-950 shadow-[0_20px_50px_-18px_rgba(34,211,238,0.7)] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Creating account...' : 'Create account'}
                </button>
              </form>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-cyan-300 transition hover:text-white">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

function FormField({ id, label, hint, required = true, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </label>
      <input
        id={id}
        className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3.5 text-base text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
        required={required}
        {...props}
      />
      {hint ? <p className="mt-2 text-sm text-slate-500">{hint}</p> : null}
    </div>
  )
}
