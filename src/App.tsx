import { useTimer } from './hooks/useTimer'
import { TimerCircle } from './components/TimerCircle'
import { Controls } from './components/Controls'
import { BellRipple, triggerBellRipple } from './components/BellRipple'
import './App.css'

export default function App() {
  const timer = useTimer(triggerBellRipple)

  return (
    <div className="app">
      <BellRipple />
      <div className="content">
        <h1 className="title">Vipassana</h1>
        <TimerCircle
          remaining={timer.remaining}
          total={timer.total}
          status={timer.status}
        />
        <Controls
          status={timer.status}
          onStart={timer.start}
          onPause={timer.pause}
          onResume={timer.resume}
          onStop={timer.stop}
        />
      </div>
    </div>
  )
}
