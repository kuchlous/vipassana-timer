import { useState, useCallback, useEffect, useRef } from 'react'

export function BellRipple() {
  const [ripples, setRipples] = useState<number[]>([])
  const nextId = useRef(0)

  const trigger = useCallback(() => {
    const id = nextId.current++
    setRipples(prev => [...prev, id])
  }, [])

  // Expose trigger via DOM event
  useEffect(() => {
    const handler = () => trigger()
    window.addEventListener('bell-ring', handler)
    return () => window.removeEventListener('bell-ring', handler)
  }, [trigger])

  // Remove ripple after animation
  useEffect(() => {
    if (ripples.length === 0) return
    const timer = setTimeout(() => {
      setRipples(prev => prev.slice(1))
    }, 1500)
    return () => clearTimeout(timer)
  }, [ripples])

  return (
    <div className="bell-ripple-container">
      {ripples.map(id => (
        <div key={id} className="bell-ripple" />
      ))}
    </div>
  )
}

export function triggerBellRipple() {
  window.dispatchEvent(new Event('bell-ring'))
}
