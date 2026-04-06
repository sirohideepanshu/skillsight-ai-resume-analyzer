import { useState, useMemo } from 'react'
import Badge from './Badge.jsx'
import SkillTag from './SkillTag.jsx'
import ScoreCard from './ScoreCard.jsx'

const DUMMY_CANDIDATES = [
  {
    id: 1,
    name: 'Sarah Chen',
    matchScore: 94,
    matchedSkills: ['React', 'TypeScript', 'Node.js'],
    missingSkills: ['GraphQL'],
    status: 'Shortlisted',
  },
  {
    id: 2,
    name: 'Marcus Johnson',
    matchScore: 87,
    matchedSkills: ['Product Strategy', 'Agile'],
    missingSkills: ['SQL', 'Data Analysis'],
    status: 'Applied',
  },
  {
    id: 3,
    name: 'Elena Rodriguez',
    matchScore: 91,
    matchedSkills: ['Figma', 'User Research', 'Prototyping'],
    missingSkills: [],
    status: 'Shortlisted',
  },
  {
    id: 4,
    name: 'David Kim',
    matchScore: 78,
    matchedSkills: ['Python', 'AWS'],
    missingSkills: ['Kubernetes', 'Docker'],
    status: 'Applied',
  },
  {
    id: 5,
    name: 'Priya Sharma',
    matchScore: 65,
    matchedSkills: ['Excel', 'SQL'],
    missingSkills: ['Python', 'Tableau', 'Power BI'],
    status: 'Rejected',
  },
]

const STATUS_VARIANT = {
  Applied: 'applied',
  Shortlisted: 'shortlisted',
  Rejected: 'rejected',
}

export default function CandidateTable() {
  const [sortOrder, setSortOrder] = useState('desc')

  const sortedCandidates = useMemo(() => {
    const order = sortOrder === 'asc' ? 1 : -1
    return [...DUMMY_CANDIDATES].sort((a, b) => (a.matchScore - b.matchScore) * order)
  }, [sortOrder])

  const toggleSort = () => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 shadow-sm dark:shadow-none overflow-hidden transition-all duration-200 hover:shadow-md dark:hover:bg-slate-900/90">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-800/40">
              <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Candidate Name
              </th>
              <th className="px-6 py-5 text-left">
                <button
                  onClick={toggleSort}
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-150"
                >
                  Match Score
                  <span className="text-slate-400 dark:text-slate-500" aria-hidden>
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                </button>
              </th>
              <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Matched Skills
              </th>
              <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Missing Skills
              </th>
              <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
            {sortedCandidates.map((candidate) => (
              <tr
                key={candidate.id}
                className="group bg-white dark:bg-slate-900/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors duration-150"
              >
                <td className="px-6 py-5">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {candidate.name}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <ScoreCard score={candidate.matchScore} size={64} />
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-2">
                    {candidate.matchedSkills.length > 0 ? (
                      candidate.matchedSkills.map((skill) => (
                        <SkillTag key={skill} matched>
                          {skill}
                        </SkillTag>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400 dark:text-slate-500">—</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-2">
                    {candidate.missingSkills.length > 0 ? (
                      candidate.missingSkills.map((skill) => (
                        <SkillTag key={skill} matched={false}>
                          {skill}
                        </SkillTag>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400 dark:text-slate-500">—</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <Badge variant={STATUS_VARIANT[candidate.status]}>
                    {candidate.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
