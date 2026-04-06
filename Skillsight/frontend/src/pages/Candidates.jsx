import DashboardLayout from '../layouts/DashboardLayout.jsx'

export default function Candidates() {
  return (
    <DashboardLayout pageTitle="Candidates">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-8">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Candidates</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Browse and manage candidates.</p>
      </div>
    </DashboardLayout>
  )
}
