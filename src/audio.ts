let ctx: AudioContext | null = null
let unlocked = false

function getContext(): AudioContext {
  if (!ctx) {
    const Ctor: typeof AudioContext =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new Ctor()

    // iOS 16.4+: route audio to the "playback" category so the chimes are
    // audible even when the phone's ring/silent switch is set to silent —
    // otherwise Web Audio is muted by the hardware switch.
    const audioSession = (navigator as unknown as { audioSession?: { type: string } }).audioSession
    if (audioSession) {
      try {
        audioSession.type = 'playback'
      } catch {
        // Category not settable; ignore.
      }
    }
  }
  if (ctx.state === 'suspended') {
    ctx.resume()
  }
  return ctx
}

/**
 * Unlock the AudioContext on iOS by playing a silent buffer inside the
 * user gesture. Without this, the first real sound can be dropped because
 * resume() is async and the context is still suspended when it fires.
 */
function unlock(audioCtx: AudioContext): void {
  if (unlocked) return
  const buffer = audioCtx.createBuffer(1, 1, audioCtx.sampleRate)
  const source = audioCtx.createBufferSource()
  source.buffer = buffer
  source.connect(audioCtx.destination)
  source.start(0)
  unlocked = true
}

/**
 * Synthesize a singing bowl strike.
 * Uses a cluster of sine waves with exponential decay.
 */
function createBowlStrike(
  audioCtx: AudioContext,
  frequency: number,
  duration: number,
  volume: number,
): AudioBufferSourceNode {
  const sampleRate = audioCtx.sampleRate
  const length = sampleRate * duration
  const buffer = audioCtx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)

  // Harmonics that make it sound like a singing bowl
  const harmonics = [
    { freq: frequency, amp: 1.0, decay: 2.0 },
    { freq: frequency * 2.76, amp: 0.4, decay: 3.0 },
    { freq: frequency * 5.4, amp: 0.15, decay: 4.5 },
    { freq: frequency * 8.93, amp: 0.06, decay: 6.0 },
  ]

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate
    let sample = 0
    for (const h of harmonics) {
      sample += h.amp * Math.sin(2 * Math.PI * h.freq * t) * Math.exp(-t * h.decay)
    }
    // Soft attack
    const attack = Math.min(1, t * 50)
    data[i] = sample * volume * attack
  }

  const source = audioCtx.createBufferSource()
  source.buffer = buffer
  return source
}

export type BellType = 'start' | 'reminder' | 'end'

const BELL_PARAMS: Record<BellType, { freq: number; duration: number; volume: number }> = {
  start: { freq: 220, duration: 4, volume: 0.5 },
  reminder: { freq: 280, duration: 3, volume: 0.3 },
  end: { freq: 220, duration: 5, volume: 0.5 },
}

export function playBell(type: BellType): void {
  const audioCtx = getContext()
  const params = BELL_PARAMS[type]
  const source = createBowlStrike(audioCtx, params.freq, params.duration, params.volume)
  source.connect(audioCtx.destination)
  source.start()
}

export function playStartBells(): void {
  // Three bells staggered
  playBell('start')
  setTimeout(() => playBell('start'), 2000)
  setTimeout(() => playBell('start'), 4000)
}

export function playEndBells(): void {
  // Three bells staggered
  playBell('end')
  setTimeout(() => playBell('end'), 2000)
  setTimeout(() => playBell('end'), 4000)
}

export function vibrate(): void {
  if (navigator.vibrate) {
    navigator.vibrate(200)
  }
}

export function initAudio(): void {
  // Create, resume, and unlock the AudioContext on a user gesture. Must run
  // synchronously inside the tap handler for iOS Safari to allow later playback.
  unlock(getContext())
}
