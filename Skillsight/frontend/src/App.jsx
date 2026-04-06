import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Jobs from './pages/Jobs.jsx'
import CreateJob from './pages/CreateJob.jsx'
import Candidates from './pages/Candidates.jsx'
import CandidateRanking from './pages/CandidateRanking.jsx'
import ResumeUpload from './pages/ResumeUpload.jsx'
import Settings from './pages/Settings.jsx'
import RecruiterDashboard from './pages/RecruiterDashboard.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import { getAuthToken } from './utils/authSession'

function ProtectedRoute({ children }) {
  const token = getAuthToken()
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    path: '/dashboard',
    element: (
      // <ProtectedRoute>
        <Dashboard />
      /* </ProtectedRoute> */
    ),
  },
  { path: '/dashboard/jobs', element: <Jobs /> },
  { path: '/dashboard/jobs/create', element: <CreateJob /> },
  // { path: '/dashboard/candidates', element: <Candidates /> },
  { path: '/dashboard/candidates/ranking', element: <CandidateRanking /> },
  { path: '/dashboard/settings', element: <Settings /> },
  { path: '/dashboard/student/settings', element: <Settings /> },
  { path: '/dashboard/upload', element: <ResumeUpload /> },
  {
    path: '/dashboard/recruiter',
    element: (
      <ProtectedRoute>
        <RecruiterDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/student',
    element: (
      <ProtectedRoute>
        <StudentDashboard />
      </ProtectedRoute>
    ),
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
