import { useState, useRef, useCallback, useEffect } from 'react'
import { playBell, playStartBells, playEndBells, vibrate } from '../audio'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'complete'

interface TimerState {
  status: TimerStatus
  remaining: number
  total: number
  reminderInterval: number
}

interface TimerActions {
  start: (duration: number, reminder: number) => void
  pause: () => void
  resume: () => void
  stop: () => void
}

export function useTimer(onBell?: () => void): TimerState & TimerActions {
  const [status, setStatus] = useState<TimerStatus>('idle')
  const [remaining, setRemaining] = useState(0)
  const [total, setTotal] = useState(0)
  const [reminderInterval, setReminderInterval] = useState(0)

  const intervalRef = useRef<number | null>(null)
  const remainingRef = useRef(0)
  const totalRef = useRef(0)
  const reminderRef = useRef(0)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
      }
    } catch {
      // Wake Lock not available or denied
    }
  }, [])

  const releaseWakeLock = useCallback(() => {
    wakeLockRef.current?.release()
    wakeLockRef.current = null
  }, [])

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const tick = useCallback(() => {
    remainingRef.current -= 1
    const r = remainingRef.current

    setRemaining(r)

    if (r <= 0) {
      clearTimer()
      setStatus('complete')
      playEndBells()
      vibrate()
      onBell?.()
      releaseWakeLock()
      return
    }

    // Check reminder: elapsed time is a multiple of reminder interval
    const elapsed = totalRef.current - r
    if (reminderRef.current > 0 && elapsed > 0 && elapsed % reminderRef.current === 0) {
      playBell('reminder')
      vibrate()
      onBell?.()
    }
  }, [clearTimer, onBell, releaseWakeLock])

  const start = useCallback(
    (duration: number, reminder: number) => {
      clearTimer()
      totalRef.current = duration
      remainingRef.current = duration
      reminderRef.current = reminder
      setTotal(duration)
      setRemaining(duration)
      setReminderInterval(reminder)
      setStatus('running')

      playStartBells()
      vibrate()
      onBell?.()
      requestWakeLock()

      intervalRef.current = window.setInterval(tick, 1000)
    },
    [clearTimer, tick, onBell, requestWakeLock],
  )

  const pause = useCallback(() => {
    clearTimer()
    setStatus('paused')
  }, [clearTimer])

  const resume = useCallback(() => {
    setStatus('running')
    requestWakeLock()
    intervalRef.current = window.setInterval(tick, 1000)
  }, [tick, requestWakeLock])

  const stop = useCallback(() => {
    clearTimer()
    setStatus('idle')
    setRemaining(0)
    setTotal(0)
    remainingRef.current = 0
    releaseWakeLock()
  }, [clearTimer, releaseWakeLock])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer()
      releaseWakeLock()
    }
  }, [clearTimer, releaseWakeLock])

  return { status, remaining, total, reminderInterval, start, pause, resume, stop }
}
