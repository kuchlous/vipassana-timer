import { useState } from 'react'
import type { TimerStatus } from '../hooks/useTimer'
import { PRESETS, DURATION_OPTIONS, INTERVAL_OPTIONS } from '../constants'
import { initAudio } from '../audio'

interface Props {
  status: TimerStatus
  onStart: (duration: number, reminder: number) => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
}

export function Controls({ status, onStart, onPause, onResume, onStop }: Props) {
  const [customDuration, setCustomDuration] = useState(20)
  const [customInterval, setCustomInterval] = useState(5)
  const [showControls, setShowControls] = useState(false)

  const isActive = status === 'running' || status === 'paused'

  const handleStart = (duration: number, reminder: number) => {
    initAudio()
    onStart(duration, reminder)
    setShowControls(false)
  }

  // During active session, tap area reveals stop button
  if (isActive && !showControls) {
    return (
      <div className="controls controls-hidden" onClick={() => setShowControls(true)}>
        <span className="tap-hint">tap for controls</span>
      </div>
    )
  }

  if (isActive && showControls) {
    return (
      <div className="controls controls-active">
        {status === 'running' ? (
          <button className="btn btn-secondary" onClick={onPause}>
            Pause
          </button>
        ) : (
          <button className="btn btn-primary" onClick={onResume}>
            Resume
          </button>
        )}
        <button className="btn btn-stop" onClick={onStop}>
          Stop
        </button>
        <button className="btn-dismiss" onClick={() => setShowControls(false)}>
          Hide
        </button>
      </div>
    )
  }

  return (
    <div className="controls">
      {status === 'complete' && (
        <div className="complete-message">Session complete</div>
      )}

      <div className="presets">
        {PRESETS.map(p => (
          <button
            key={p.label}
            className="btn btn-preset"
            onClick={() => handleStart(p.duration, p.reminder)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="custom-section">
        <div className="picker-row">
          <label>
            <span className="picker-label">Duration</span>
            <select
              value={customDuration}
              onChange={e => setCustomDuration(Number(e.target.value))}
            >
              {DURATION_OPTIONS.map(m => (
                <option key={m} value={m}>
                  {m} min
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="picker-label">Reminder</span>
            <select
              value={customInterval}
              onChange={e => setCustomInterval(Number(e.target.value))}
            >
              {INTERVAL_OPTIONS.map(m => (
                <option key={m} value={m}>
                  {m} min
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => handleStart(customDuration * 60, customInterval * 60)}
        >
          Start
        </button>
      </div>
    </div>
  )
}
