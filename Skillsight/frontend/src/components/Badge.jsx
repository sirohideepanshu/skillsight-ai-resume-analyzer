export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400',
    applied: 'bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300',
    shortlisted: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    rejected: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300',
  }
  const base = 'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150'
  return (
    <span className={`${base} ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  )
}
