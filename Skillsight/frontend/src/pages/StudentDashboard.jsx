import { useEffect, useMemo, useRef, useState } from "react"
import DashboardLayout from "../layouts/DashboardLayout.jsx"
import API from "../services/api"
import { getAuthToken, getSessionItem } from "../utils/authSession"

const backendBaseUrl = API.defaults.baseURL?.replace(/\/api\/?$/, "") || ""

const CAREER_PATHS = {
  "Frontend Developer": {
    points: [
      "High demand in startups and product companies.",
      "Build modern user interfaces and websites.",
      "Great freelancing opportunities.",
      "Creative role combining design and coding."
    ],
    theory: "https://developer.mozilla.org/en-US/docs/Learn",
    youtube: "https://www.youtube.com/results?search_query=frontend+developer+roadmap"
  },
  "Backend Developer": {
    points: [
      "Build scalable server side systems.",
      "Work with databases and APIs.",
      "High salary engineering roles.",
      "Strong software architecture skills."
    ],
    theory: "https://nodejs.org/en/docs",
    youtube: "https://www.youtube.com/results?search_query=backend+developer+roadmap"
  },
  "Full Stack Developer": {
    points: [
      "Build complete applications.",
      "Great for startups and freelancers.",
      "Understand full system architecture.",
      "Build your own products."
    ],
    theory: "https://www.freecodecamp.org/news/full-stack-developer-roadmap/",
    youtube: "https://www.youtube.com/results?search_query=full+stack+developer+roadmap"
  },
  "Data Scientist": {
    points: [
      "Analyze data to generate insights.",
      "Used in finance, healthcare and tech.",
      "High demand AI career.",
      "Work with machine learning."
    ],
    theory: "https://pandas.pydata.org/docs/",
    youtube: "https://www.youtube.com/results?search_query=data+science+roadmap"
  },
  "AI Engineer": {
    points: [
      "Build intelligent systems.",
      "Work with neural networks.",
      "Future focused career.",
      "Used in automation and robotics."
    ],
    theory: "https://scikit-learn.org/stable/",
    youtube: "https://www.youtube.com/results?search_query=ai+engineer+roadmap"
  },
  "DevOps Engineer": {
    points: [
      "Automate software deployments.",
      "Work with CI/CD pipelines.",
      "Improve development productivity.",
      "Manage infrastructure."
    ],
    theory: "https://www.atlassian.com/devops",
    youtube: "https://www.youtube.com/results?search_query=devops+roadmap"
  },
  "Cloud Engineer": {
    points: [
      "Work with AWS, Azure, Google Cloud.",
      "Build scalable cloud infrastructure.",
      "Very high demand globally.",
      "Work on distributed systems."
    ],
    theory: "https://aws.amazon.com/getting-started/",
    youtube: "https://www.youtube.com/results?search_query=cloud+engineer+roadmap"
  },
  "Cybersecurity Engineer": {
    points: [
      "Protect systems from hackers.",
      "Work in banks, government and tech.",
      "Growing demand worldwide.",
      "Work with ethical hacking."
    ],
    theory: "https://owasp.org/",
    youtube: "https://www.youtube.com/results?search_query=cybersecurity+roadmap"
  }
}

function truncate(str, maxLen) {
  if (!str || typeof str !== "string") return ""
  return str.length <= maxLen ? str : `${str.slice(0, maxLen).trim()}…`
}

function formatSkillWeights(sw) {
  if (!sw || typeof sw !== "object") return ""
  const parts = []

  for (const [key, value] of Object.entries(sw)) {
    if (key === "weightage_percent" || key === "skills") continue
    if (typeof value === "number") parts.push(`${key}: ${value}%`)
  }

  return parts.join(" · ")
}

function openResumeUrl(resumeUrl) {
  if (!resumeUrl) return
  const finalUrl = /^https?:\/\//i.test(resumeUrl) ? resumeUrl : `${backendBaseUrl}${resumeUrl}`
  window.open(finalUrl, "_blank")
}

export default function StudentDashboard() {
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [resume, setResume] = useState(null)
  const [file, setFile] = useState(null)
  const [career, setCareer] = useState("")
  const [uploading, setUploading] = useState(false)
  const [notice, setNotice] = useState(null)
  const fileInputRef = useRef(null)

  const userName = getSessionItem("userName") || "Student"
  const token = getAuthToken()
  const appliedJobIds = useMemo(() => new Set(applications.map((a) => a.job_id)), [applications])

  useEffect(() => {
    loadJobs()
    loadResume()
    loadMyApplications()
  }, [])

  const loadJobs = async () => {
    try {
      const res = await API.get("/jobs")
      setJobs(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.log(err)
    }
  }

  const loadMyApplications = async () => {
    try {
      const res = await API.get("/applications", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setApplications(res.data || [])
    } catch (err) {
      console.log("No applications yet")
    }
  }

  const loadResume = async () => {
    try {
      const res = await API.get("/resumes/my-resume", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setResume(res.data)
    } catch (err) {
      console.log("No resume yet")
    }
  }

  const uploadResume = async () => {
    if (!file) {
      setNotice({ type: "error", text: "Select a resume file before uploading." })
      return
    }

    try {
      setUploading(true)
      setNotice(null)
      const formData = new FormData()
      formData.append("resume", file)

      const res = await API.post("/resumes/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (res.data?.analysis_error) {
        setNotice({
          type: "error",
          text: `${res.data.message}. ${res.data.analysis_error}`
        })
      } else if (Array.isArray(res.data?.analysis_errors) && res.data.analysis_errors.length > 0) {
        setNotice({
          type: "error",
          text: `${res.data.message}. ${res.data.analysis_errors[0].error}`
        })
      } else {
        setNotice({ type: "success", text: res.data?.message || "Resume uploaded successfully." })
      }

      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      loadResume()
      loadMyApplications()
    } catch (err) {
      setNotice({
        type: "error",
        text: err.response?.data?.error || "Resume upload failed. Try again."
      })
    } finally {
      setUploading(false)
    }
  }

  const applyJob = async (jobId) => {
    try {
      const res = await API.post(
        "/applications",
        { job_id: jobId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data?.analysis_error || res.data?.analysis_warning) {
        setNotice({
          type: "error",
          text: `${res.data?.message || "Application submitted."} ${
            res.data?.analysis_error || res.data?.analysis_warning
          }`
        })
      } else {
        setNotice({ type: "success", text: res.data?.message || "Application submitted." })
      }

      loadMyApplications()
    } catch (err) {
      setNotice({
        type: "error",
        text:
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Application failed."
      })
    }
  }

  const selectedCareer = career ? CAREER_PATHS[career] : null
  const shortlistedCount = applications.filter((app) => (app.status || "").toLowerCase() === "shortlisted").length
  const recentApplications = applications.slice(0, 4)
  const recentJobs = jobs.slice(0, 4)

  return (
    <DashboardLayout pageTitle="AI Career Dashboard">
      <div className="space-y-6">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_340px]">
          <div className="rounded-[32px] border border-slate-800 bg-slate-900/65 p-6 shadow-[0_30px_120px_-70px_rgba(34,211,238,0.55)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Progress overview</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              {userName}, see your next move clearly.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-400">
              Track your resume readiness, applications, and open roles from one focused dashboard.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <StatCard value={resume ? "Ready" : "Missing"} label="Resume" />
              <StatCard value={applications.length} label="Applications" />
              <StatCard value={shortlistedCount} label="Shortlisted" />
            </div>

            {notice && (
              <div
                className={`mt-6 rounded-2xl border px-4 py-4 text-sm ${
                  notice.type === "success"
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                    : "border-rose-400/20 bg-rose-400/10 text-rose-200"
                }`}
              >
                {notice.text}
              </div>
            )}
          </div>

          <div className="rounded-[32px] border border-slate-800 bg-slate-900/65 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Current status</p>
            <div className="mt-6 space-y-3">
              <InfoRow label="Resume" value={resume ? "Ready for recruiters" : "Upload needed"} />
              <InfoRow label="Applications" value={applications.length > 0 ? `${applications.length} submitted` : "None yet"} />
              <InfoRow label="Focus" value={selectedCareer ? career : "Apply to matching roles"} />
            </div>

            <div className="mt-5 rounded-3xl border border-slate-800 bg-slate-950/75 p-5">
              <p className="text-sm font-semibold text-white">Next step</p>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                {resume
                  ? "Apply to one strong-fit role and keep your learning path aligned with your target position."
                  : "Upload your resume first so recruiters can review you when you apply."}
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <section id="applications" className="rounded-[32px] border border-slate-800 bg-slate-900/65 p-6 sm:p-8">
            <SectionHeader
              eyebrow="Applications"
              title="Check your progress"
              description="Your recent applications and their current status."
            />

            <div className="mt-8 space-y-4">
              {recentApplications.length === 0 ? (
                <EmptyState
                  title="No applications yet"
                  description="Apply to roles below and your progress will appear here."
                />
              ) : (
                recentApplications.map((app) => {
                  const status = (app.status || "Applied").toLowerCase()
                  const isShortlisted = status === "shortlisted"
                  const isRejected = status === "rejected"

                  return (
                    <article
                      key={app.application_id}
                      className="rounded-[28px] border border-slate-800 bg-slate-950/75 p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{app.title}</h3>
                          <p className="mt-2 text-sm text-slate-500">
                            Applied{" "}
                            {app.applied_at
                              ? new Date(app.applied_at).toLocaleDateString(undefined, { dateStyle: "medium" })
                              : "—"}
                          </p>
                        </div>
                        <StatusPill status={app.status || "Applied"} />
                      </div>

                      {app.description && (
                        <p className="mt-4 text-sm leading-7 text-slate-400">
                          {truncate(app.description, 130)}
                        </p>
                      )}

                      {isShortlisted && (
                        <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                          Shortlisted. Watch for recruiter follow-up.
                        </div>
                      )}

                      {isRejected && (
                        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-4">
                          <p className="text-sm font-medium text-rose-200">Application not selected.</p>
                          <p className="mt-2 text-sm leading-7 text-slate-300">
                            Feedback: {app.rejection_feedback || "No recruiter feedback yet."}
                          </p>
                        </div>
                      )}

                      {Array.isArray(app.analysis_notes) && app.analysis_notes.length > 0 && (
                        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-4">
                          <p className="text-sm font-medium text-cyan-200">AI feedback</p>
                          <div className="mt-3 space-y-2">
                            {app.analysis_notes.map((note, index) => (
                              <p key={`${app.application_id}-note-${index}`} className="text-sm leading-7 text-slate-300">
                                {note}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </article>
                  )
                })
              )}
            </div>
          </section>

          <section id="resume" className="rounded-[32px] border border-slate-800 bg-slate-900/65 p-6 sm:p-8">
            <SectionHeader
              eyebrow="Resume"
              title="Keep it ready"
              description="Use one current PDF for all applications."
            />

            {resume ? (
              <div className="mt-8 space-y-4">
                <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                  <p className="text-sm font-semibold text-emerald-200">Resume on file</p>
                  <p className="mt-2 text-sm leading-7 text-emerald-100/80">
                    Recruiters can view it when you apply.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openResumeUrl(resume.file_url || resume.file_path)}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  View resume
                </button>

                <label className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/75 px-5 py-3.5 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white">
                  Choose replacement
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>

                {file && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/75 px-4 py-4 text-sm text-slate-300">
                    {file.name}
                  </div>
                )}

                <button
                  onClick={uploadResume}
                  disabled={!file || uploading}
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Replace resume"}
                </button>
              </div>
            ) : (
              <div className="mt-8 space-y-4">
                <div className="rounded-3xl border border-slate-800 bg-slate-950/75 p-5">
                  <p className="text-sm font-semibold text-white">No resume uploaded</p>
                  <p className="mt-2 text-sm leading-7 text-slate-400">
                    Add your latest PDF before applying.
                  </p>
                </div>

                <label className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3.5 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white">
                  Choose PDF
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={uploadResume}
                  disabled={!file || uploading}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? "Uploading..." : "Upload resume"}
                </button>
              </div>
            )}
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section id="jobs" className="rounded-[32px] border border-slate-800 bg-slate-900/65 p-6 sm:p-8">
            <SectionHeader
              eyebrow="Open roles"
              title="Roles to review"
              description="A short, focused list of current opportunities."
            />

            <div className="mt-8 space-y-4">
              {recentJobs.length === 0 ? (
                <EmptyState
                  title="No jobs available"
                  description="Check back soon for new roles."
                />
              ) : (
                recentJobs.map((job) => {
                  const applied = appliedJobIds.has(job.id)
                  const skillWeightText = formatSkillWeights(job.skill_weights)

                  return (
                    <article
                      key={job.id}
                      className="rounded-[24px] border border-slate-800 bg-slate-950/75 p-5 transition hover:border-slate-700"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{job.title}</h3>
                          <p className="mt-3 text-sm leading-7 text-slate-400">
                            {truncate(job.description, 95)}
                          </p>
                        </div>
                        <StatusPill status={applied ? "Applied" : "Open"} />
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        {skillWeightText ? <InfoChip label={skillWeightText} /> : null}
                        {!applied ? (
                          <button
                            onClick={() => applyJob(job.id)}
                            className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                          >
                            Apply now
                          </button>
                        ) : (
                          <span className="text-sm text-slate-500">Already applied</span>
                        )}
                      </div>
                    </article>
                  )
                })
              )}
            </div>
          </section>

          <section id="learning" className="rounded-[32px] border border-slate-800 bg-slate-900/65 p-6 sm:p-8">
            <SectionHeader
              eyebrow="Learning"
              title="Choose a focus area"
              description="Keep this short and actionable."
            />

            <div className="mt-8 rounded-[28px] border border-slate-800 bg-slate-950/75 p-5">
              <label
                htmlFor="career-path"
                className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Career path
              </label>
              <select
                id="career-path"
                value={career}
                onChange={(e) => setCareer(e.target.value)}
                className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-sm text-white focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
              >
                <option value="">Select a path</option>
                {Object.keys(CAREER_PATHS).map((path) => (
                  <option key={path} value={path}>
                    {path}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5">
              {selectedCareer ? (
                <div className="rounded-[28px] border border-slate-800 bg-slate-950/75 p-5">
                  <h3 className="text-xl font-semibold text-white">{career}</h3>
                  <div className="mt-5 grid gap-3">
                    {selectedCareer.points.slice(0, 3).map((point) => (
                      <div
                        key={point}
                        className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm leading-7 text-slate-300"
                      >
                        {point}
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <ResourceLink href={selectedCareer.theory} label="Theory" />
                    <ResourceLink href={selectedCareer.youtube} label="YouTube" />
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No learning path selected"
                  description="Pick one area to get focused resources."
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}

function SectionHeader({ eyebrow, title, description }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">{description}</p>
    </div>
  )
}

function StatCard({ value, label }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
      <p className="text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{label}</p>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/75 px-4 py-4">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  )
}

function StatusPill({ status }) {
  const normalized = status.toLowerCase()
  const classes =
    normalized === "applied" || normalized === "open"
      ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
      : normalized === "shortlisted"
        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
        : normalized === "rejected"
          ? "border-rose-400/20 bg-rose-400/10 text-rose-200"
          : "border-slate-700 bg-slate-900 text-slate-300"

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${classes}`}>
      {status}
    </span>
  )
}

function InfoChip({ label }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-400">
      {label}
    </span>
  )
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-800 bg-slate-950/70 px-6 py-10 text-center">
      <p className="text-base font-semibold text-white">{title}</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-400">{description}</p>
    </div>
  )
}

function ResourceLink({ href, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/30 hover:text-white"
    >
      {label}
    </a>
  )
}
