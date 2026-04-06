export default function ImprovementSuggestions({ missingSkills = [], suggestions = [], className = '' }) {
  const hasContent = missingSkills.length > 0 || suggestions.length > 0

  if (!hasContent) return null

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-red-50/30 dark:bg-red-950/20 p-6 ${className}`}
    >
      {missingSkills.length > 0 && (
        <div className="mb-5">
          <h3 className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Skills to develop
          </h3>
          <div className="flex flex-wrap gap-2">
            {missingSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-lg bg-red-100/80 dark:bg-red-500/10 px-2.5 py-1 text-sm text-red-700 dark:text-red-400"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Suggested improvements
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Focus on these areas to strengthen your profile.
          </p>
          <ul className="space-y-2">
            {suggestions.map((s, i) => (
              <li key={i} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                • {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
