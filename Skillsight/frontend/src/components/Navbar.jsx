import { Link } from 'react-router-dom'
import SkillSightLogo from './SkillSightLogo'

export default function Navbar() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 w-full border-b border-slate-800/70 bg-slate-950/55 backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-3 text-white">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl shadow-[0_0_30px_-14px_rgba(34,211,238,0.8)]">
            <SkillSightLogo className="h-11 w-11" />
          </span>
          <div>
            <span className="block text-[1.35rem] font-semibold tracking-tight">SkillSight</span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.28em] text-slate-500">
              Hiring workspace
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2 rounded-full border border-slate-800/80 bg-slate-900/70 px-2 py-2 sm:gap-3">
          <Link
            to="/login"
            className="rounded-full px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800/80 hover:text-white"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-full px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800/80 hover:text-white"
          >
            Register
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_14px_30px_-16px_rgba(34,211,238,0.95)] transition-colors hover:bg-cyan-300"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  )
}
