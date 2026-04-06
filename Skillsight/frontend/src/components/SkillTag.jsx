export default function SkillTag({ children, matched = true, className = '' }) {
  const base = 'inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium transition-colors duration-150'
  const styles = matched
    ? 'bg-emerald-100/80 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
    : 'bg-red-100/80 dark:bg-red-500/15 text-red-700 dark:text-red-300'
  return (
    <span className={`${base} ${styles} ${className}`}>
      {children}
    </span>
  )
}
