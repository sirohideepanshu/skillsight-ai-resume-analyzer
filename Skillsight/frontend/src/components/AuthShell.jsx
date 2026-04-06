import { Link } from 'react-router-dom'
import SkillSightLogo from './SkillSightLogo'

export default function AuthShell({
  eyebrow,
  title,
  description,
  stats = [],
  featureTitle,
  featureBody,
  highlights = [],
  children,
  footer
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_28%),linear-gradient(180deg,#07111f_0%,#08101c_48%,#0b1524_100%)] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(460px,520px)] lg:items-center">
          <section className="order-2 max-w-2xl lg:order-1">
            <Link
              to="/"
              className="inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300/40 hover:bg-cyan-400/15"
            >
              <SkillSightLogo className="h-8 w-8" />
              SkillSight
            </Link>

            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
              {eyebrow}
            </p>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {title}
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              {description}
            </p>

            {stats.length > 0 && (
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-800/80 bg-slate-900/55 p-5 backdrop-blur"
                  >
                    <div className="text-2xl font-semibold text-white">{stat.value}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-10 rounded-[32px] border border-slate-800/90 bg-slate-900/60 p-7 shadow-[0_28px_100px_-60px_rgba(34,211,238,0.7)] backdrop-blur">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/75 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
                  {featureTitle}
                </p>
                <p className="mt-4 text-base leading-7 text-slate-300">
                  {featureBody}
                </p>

                <div className="mt-6 space-y-3">
                  {highlights.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300"
                    >
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-xs font-bold text-cyan-200">
                        +
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="order-1 lg:order-2">
            {children}
            {footer ? <div className="mt-6">{footer}</div> : null}
          </section>
        </div>
      </main>
    </div>
  )
}
