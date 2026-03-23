export const COLORS = {
  bg: '#1a1a2e',
  accent: '#d4a574',
  accentDim: 'rgba(212, 165, 116, 0.3)',
  text: '#e8e0d4',
  textDim: 'rgba(232, 224, 212, 0.5)',
  surface: 'rgba(255, 255, 255, 0.05)',
} as const

export interface Preset {
  label: string
  duration: number // seconds
  reminder: number // seconds
}

export const PRESETS: Preset[] = [
  { label: '20 min', duration: 20 * 60, reminder: 5 * 60 },
  { label: '30 min', duration: 30 * 60, reminder: 5 * 60 },
]

export const DURATION_OPTIONS = Array.from({ length: 12 }, (_, i) => (i + 1) * 5) // 5–60 min
export const INTERVAL_OPTIONS = Array.from({ length: 15 }, (_, i) => i + 1)        // 1–15 min
