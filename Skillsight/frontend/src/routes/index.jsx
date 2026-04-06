import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Landing from '../pages/Landing.jsx'
import Login from '../pages/Login.jsx'
import Register from '../pages/Register.jsx'
import Dashboard from '../pages/Dashboard.jsx'

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/dashboard', element: <Dashboard /> },

    // { path: "/", element: <Dashboard /> },
    // { path: "/landing" , element: <landing/>},
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
