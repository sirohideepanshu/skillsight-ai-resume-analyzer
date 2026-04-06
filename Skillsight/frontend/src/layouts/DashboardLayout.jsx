import { Link, useLocation } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import API from "../services/api"
import SkillSightLogo from "../components/SkillSightLogo"
import {
  clearAuthSession,
  getAuthToken,
  getSessionItem,
  updateProfileSession
} from "../utils/authSession"

const STUDENT_LINKS = [
  { to: "/dashboard/student", label: "Overview", icon: IconDashboard },
  { to: "/dashboard/student#resume", label: "Resume", icon: IconResume },
  { to: "/dashboard/student#jobs", label: "Jobs", icon: IconBriefcase },
  { to: "/dashboard/student#applications", label: "Applications", icon: IconCheck },
  { to: "/dashboard/student#learning", label: "Learning Paths", icon: IconBook },
  { to: "/dashboard/student/settings", label: "Settings", icon: IconSettings }
]

const RECRUITER_LINKS = [
  { to: "/dashboard/recruiter", label: "Overview", icon: IconDashboard },
  { to: "/dashboard/jobs", label: "Jobs", icon: IconBriefcase },
  { to: "/dashboard/jobs/create", label: "Create Job", icon: IconPlus },
  { to: "/dashboard/candidates/ranking", label: "Candidates", icon: IconUsers },
  { to: "/dashboard/settings", label: "Settings", icon: IconSettings }
]

export default function DashboardLayout({ children, pageTitle }) {
  const location = useLocation()
  const storedRole = getSessionItem("userRole")

  const role = location.pathname.startsWith("/dashboard/student")
    ? "student"
    : location.pathname.startsWith("/dashboard/recruiter") ||
        location.pathname.startsWith("/dashboard/jobs") ||
        location.pathname.startsWith("/dashboard/candidates") ||
        location.pathname === "/dashboard/settings"
      ? "recruiter"
      : storedRole

  const [profile, setProfile] = useState({
    name: getSessionItem("userName") || (role === "student" ? "Student" : "Recruiter"),
    profile_photo: getSessionItem("profilePhoto") || ""
  })

  const profilePhoto = profile.profile_photo || "https://i.pravatar.cc/160?img=12"
  const links = role === "student" ? STUDENT_LINKS : role === "recruiter" ? RECRUITER_LINKS : []
  const currentHash = location.hash || ""

  const roleLabel = role === "student" ? "Student workspace" : "Recruiter workspace"

  const activeSection = useMemo(() => {
    if (!currentHash) return null
    return currentHash
  }, [currentHash])

  useEffect(() => {
    const token = getAuthToken()
    if (!token) return

    const loadProfile = async () => {
      try {
        const res = await API.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const nextProfile = res.data?.user || {}
        const nextName = nextProfile.name || (role === "student" ? "Student" : "Recruiter")
        const nextPhoto = nextProfile.profile_photo || ""

        setProfile({
          name: nextName,
          profile_photo: nextPhoto
        })

        updateProfileSession({
          userName: nextName,
          profilePhoto: nextPhoto
        })
      } catch (error) {
        console.error("Failed to load sidebar profile:", error)
      }
    }

    loadProfile()
  }, [role])

  const logout = () => {
    clearAuthSession()
    window.location.href = "/login"
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_28%),linear-gradient(180deg,#07111f_0%,#08101c_48%,#0b1524_100%)] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:68px_68px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />

      <div className="relative flex min-h-screen flex-col lg:flex-row">
        {(role === "recruiter" || role === "student") && (
          <aside className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:w-[290px] lg:shrink-0 lg:border-b-0 lg:border-r">
            <div className="flex h-full flex-col px-4 py-5 sm:px-6 lg:px-5">
              <div className="flex items-center justify-between lg:block">
                <Link to="/" className="inline-flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl">
                    <SkillSightLogo className="h-11 w-11" />
                  </span>
                  <div>
                    <div className="text-lg font-semibold tracking-tight text-white">SkillSight</div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{roleLabel}</div>
                  </div>
                </Link>
              </div>

              <div className="mt-6 rounded-[28px] border border-slate-800 bg-slate-900/75 p-4 shadow-[0_28px_80px_-60px_rgba(34,211,238,0.65)]">
                <div className="flex items-center gap-4">
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="h-16 w-16 rounded-2xl object-cover ring-2 ring-cyan-400/20"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-white">{profile.name}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {role === "student" ? "Student account" : "Recruiter account"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                    Current view
                  </p>
                  <p className="mt-2 text-sm text-slate-300">{pageTitle}</p>
                </div>
              </div>

              <nav className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible">
                {links.map((link) => {
                  const active = isActiveLink(link.to, location.pathname, activeSection)
                  const Icon = link.icon

                  const content = (
                    <>
                      <span
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border ${
                          active
                            ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
                            : "border-slate-800 bg-slate-950/70 text-slate-500"
                        }`}
                      >
                        <Icon />
                      </span>
                      <span className="whitespace-nowrap">{link.label}</span>
                    </>
                  )

                  const classes = `group inline-flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                    active
                      ? "border-cyan-400/20 bg-cyan-400/10 text-white shadow-[0_18px_40px_-28px_rgba(34,211,238,0.8)]"
                      : "border-transparent bg-transparent text-slate-400 hover:border-slate-800 hover:bg-slate-900/75 hover:text-white"
                  }`

                  return link.to.includes("#") ? (
                    <a key={link.to} href={link.to} className={classes}>
                      {content}
                    </a>
                  ) : (
                    <Link key={link.to} to={link.to} className={classes}>
                      {content}
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-6 rounded-[28px] border border-slate-800 bg-slate-900/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace note</p>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {role === "student"
                    ? "Keep your resume current, apply selectively, and use learning paths to close visible skill gaps."
                    : "Track pipeline quality, update candidate status quickly, and keep hiring signals visible."}
                </p>
              </div>

              <div className="mt-auto pt-6">
                <button
                  onClick={logout}
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/15"
                >
                  Logout
                </button>
              </div>
            </div>
          </aside>
        )}

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur">
            <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 px-4 py-5 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                    {role === "student" ? "Career workspace" : "Hiring workspace"}
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">{pageTitle}</h1>
                </div>
                <div className="inline-flex items-center rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2 text-sm text-slate-400">
                  {role === "student" ? "Focus on next best move" : "Focus on next best candidate"}
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function isActiveLink(target, pathname, hash) {
  if (target.includes("#")) {
    const [basePath, targetHash] = target.split("#")
    return pathname === basePath && hash === `#${targetHash}`
  }

  if (target === "/dashboard/jobs") {
    return pathname === target
  }

  return pathname === target || pathname.startsWith(`${target}/`)
}

function IconDashboard() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 13h7V4H4v9zm0 7h7v-3H4v3zm9 0h7v-9h-7v9zm0-13v3h7V4h-7z" />
    </svg>
  )
}

function IconResume() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function IconBriefcase() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  )
}

function IconBook() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

function IconSettings() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317a1.724 1.724 0 013.35 0 1.724 1.724 0 002.573 1.066 1.724 1.724 0 012.36.632 1.724 1.724 0 01-.632 2.36 1.724 1.724 0 000 3.25 1.724 1.724 0 01.632 2.36 1.724 1.724 0 01-2.36.632 1.724 1.724 0 00-2.573 1.066 1.724 1.724 0 01-3.35 0 1.724 1.724 0 00-2.573-1.066 1.724 1.724 0 01-2.36-.632 1.724 1.724 0 01.632-2.36 1.724 1.724 0 000-3.25 1.724 1.724 0 01-.632-2.36 1.724 1.724 0 012.36-.632 1.724 1.724 0 002.573-1.066z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 5v14m7-7H5" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5V9l-5-4v15zM2 20h13V4H7L2 8v12zm4-9h5m-5 4h5" />
    </svg>
  )
}
