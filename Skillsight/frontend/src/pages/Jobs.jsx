import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import DashboardLayout from "../layouts/DashboardLayout.jsx"
import API from "../services/api"

export default function Jobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  const loadJobs = async () => {
    try {
      const res = await API.get("/api/jobs")
      setJobs(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.error("Failed to load jobs:", error)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  loadJobs()
}, [])

 

  const weightedRoles = useMemo(
    () => jobs.filter((job) => job.skill_weights && Object.keys(job.skill_weights).length > 0).length,
    [jobs]
  )

  return (
    <DashboardLayout pageTitle="Jobs">
      <div className="space-y-6">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
          <div className="rounded-[32px] border border-slate-800 bg-slate-900/65 p-6 shadow-[0_30px_120px_-70px_rgba(34,211,238,0.7)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Job management</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-4xl">
              Keep live roles visible and ranking-ready.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Scan the board, spot weighted roles, and move straight into creation when needed.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <MetricCard value={jobs.length} label="Total jobs" />
              <MetricCard value={weightedRoles} label="Weighted roles" />
              <MetricCard value={jobs.length > 0 ? "Live" : "Empty"} label="Board state" />
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-800 bg-slate-900/65 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Quick actions</p>
            <div className="mt-6 space-y-4">
              <ActionCard
                title="Create a new job"
                body="Define the role, required skills, and weightage before candidates start applying."
                to="/dashboard/jobs/create"
                label="Create job"
              />
              <ActionCard
                title="Review candidates"
                body="Move to rankings once you have applicants and need a fast shortlist view."
                to="/dashboard/candidates/ranking"
                label="Open rankings"
              />
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-800 bg-slate-900/65 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Roles</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">Live roles</h3>
            </div>
            <Link
              to="/dashboard/jobs/create"
              className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Create job
            </Link>
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="rounded-[28px] border border-slate-800 bg-slate-950/75 px-6 py-12 text-center text-slate-400">
                Loading jobs...
              </div>
            ) : jobs.length === 0 ? (
              <EmptyJobs />
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {jobs.map((job) => (
                  <article
                    key={job.id}
                    className="rounded-[28px] border border-slate-800 bg-slate-950/75 p-6 transition hover:border-slate-700"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xl font-semibold text-white">{job.title}</h4>
                        <p className="mt-3 text-sm leading-7 text-slate-400">
                          {truncate(job.description, 170)}
                        </p>
                      </div>
                      <span className="inline-flex items-center rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300">
                        {job.created_at
                          ? new Date(job.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })
                          : "Recently created"}
                      </span>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
                        Shortlist at {job.min_match_score ?? 75}%
                      </span>
                      <span className="inline-flex items-center rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-semibold text-violet-200">
                        Min exp {job.min_experience_years ?? 0} yrs
                      </span>
                      {job.skill_weights && Object.keys(job.skill_weights).length > 0 ? (
                        Object.entries(job.skill_weights).map(([skill, value]) => (
                          <span
                            key={skill}
                            className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-200"
                          >
                            {skill}: {value}%
                          </span>
                        ))
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-400">
                          No weightage configured
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

function EmptyJobs() {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-800 bg-slate-950/75 px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900 text-cyan-200">
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="mt-6 text-xl font-semibold text-white">No jobs created yet</p>
      <Link
        to="/dashboard/jobs/create"
        className="mt-6 inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
      >
        Create job
      </Link>
    </div>
  )
}

function MetricCard({ value, label }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
      <p className="text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{label}</p>
    </div>
  )
}

function ActionCard({ title, body, to, label }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-7 text-slate-400">{body}</p>
      <Link
        to={to}
        className="mt-4 inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-cyan-400/30 hover:text-white"
      >
        {label}
      </Link>
    </div>
  )
}

function truncate(str, maxLen) {
  if (!str || typeof str !== "string") return ""
  return str.length <= maxLen ? str : `${str.slice(0, maxLen).trim()}…`
}
