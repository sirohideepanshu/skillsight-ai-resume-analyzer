import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import API from "../services/api"
import { setAuthSession } from "../utils/authSession"
import SkillSightLogo from "../components/SkillSightLogo"

const quickNotes = [
  {
    title: "Students",
    body: "Track resume readiness, applications, and recruiter updates."
  },
  {
    title: "Recruiters",
    body: "Review ranked candidates and move quickly on shortlist decisions."
  }
]

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const res = await API.post("/auth/login", {
        email,
        password
      })

      const token = res.data.token

      if (!token) {
        throw new Error("Token not received")
      }

      const user = res.data.user || res.data

      setAuthSession({
        token,
        userRole: user.role || "student",
        userId: user.id,
        userName: user.name || "",
        profilePhoto: user.profile_photo || ""
      })

      const role = (user.role || "").toLowerCase()

      if (role === "recruiter") {
        navigate("/dashboard/recruiter")
      } else {
        navigate("/dashboard/student")
      }
    } catch (err) {
      console.error("Login error:", err)

      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (err.code === "ERR_NETWORK"
          ? "Cannot reach server. Backend might be down or URL incorrect."
          : err.message || "Login failed")

      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

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
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Welcome back</p>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Sign in to SkillSight
                </h1>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Pick up where you left off and continue your hiring or application flow.
                </p>
              </div>

              <div className="mb-6 grid gap-3 sm:grid-cols-2">
                {quickNotes.map((note) => (
                  <div
                    key={note.title}
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4"
                  >
                    <div className="text-sm font-semibold text-white">{note.title}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-400">{note.body}</div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <FormField
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <FormField
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

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
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </button>
              </form>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            No account yet?{" "}
            <Link to="/register" className="font-medium text-cyan-300 transition hover:text-white">
              Create one
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

function FormField({ id, label, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </label>
      <input
        id={id}
        className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3.5 text-base text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
        required
        {...props}
      />
    </div>
  )
}
