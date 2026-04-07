import { useMemo, useState } from "react"
import DashboardLayout from "../layouts/DashboardLayout"
import API from "../services/api"
import { getAuthToken } from "../utils/authSession"

function parseSkillWeights(input) {
  if (!input || typeof input !== "string") return {}
  const out = {}
  const parts = input.split(",").map((segment) => segment.trim()).filter(Boolean)

  for (const part of parts) {
    const match = part.match(/^(.+?)\s*:\s*(\d+(?:\.\d+)?)\s*%?$/)
    if (match) {
      const skill = match[1].trim()
      const weight = Math.min(100, Math.max(0, Number(match[2])))
      if (skill) out[skill] = weight
    }
  }

  return out
}

function parseSkills(input) {
  if (!input || typeof input !== "string") return []
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

export default function CreateJob() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [skills, setSkills] = useState("")
  const [applyBefore, setApplyBefore] = useState("")
  const [skillWeightage, setSkillWeightage] = useState("")
  const [minMatchScore, setMinMatchScore] = useState("75")
  const [minExperienceYears, setMinExperienceYears] = useState("0")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const parsedSkills = useMemo(() => parseSkills(skills), [skills])
  const parsedWeights = useMemo(() => parseSkillWeights(skillWeightage), [skillWeightage])

  const submitJob = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!title.trim() || !description.trim()) {
      setError("Job title and description are required.")
      return
    }

    try {
      setSubmitting(true)
      const token = getAuthToken()

      const finalDescription = [
        description.trim(),
        parsedSkills.length > 0 ? `Required skills: ${parsedSkills.join(", ")}` : ""
      ]
        .filter(Boolean)
        .join("\n\n")

      const payload = {
        title: title.trim(),
        description: finalDescription,
        min_match_score: Number(minMatchScore || 75),
        min_experience_years: Number(minExperienceYears || 0)
      }

      if (Object.keys(parsedWeights).length > 0) {
        payload.skill_weights = parsedWeights
      }

      await API.post("/jobs", payload)

      setSuccess("Job created successfully.")
      setTitle("")
      setDescription("")
      setSkills("")
      setApplyBefore("")
      setSkillWeightage("")
      setMinMatchScore("75")
      setMinExperienceYears("0")
    } catch (err) {
      console.error(err)
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "Job creation failed"
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout pageTitle="Create Job">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
        <section className="rounded-[32px] border border-slate-800 bg-slate-900/65 p-6 shadow-[0_30px_120px_-70px_rgba(34,211,238,0.7)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Job setup</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-4xl">
            Define the role clearly and let ranking do the rest.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Add the role, required skills, and only the weights that genuinely matter.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <InfoMetric value={parsedSkills.length} label="Skills listed" />
            <InfoMetric value={Object.keys(parsedWeights).length} label="Weighted skills" />
            <InfoMetric value={`${minMatchScore || 75}%`} label="Shortlist threshold" />
            <InfoMetric value={`${minExperienceYears || 0} yrs`} label="Minimum experience" />
          </div>
        </section>

        <aside className="rounded-[32px] border border-slate-800 bg-slate-900/65 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">What improves ranking</p>
          <div className="mt-5 space-y-4">
            <AdviceCard
              title="Clear role description"
              body="Better role context improves extraction quality."
            />
            <AdviceCard
              title="Specific skill list"
              body="List the stack explicitly so the role stays grounded."
            />
            <AdviceCard title="Weighted priorities" body="Use weights only for real decision drivers." />
          </div>
        </aside>

        <section className="xl:col-span-2 rounded-[32px] border border-slate-800 bg-slate-900/65 p-6 sm:p-8">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
            <form onSubmit={submitJob} className="space-y-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Role details</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">Create a new job</h3>
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-4 text-sm text-rose-200">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 text-sm text-emerald-200">
                  {success}
                </div>
              )}

              <Field label="Job title" required>
                <input
                  placeholder="e.g. Senior Web Developer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClasses}
                />
              </Field>

              <Field label="Job description" required>
                <textarea
                  placeholder="Describe the role, responsibilities, team context, and what strong candidates should already know..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={7}
                  className={`${inputClasses} min-h-[180px] resize-y`}
                />
              </Field>

              <Field label="Required skills / technologies">
                <input
                  placeholder="e.g. React, Node.js, Docker"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className={inputClasses}
                />
              </Field>

              <Field label="Skill weightage % (per skill)">
                <input
                  type="text"
                  placeholder="e.g. React: 60, Node: 30, Docker: 10"
                  value={skillWeightage}
                  onChange={(e) => setSkillWeightage(e.target.value)}
                  className={inputClasses}
                />
              </Field>

              <Field label="Minimum match score to shortlist">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  placeholder="75"
                  value={minMatchScore}
                  onChange={(e) => setMinMatchScore(e.target.value)}
                  className={inputClasses}
                />
                <p className="mt-2 text-sm text-slate-500">
                  Candidates below this score are auto-rejected. Candidates meeting or exceeding it are auto-shortlisted.
                </p>
              </Field>

              <Field label="Minimum experience required">
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="1"
                  placeholder="0"
                  value={minExperienceYears}
                  onChange={(e) => setMinExperienceYears(e.target.value)}
                  className={inputClasses}
                />
                <p className="mt-2 text-sm text-slate-500">
                  Candidates below this experience level are auto-rejected, even if their skill score is high.
                </p>
              </Field>

              <Field label="Apply before date">
                <input
                  type="date"
                  value={applyBefore}
                  onChange={(e) => setApplyBefore(e.target.value)}
                  className={inputClasses}
                />
              </Field>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-w-[200px] items-center justify-center rounded-2xl bg-cyan-400 px-6 py-4 text-base font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Creating..." : "Create job"}
              </button>
            </form>

            <aside className="rounded-[28px] border border-slate-800 bg-slate-950/75 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Live preview</p>
              <h4 className="mt-4 text-xl font-semibold text-white">
                {title.trim() || "Your job title will appear here"}
              </h4>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                {description.trim() || "Your role description preview will update as you type."}
              </p>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Required skills</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {parsedSkills.length > 0 ? (
                    parsedSkills.map((skill) => <Chip key={skill} label={skill} />)
                  ) : (
                    <p className="text-sm text-slate-500">No skills listed yet</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Shortlist threshold</p>
                <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                  <span className="text-sm font-semibold text-white">{minMatchScore || 75}%</span>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Minimum experience</p>
                <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                  <span className="text-sm font-semibold text-white">{minExperienceYears || 0} year(s)</span>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Weighted priorities</p>
                <div className="mt-3 space-y-3">
                  {Object.entries(parsedWeights).length > 0 ? (
                    Object.entries(parsedWeights).map(([skill, weight]) => (
                      <div
                        key={skill}
                        className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3"
                      >
                        <span className="text-sm text-slate-300">{skill}</span>
                        <span className="text-sm font-semibold text-white">{weight}%</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No weightage added yet</p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

function Field({ label, required = false, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-300">
        {label}
        {required ? <span className="ml-1 text-rose-400">*</span> : null}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  )
}

function AdviceCard({ title, body }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-7 text-slate-400">{body}</p>
    </div>
  )
}

function InfoMetric({ value, label }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
      <p className="text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{label}</p>
    </div>
  )
}

function Chip({ label }) {
  return (
    <span className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-200">
      {label}
    </span>
  )
}

const inputClasses =
  "w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3.5 text-base text-white placeholder:text-slate-500 focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/15"
