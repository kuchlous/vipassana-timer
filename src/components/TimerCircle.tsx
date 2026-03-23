import type { TimerStatus } from '../hooks/useTimer'

interface Props {
  remaining: number
  total: number
  status: TimerStatus
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function TimerCircle({ remaining, total, status }: Props) {
  const size = 280
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = total > 0 ? remaining / total : 1
  const offset = circumference * (1 - progress)

  const isActive = status === 'running'

  return (
    <div className={`timer-circle ${isActive ? 'breathing' : ''}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(212, 165, 116, 0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#d4a574"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="progress-ring"
        />
      </svg>
      <div className="timer-display">
        <span className="timer-time">
          {status === 'idle' ? '--:--' : formatTime(remaining)}
        </span>
        {status === 'complete' && <span className="timer-label">Complete</span>}
        {status === 'paused' && <span className="timer-label">Paused</span>}
      </div>
    </div>
  )
}
