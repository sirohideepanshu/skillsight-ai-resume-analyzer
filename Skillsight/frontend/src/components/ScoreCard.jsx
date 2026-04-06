import { useState, useEffect } from 'react'

const RADIUS = 45
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function getScoreColor(score) {
  if (score >= 75) return { stroke: 'text-emerald-500 dark:text-emerald-400', bg: 'text-emerald-100 dark:text-emerald-900/30' }
  if (score >= 50) return { stroke: 'text-amber-500 dark:text-amber-400', bg: 'text-amber-100 dark:text-amber-900/30' }
  return { stroke: 'text-red-500 dark:text-red-400', bg: 'text-red-100 dark:text-red-900/30' }
}

export default function ScoreCard({ score = 0, size = 120, className = '' }) {
  const [displayScore, setDisplayScore] = useState(0)
  const clampedScore = Math.min(100, Math.max(0, score))
  const colors = getScoreColor(clampedScore)

  useEffect(() => {
    const id = requestAnimationFrame(() => setDisplayScore(clampedScore))
    return () => cancelAnimationFrame(id)
  }, [clampedScore])

  const strokeDashoffset = CIRCUMFERENCE * (1 - displayScore / 100)

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        className="absolute inset-0 w-full h-full -rotate-90"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
      >
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className={`${colors.bg} transition-colors duration-300`}
        />
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          className={`${colors.stroke} transition-all duration-700 ease-out`}
          style={{
            transformOrigin: '50% 50%',
          }}
        />
      </svg>
      <span
        className={`relative font-bold tabular-nums text-slate-900 dark:text-white ${
          size >= 80 ? 'text-2xl' : 'text-base'
        }`}
      >
        {Math.round(displayScore)}
        <span className={`font-medium text-slate-500 dark:text-slate-400 ${size >= 80 ? 'text-lg' : 'text-sm'}`}>%</span>
      </span>
    </div>
  )
}
