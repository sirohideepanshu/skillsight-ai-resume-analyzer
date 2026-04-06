import { useEffect, useMemo, useState } from "react"
import DashboardLayout from "../layouts/DashboardLayout.jsx"
import API from "../services/api"
import { getAuthToken } from "../utils/authSession"

function computeRanking(rawCandidates) {
  const sorted = [...rawCandidates].sort((a, b) => {
    const sa = a.finalScore != null ? a.finalScore : -1
    const sb = b.finalScore != null ? b.finalScore : -1
    if (sb !== sa) return sb - sa
    if ((b.skillMatchScore ?? -1) !== (a.skillMatchScore ?? -1)) {
      return (b.skillMatchScore ?? -1) - (a.skillMatchScore ?? -1)
    }
    return (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0)
  })

  const enhanced = sorted.map((candidate) => ({ ...candidate, isExactMatch: false }))

  for (let i = 0; i < enhanced.length - 1; i += 1) {
    const a = enhanced[i]
    const b = enhanced[i + 1]
    const isPerfectTie =
      a.finalScore === 100 &&
      b.finalScore === 100

    if (
      isPerfectTie &&
      a.finalScore === b.finalScore &&
      a.skillMatchScore === b.skillMatchScore &&
      a.yearsOfExperience === b.yearsOfExperience
    ) {
      enhanced[i].isExactMatch = true
      enhanced[i + 1].isExactMatch = true
    }
  }

  return {
    sortedCandidates: enhanced,
    hasExactMatches: enhanced.filter((candidate) => candidate.isExactMatch).length >= 2
  }
}

function parseList(value) {
  if (Array.isArray(value)) return value
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

export default function CandidateRanking() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const token = getAuthToken()
        const res = await API.get("/dashboard/ranking-candidates", {
          headers: { Authorization: `Bearer ${token}` }
        })

        const list = Array.isArray(res.data) ? res.data : []
        const mapped = list.map((candidate) => ({
          id: candidate.application_id,
          name: candidate.candidate_name || candidate.candidate_email || "Candidate",
          finalScore: candidate.score != null ? Number(candidate.score) : null,
          skillMatchScore: candidate.score != null ? Number(candidate.score) : null,
          yearsOfExperience: candidate.experience_years != null ? Number(candidate.experience_years) : 0,
          matchedSkills: parseList(candidate.matched_skills),
          missingSkills: parseList(candidate.missing_skills),
          suggestions: parseList(candidate.suggestions),
          status: candidate.status || "Applied",
          rejectionFeedback: candidate.rejection_feedback || "",
          resumePath: candidate.resume_file_path || "",
          jobTitle: candidate.job_title || "",
          minimumExperienceYears:
            candidate.min_experience_years != null ? Number(candidate.min_experience_years) : 0
        }))

        setCandidates(mapped)
      } catch (err) {
        console.error("Error loading candidates:", err)
        setCandidates([])
      } finally {
        setLoading(false)
      }
    }

    fetchCandidates()
  }, [])

  const { sortedCandidates, hasExactMatches } = useMemo(
    () => computeRanking(candidates),
    [candidates]
  )

  const selected = sortedCandidates.find((candidate) => candidate.id === selectedId) || sortedCandidates[0]
  const rankedCount = sortedCandidates.filter((candidate) => candidate.finalScore != null).length

  const updateSelectedCandidate = async (candidateId, payload, optimisticUpdate) => {
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === candidateId
          ? { ...candidate, ...optimisticUpdate }
          : candidate
      )
    )

    try {
      await API.patch(
        `/applications/${candidateId}`,
        payload,
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      )
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <DashboardLayout pageTitle="Candidate Rankings">
      <div className="space-y-6">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
          <div className="rounded-[32px] border border-slate-800 bg-slate-900/65 p-6 shadow-[0_30px_120px_-70px_rgba(34,211,238,0.7)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Ranking snapshot</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-4xl">
              Compare candidates quickly and keep the shortlist defensible.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Scores, gaps, and status updates stay in one surface.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <MetricCard value={sortedCandidates.length} label="Candidates in ranking" />
              <MetricCard value={rankedCount} label="Candidates with scores" />
              <MetricCard value={hasExactMatches ? "Yes" : "No"} label="Manual tie review needed" />
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-800 bg-slate-900/65 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Recruiter note</p>
            <div className="mt-6 rounded-[28px] border border-slate-800 bg-slate-950/75 p-5">
              <p className="text-sm leading-7 text-slate-400">
                Shortlist from the table first. Add feedback only when the final decision is rejection.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="rounded-[32px] border border-slate-800 bg-slate-900/65 overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 px-6 py-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Ranking table</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">Candidate comparison</h3>
              </div>
            </div>

            {loading ? (
              <div className="px-6 py-12 text-center text-slate-400">Loading candidates...</div>
            ) : sortedCandidates.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <p className="text-lg font-semibold text-white">No candidates yet</p>
                <p className="mt-3 text-sm text-slate-400">
                  Candidate rankings will appear here once applications and analysis data are available.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px]">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/40">
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">#</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Candidate</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Match score</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Matched skills</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Missing skills</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Experience</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Status</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-800">
                      {sortedCandidates.map((candidate, index) => (
                        <tr
                          key={candidate.id}
                          onClick={() => setSelectedId(candidate.id)}
                          className={`cursor-pointer transition ${
                            selected?.id === candidate.id
                              ? "bg-cyan-400/8"
                              : candidate.isExactMatch
                                ? "bg-emerald-400/6 hover:bg-emerald-400/10"
                                : "hover:bg-slate-950/35"
                          }`}
                        >
                          <td className="px-6 py-5 text-sm text-slate-400">{index + 1}</td>
                          <td className="px-6 py-5">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-base font-semibold text-white">{candidate.name}</p>
                                {candidate.isExactMatch && (
                                  <span className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                                    Equally qualified
                                  </span>
                                )}
                              </div>
                              {candidate.jobTitle && (
                                <p className="mt-1 text-sm text-slate-500">{candidate.jobTitle}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <ScorePill score={candidate.finalScore} />
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-2">
                              {candidate.matchedSkills.length > 0 ? (
                                candidate.matchedSkills.map((skill) => (
                                  <SkillPill key={skill} tone="matched" label={skill} />
                                ))
                              ) : (
                                <span className="text-sm text-slate-500">None yet</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-2">
                              {candidate.missingSkills.length > 0 ? (
                                candidate.missingSkills.map((skill) => (
                                  <SkillPill key={skill} tone="missing" label={skill} />
                                ))
                              ) : (
                                <span className="text-sm text-slate-500">No visible gaps</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm text-slate-300">
                            {candidate.yearsOfExperience != null ? `${candidate.yearsOfExperience} yrs` : "—"}
                          </td>
                          <td className="px-6 py-5">
                            <StatusTag status={candidate.status || "Applied"} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {hasExactMatches && (
                  <div className="border-t border-emerald-400/20 bg-emerald-400/8 px-6 py-4 text-sm text-emerald-200">
                    Two or more candidates are identically ranked. Final score, skill match, and experience are the same. Manual review is recommended.
                  </div>
                )}
              </>
            )}
          </section>

          <aside className="rounded-[32px] border border-slate-800 bg-slate-900/65 p-6">
            {selected ? (
              <>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Candidate detail</p>
                <div className="mt-6 text-center">
                  <h3 className="text-3xl font-semibold text-white">{selected.name}</h3>
                  {selected.jobTitle ? (
                    <p className="mt-2 text-lg text-slate-400">{selected.jobTitle}</p>
                  ) : null}
                </div>

                <div className="mt-8 space-y-4">
                  <DetailRow
                    label="Match score"
                    value={selected.finalScore != null ? `${selected.finalScore}%` : "Pending analysis"}
                  />
                  <DetailRow
                    label="Required experience"
                    value={`${selected.minimumExperienceYears || 0} yrs`}
                  />
                  <DetailRow
                    label="Experience"
                    value={selected.yearsOfExperience != null ? `${selected.yearsOfExperience} yrs` : "—"}
                  />
                  <DetailRow label="Status" value={selected.status || "Applied"} />
                </div>

                {selected.resumePath ? (
                  <a
                    href={`http://localhost:5050/${selected.resumePath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    View resume
                  </a>
                ) : null}

                <div className="mt-8">
                  <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Update status
                  </label>
                  <select
                    value={selected.status || "Applied"}
                    onChange={(e) => {
                      const newStatus = e.target.value
                      updateSelectedCandidate(
                        selected.id,
                        {
                          status: newStatus,
                          rejectionFeedback: newStatus === "Rejected" ? (selected.rejectionFeedback || "") : ""
                        },
                        { status: newStatus }
                      )
                    }}
                    className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/15"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="mt-6">
                  <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Rejection feedback
                  </label>
                  <textarea
                    value={selected.rejectionFeedback || ""}
                    onChange={(e) => {
                      const value = e.target.value
                      setCandidates((prev) =>
                        prev.map((candidate) =>
                          candidate.id === selected.id
                            ? { ...candidate, rejectionFeedback: value }
                            : candidate
                        )
                      )
                    }}
                    onBlur={() => {
                      if ((selected.status || "Applied") !== "Rejected") return
                      updateSelectedCandidate(
                        selected.id,
                        {
                          status: selected.status || "Rejected",
                          rejectionFeedback: selected.rejectionFeedback || ""
                        },
                        { rejectionFeedback: selected.rejectionFeedback || "" }
                      )
                    }}
                    placeholder="Add recruiter feedback once the decision is final"
                    className="mt-3 min-h-[140px] w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/15"
                  />
                </div>

                <div className="mt-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Recruiter notes</p>
                  <div className="mt-3 space-y-3">
                    {selected.suggestions?.length > 0 ? (
                      selected.suggestions.map((suggestion, index) => (
                        <div
                          key={`${selected.id}-suggestion-${index}`}
                          className="rounded-2xl border border-slate-800 bg-slate-950/75 px-4 py-4 text-sm leading-7 text-slate-300"
                        >
                          {suggestion}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No recruiter notes returned yet</p>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Matched skills</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selected.matchedSkills.length > 0 ? (
                      selected.matchedSkills.map((skill) => (
                        <SkillPill key={skill} tone="matched" label={skill} />
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No matched skills returned yet</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Missing skills</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selected.missingSkills.length > 0 ? (
                      selected.missingSkills.map((skill) => (
                        <SkillPill key={skill} tone="missing" label={skill} />
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No missing skills returned</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="px-2 py-10 text-center">
                <p className="text-lg font-semibold text-white">No candidate selected</p>
                <p className="mt-3 text-sm text-slate-400">
                  Pick a row from the ranking table to inspect candidate details.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </DashboardLayout>
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

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/75 px-4 py-4">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  )
}

function ScorePill({ score }) {
  if (score == null) {
    return <span className="text-sm text-slate-500">Pending</span>
  }

  const classes =
    score >= 80
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
      : score >= 60
        ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
        : "border-amber-300/20 bg-amber-300/10 text-amber-100"

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold ${classes}`}>
      {score}%
    </span>
  )
}

function SkillPill({ label, tone }) {
  const classes =
    tone === "matched"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
      : "border-rose-400/20 bg-rose-400/10 text-rose-200"

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${classes}`}>
      {label}
    </span>
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
