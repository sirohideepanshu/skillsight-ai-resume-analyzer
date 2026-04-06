import { Link } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import CandidateTable from '../components/CandidateTable.jsx'
import ScoreCard from '../components/ScoreCard.jsx'
import { useEffect, useState } from "react"
import API from "../services/api"
import { getAuthToken } from '../utils/authSession'

const RECENT_APPLICATIONS = [
  { id: 1, name: 'Sarah Chen', role: 'Senior Frontend Developer', status: 'Shortlisted', date: '2 hours ago' },
  { id: 2, name: 'Marcus Johnson', role: 'Product Manager', status: 'Under Review', date: '5 hours ago' },
  { id: 3, name: 'Elena Rodriguez', role: 'UX Designer', status: 'New', date: '1 day ago' },
  { id: 4, name: 'David Kim', role: 'Backend Engineer', status: 'Shortlisted', date: '1 day ago' },
  { id: 5, name: 'Priya Sharma', role: 'Data Analyst', status: 'Rejected', date: '2 days ago' },
  { id: 6, name: 'John', role: 'SDE', status: 'Under Review', date: '12 hours ago' },
]

const STATUS_STYLES = {
  New: 'bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300',
  'Under Review': 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300',
  Shortlisted: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  Rejected: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300',
}

export default function Dashboard() {

  // ✅ NEW STATE FOR DASHBOARD STATS
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    shortlistedCandidates: 0,
    averageScore: 0
  })

  // ✅ FETCH DATA FROM BACKEND
  useEffect(() => {

    const fetchStats = async () => {
      try {

        const token = getAuthToken()

        const res = await API.get("/dashboard/stats", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = res.data

        setStats(data)

      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      }
    }

    fetchStats()

  }, [])

  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className="space-y-10">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Recruiter Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            Welcome back. Here's what's happening with your hiring pipeline.
          </p>
        </div>

        {/* Summary Cards + ScoreCard */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">

          {/* TOTAL JOBS */}
          <SummaryCard
            title="Total Jobs"
            value={stats.totalJobs}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />

          {/* TOTAL APPLICATIONS */}
          <SummaryCard
            title="Total Applications"
            value={stats.totalApplications}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />

          {/* SHORTLISTED */}
          <SummaryCard
            title="Shortlisted Candidates"
            value={stats.shortlistedCandidates}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            }
          />

          {/* AVG SCORE */}
          <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/30 p-6 flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
              Avg Match Score
            </p>

            {/* ✅ USE BACKEND SCORE */}
            <ScoreCard score={stats.averageScore} size={100} />

          </div>
        </div>

        {/* Tables Grid */}
        <div className="space-y-8">

          {/* Recent Applications Table */}
          <section>
            <div className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 overflow-hidden">

              <div className="px-6 py-5 border-b">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Recent Applications
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Latest candidates across all open positions
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase">
                        Candidate
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase">
                        Applied
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {RECENT_APPLICATIONS.map((app) => (
                      <tr key={app.id}>
                        <td className="px-6 py-4">{app.name}</td>
                        <td className="px-6 py-4">{app.role}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${STATUS_STYLES[app.status]}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">{app.date}</td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>

            </div>
          </section>

          {/* Candidate Ranking Table */}
          <section>

            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Candidate Rankings
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Ranked by AI match score.
              </p>
            </div>

            <CandidateTable />

          </section>

        </div>

        <Link to="/" className="text-sm font-medium">
          ← Back to Landing
        </Link>

      </div>
    </DashboardLayout>
  )
}

function SummaryCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>
      </div>
    </div>
  )
}
