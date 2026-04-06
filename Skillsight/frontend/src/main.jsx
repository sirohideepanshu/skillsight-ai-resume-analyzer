import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider, getInitialTheme } from './ThemeContext.jsx'

document.documentElement.classList.toggle(
  'dark',
  getInitialTheme() === 'dark'
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
