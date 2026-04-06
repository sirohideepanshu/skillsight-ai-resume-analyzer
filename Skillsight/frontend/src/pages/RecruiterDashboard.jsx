import { useEffect, useMemo, useState } from "react"
import DashboardLayout from "../layouts/DashboardLayout.jsx"
import API from "../services/api"
import { getAuthToken, getSessionItem } from "../utils/authSession"

const backendBaseUrl = API.defaults.baseURL?.replace(/\/$/, "") || ""

export default function RecruiterDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [applications, setApplications] = useState([])
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    avgScore: 0
  })

  const token = getAuthToken()
  const recruiterName = getSessionItem("userName") || "Recruiter"

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const statsRes = await API.get("/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const d = statsRes.data

        setStats({
          activeJobs: d.activeJobs ?? d.totalJobs ?? 0,
          totalApplications: d.totalApplications ?? 0,
          shortlisted: d.shortlisted ?? d.shortlistedCandidates ?? 0,
          avgScore: d.avgScore ?? d.averageScore ?? 0
        })

        const appRes = await API.get("/dashboard/recent-applications", {
          headers: { Authorization: `Bearer ${token}` }
        })

        setApplications(Array.isArray(appRes.data) ? appRes.data : [])
      } catch (err) {
        console.error("Dashboard error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const updateApplication = async (applicationId, payload) => {
    try {
      const res = await API.patch(
        `/applications/${applicationId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setApplications((prev) =>
        prev.map((item) =>
          item.application_id === applicationId
            ? {
                ...item,
                status: res.data.status || payload.status,
                rejection_feedback: res.data.rejection_feedback || ""
              }
            : item
        )
      )
    } catch (err) {
      console.error("Failed to update application:", err)
    }
  }

  const interviewReady = useMemo(
    () => applications.filter((app) => (app.status || "").toLowerCase() === "shortlisted").length,
    [applications]
  )

  const newestApplication = applications[0]
  const avgScoreDisplay = stats.totalApplications > 0 && stats.avgScore === 0 ? "—" : stats.avgScore

  return (
    <DashboardLayout pageTitle="Recruiter Dashboard">
      <div className="space-y-6">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <div className="rounded-[32px] border border-slate-800 bg-slate-900/65 p-6 shadow-[0_30px_120px_-70px_rgba(34,211,238,0.7)] sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Pipeline overview</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-4xl">
                  {recruiterName}, review faster and keep the pipeline clean.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                  Open roles, total applicants, and shortlist pressure in one view.
                </p>
              </div>
              <div className="inline-flex items-center rounded-full border border-slate-800 bg-slate-950/70 px-3 py-1.5 text-xs font-medium text-slate-300">
                {applications.length} active review item{applications.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <MetricCard
                title="Active jobs"
                value={stats.activeJobs}
                detail="Roles currently collecting applicants"
                icon={<IconBriefcase />}
              />
              <MetricCard
                title="Applications"
                value={stats.totalApplications}
                detail="Candidates waiting in this pipeline"
                icon={<IconFile />}
              />
              <MetricCard
                title="Shortlisted"
                value={stats.shortlisted}
                detail="Profiles ready for recruiter attention"
                icon={<IconCheck />}
              />
            </div>

            {stats.totalApplications > 0 && stats.avgScore === 0 && (
              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-400">
                Resume analysis is still pending, so match scores are not available yet.
              </div>
            )}
          </div>

          <div className="rounded-[32px] border border-slate-800 bg-slate-900/65 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Quick view</p>

            <div className="mt-5 rounded-[24px] border border-slate-800 bg-slate-950/75 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Average match score</p>
              <div className="mt-3 flex items-end gap-3">
                <span className="text-4xl font-semibold tracking-tight text-white">{avgScoreDisplay}</span>
                <span className="pb-1 text-sm text-slate-500">
                  {avgScoreDisplay === "—" ? "Awaiting analysis" : "current average"}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <QuickRow label="Interview-ready" value={`${interviewReady}`} />
              <QuickRow
                label="Newest application"
                value={newestApplication?.candidate_name || newestApplication?.candidate_email || "None yet"}
              />
              <QuickRow
                label="Focus"
                value={stats.shortlisted > 0 ? "Convert shortlisted candidates" : "Review new applicants"}
              />
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-800 bg-slate-900/65 overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 px-6 py-5 sm:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Recent applications</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">Candidate review table</h3>
            </div>
            <div className="inline-flex items-center rounded-full border border-slate-800 bg-slate-950/75 px-3 py-1.5 text-sm font-medium text-slate-300">
              {applications.length} application{applications.length === 1 ? "" : "s"}
            </div>
          </div>

          {isLoading ? (
            <TableSkeleton />
          ) : applications.length === 0 ? (
            <EmptyApplications />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px]">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40">
                    <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Candidate
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Job
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Applied
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Resume
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Feedback
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {applications.map((app) => {
                    const isRejected = (app.status || "Applied") === "Rejected"
                    const candidateLabel = app.candidate_name || app.candidate_email || "Candidate"

                    return (
                      <tr key={app.application_id} className="align-top transition hover:bg-slate-950/35">
                        <td className="px-8 py-6">
                          <div className="max-w-[220px]">
                            <p className="text-lg font-semibold text-white">{candidateLabel}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {app.candidate_email || "No email available"}
                            </p>
                          </div>
                        </td>

                        <td className="px-8 py-6">
                          <div className="max-w-[220px]">
                            <p className="text-base font-medium text-slate-200">{app.job_title || "—"}</p>
                          </div>
                        </td>

                        <td className="px-8 py-6 text-sm text-slate-400">
                          {app.applied_at
                            ? new Date(app.applied_at).toLocaleDateString(undefined, { dateStyle: "medium" })
                            : "—"}
                        </td>

                        <td className="px-8 py-6">
                          {app.resume_file_path ? (
                            <a
                              href={`${backendBaseUrl}/${String(app.resume_file_path || "").replace(/^\//, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                            >
                              View resume
                            </a>
                          ) : (
                            <span className="text-sm text-slate-500">No resume</span>
                          )}
                        </td>

                        <td className="px-8 py-6">
                          <textarea
                            value={app.rejection_feedback || ""}
                            onChange={(e) => {
                              const value = e.target.value
                              setApplications((prev) =>
                                prev.map((item) =>
                                  item.application_id === app.application_id
                                    ? { ...item, rejection_feedback: value }
                                    : item
                                )
                              )
                            }}
                            onBlur={(e) => {
                              if (isRejected) {
                                updateApplication(app.application_id, {
                                  status: app.status || "Rejected",
                                  rejectionFeedback: e.target.value || ""
                                })
                              }
                            }}
                            placeholder={
                              isRejected
                                ? "Add candidate feedback"
                                : "Feedback activates when status is Rejected"
                            }
                            className="min-h-[92px] w-full min-w-[280px] rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/15"
                          />
                        </td>

                        <td className="px-8 py-6">
                          <div className="space-y-3">
                            <StatusTag status={app.status || "Applied"} />
                            <select
                              value={app.status || "Applied"}
                              onChange={(e) => {
                                const status = e.target.value
                                const currentFeedback = app.rejection_feedback || ""
                                setApplications((prev) =>
                                  prev.map((item) =>
                                    item.application_id === app.application_id
                                      ? { ...item, status }
                                      : item
                                  )
                                )
                                updateApplication(app.application_id, {
                                  status,
                                  rejectionFeedback: status === "Rejected" ? currentFeedback : ""
                                })
                              }}
                              className="w-[150px] rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm font-medium text-slate-200 focus:border-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/15"
                            >
                              <option value="Applied">Applied</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}

function MetricCard({ title, value, detail, icon }) {
  return (
    <div className="rounded-[28px] border border-slate-800 bg-slate-950/70 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-white">{value}</p>
          <p className="mt-3 text-sm leading-6 text-slate-500">{detail}</p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-cyan-200">
          {icon}
        </div>
      </div>
    </div>
  )
}

function QuickRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/75 px-4 py-4">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  )
}

function StatusTag({ status }) {
  const normalized = status.toLowerCase()
  const classes =
    normalized === "shortlisted"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
      : normalized === "rejected"
        ? "border-rose-400/20 bg-rose-400/10 text-rose-200"
        : "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${classes}`}>
      {status}
    </span>
  )
}

function TableSkeleton() {
  return (
    <div className="px-8 py-12 text-center text-slate-400">
      Loading applications...
    </div>
  )
}

function EmptyApplications() {
  return (
    <div className="px-8 py-14 text-center">
      <p className="text-lg font-semibold text-white">No applications yet</p>
      <p className="mt-3 text-sm text-slate-400">
        As candidates start applying, this review table will populate with resumes, statuses, and recruiter feedback fields.
      </p>
    </div>
  )
}

function IconBriefcase() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function IconFile() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4" />
    </svg>
  )
}
