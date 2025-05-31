export interface TrackEffects {
  reverb: {
    enabled: boolean
    wet: number
    decay: number
  }
  delay: {
    enabled: boolean
    time: number
    feedback: number
  }
  eq: {
    enabled: boolean
    low: number
    mid: number
    high: number
  }
  distortion: {
    enabled: boolean
    amount: number
  }
  [key: string]: any
}

export interface Track {
  id: string
  name: string
  buffer: ArrayBuffer | null
  volume: number
  effects: TrackEffects
}
