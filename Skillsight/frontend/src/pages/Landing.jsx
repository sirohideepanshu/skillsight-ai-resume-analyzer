import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'

const steps = [
  {
    number: '01',
    title: 'Create the role or upload the resume',
    body: 'Recruiters define what matters. Candidates submit the profile they want evaluated.'
  },
  {
    number: '02',
    title: 'See match clarity instantly',
    body: 'SkillSight highlights score, matched skills, missing skills, and next steps for both sides.'
  },
  {
    number: '03',
    title: 'Track hiring progress in one place',
    body: 'Recruiters manage pipeline status while candidates see where they stand.'
  }
]

const audienceCards = [
  {
    eyebrow: 'For recruiters',
    title: 'Rank applicants faster',
    points: ['Candidate scoring', 'Skill gap visibility', 'Shortlist and status updates'],
    tone: 'cyan'
  },
  {
    eyebrow: 'For candidates',
    title: 'Understand your progress',
    points: ['Resume upload', 'Job applications', 'Application status and feedback'],
    tone: 'emerald'
  }
]

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.1),transparent_22%),radial-gradient(circle_at_78%_18%,rgba(16,185,129,0.08),transparent_18%),linear-gradient(180deg,#07111f_0%,#08101c_50%,#0b1524_100%)] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.025)_1px,transparent_1px)] bg-[size:92px_92px] [mask-image:radial-gradient(circle_at_top,black,transparent_80%)]" />
      <Navbar />

      <main className="relative">
        <section className="px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-36">
          <div className="mx-auto grid w-full max-w-7xl gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(520px,0.95fr)] lg:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200 shadow-[0_0_36px_-18px_rgba(34,211,238,0.7)]">
                Built for recruiters and candidates
              </div>

              <h1 className="mt-8 max-w-[12ch] text-5xl font-semibold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-[5rem]">
                One hiring workspace
                <span className="block text-slate-400">for both sides.</span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300 sm:text-[1.1rem]">
                SkillSight helps recruiters evaluate candidates faster and helps candidates see their applications, resume fit, and hiring progress more clearly.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-7 py-4 text-base font-semibold text-slate-950 shadow-[0_20px_50px_-18px_rgba(34,211,238,0.9)] transition hover:-translate-y-0.5 hover:bg-cyan-300"
                >
                  Create account
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/70 px-7 py-4 text-base font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-slate-500 hover:bg-slate-800/80"
                >
                  Sign in
                </Link>
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-2">
                {audienceCards.map((card) => (
                  <AudienceCard key={card.eyebrow} {...card} />
                ))}
              </div>
            </div>

            <DualPreview />
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">How it works</p>
              <h2 className="mt-4 max-w-[14ch] text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Clear flow. Less clutter.
              </h2>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className={`rounded-[28px] border p-7 ${
                    index === 0
                      ? 'border-cyan-400/18 bg-slate-900/70 shadow-[0_24px_80px_-56px_rgba(34,211,238,0.55)]'
                      : 'border-slate-800 bg-slate-900/55'
                  }`}
                >
                  <div className="text-sm font-semibold tracking-[0.24em] text-cyan-300">{step.number}</div>
                  <h3 className="mt-5 text-2xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-4 text-base leading-7 text-slate-400">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-24 sm:px-6">
          <div className="mx-auto max-w-5xl rounded-[36px] border border-slate-800 bg-[linear-gradient(135deg,rgba(8,18,34,0.98),rgba(17,24,39,0.92))] px-6 py-12 shadow-[0_36px_120px_-60px_rgba(34,211,238,0.5)] sm:px-10 sm:py-14">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Shared value</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Better hiring decisions for recruiters. Better visibility for candidates.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-400">
                SkillSight is not just a recruiter tool and not just a candidate portal. It is the workspace that connects both sides of the hiring process.
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-7 py-4 text-base font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Get started
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-transparent px-7 py-4 text-base font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-900/60"
              >
                Open dashboard
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-800/80 px-4 py-10 sm:px-6 sm:py-12">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-5 text-sm text-slate-500 sm:flex-row">
            <span>© {new Date().getFullYear()} SkillSight. Shared hiring visibility.</span>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link to="/login" className="transition hover:text-white">
                Login
              </Link>
              <Link to="/register" className="transition hover:text-white">
                Register
              </Link>
              <Link to="/dashboard" className="transition hover:text-white">
                Dashboard
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

function AudienceCard({ eyebrow, title, points, tone }) {
  const badgeClasses =
    tone === 'cyan'
      ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200'
      : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'

  return (
    <div className="rounded-[28px] border border-slate-800 bg-slate-900/55 p-5">
      <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${badgeClasses}`}>
        {eyebrow}
      </div>
      <h3 className="mt-4 text-2xl font-semibold text-white">{title}</h3>
      <div className="mt-5 flex flex-wrap gap-2">
        {points.map((point) => (
          <span
            key={point}
            className="inline-flex rounded-full border border-slate-800 bg-slate-950/75 px-3 py-2 text-xs font-medium text-slate-300"
          >
            {point}
          </span>
        ))}
      </div>
    </div>
  )
}

function DualPreview() {
  return (
    <div className="relative grid gap-5">
      <div className="absolute -left-12 top-12 hidden h-36 w-36 rounded-full bg-cyan-400/12 blur-3xl lg:block" />
      <div className="absolute -right-10 bottom-6 hidden h-40 w-40 rounded-full bg-emerald-400/12 blur-3xl lg:block" />

      <div className="rounded-[34px] border border-slate-800/90 bg-slate-950/92 p-4 shadow-[0_44px_120px_-46px_rgba(8,145,178,0.42)] backdrop-blur">
        <div className="grid gap-4 rounded-[30px] border border-slate-800 bg-slate-900/92 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[26px] border border-slate-800 bg-slate-950/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Recruiter view</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">Candidate shortlist</h3>
              <div className="mt-5 space-y-3">
                <PreviewRow
                  title="Aarav Mehta"
                  meta="Match score 94"
                  chips={['React', 'Node.js']}
                  status="Shortlisted"
                  tone="cyan"
                />
                <PreviewRow
                  title="Maya Chen"
                  meta="Match score 86"
                  chips={['React', 'TypeScript']}
                  status="Review"
                  tone="cyan"
                />
              </div>
            </div>

            <div className="rounded-[26px] border border-slate-800 bg-slate-950/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">Candidate view</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">Application progress</h3>
              <div className="mt-5 space-y-3">
                <PreviewRow
                  title="Frontend Engineer"
                  meta="Resume uploaded and reviewed"
                  chips={['Resume ready', 'Good fit']}
                  status="Applied"
                  tone="emerald"
                />
                <PreviewRow
                  title="Backend Developer"
                  meta="Waiting for recruiter update"
                  chips={['Node.js', 'SQL']}
                  status="In review"
                  tone="emerald"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <MiniStat label="Recruiters" value="Rank and shortlist faster" />
            <MiniStat label="Candidates" value="See status with clarity" />
            <MiniStat label="Shared system" value="One workflow, both sides" />
          </div>
        </div>
      </div>
    </div>
  )
}

function PreviewRow({ title, meta, chips, status, tone }) {
  const statusClasses =
    tone === 'cyan'
      ? status === 'Shortlisted'
        ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
        : 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200'
      : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-white">{title}</div>
          <div className="mt-1 text-xs text-slate-500">{meta}</div>
        </div>
        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses}`}>
          {status}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip}
            className="inline-flex rounded-full border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-xs text-slate-300"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/78 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  )
}
