"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { v4 as uuidv4 } from "uuid"
import type { Track, TrackEffects } from "@/features/audio/types"
import { useToast } from "@/hooks/use-toast"

interface AudioContextType {
  isPlaying: boolean
  togglePlayback: () => void
  stopPlayback: () => void
  isRecording: boolean
  startRecording: () => void
  stopRecording: () => void
  tracks: Track[]
  addTrack: () => void
  deleteTrack: (id: string) => void
  selectedTrackId: string | null
  setSelectedTrackId: (id: string) => void
  updateTrackVolume: (id: string, volume: number) => void
  updateTrackEffects: (id: string, effects: TrackEffects) => void
  masterVolume: number
  setMasterVolume: (volume: number) => void
  tempo: number
  setTempo: (tempo: number) => void
  metronomeEnabled: boolean
  toggleMetronome: () => void
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

interface AudioProviderProps {
  children: ReactNode
}

export function AudioProvider({ children }: AudioProviderProps) {
  const { toast } = useToast()
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [tracks, setTracks] = useState<Track[]>([])
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)
  const [masterVolume, setMasterVolume] = useState(1)
  const [tempo, setTempo] = useState(120)
  const [metronomeEnabled, setMetronomeEnabled] = useState(false)

  // History for undo/redo
  const [history, setHistory] = useState<Track[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Initialize Web Audio API
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        const context = new AudioContext()
        setAudioContext(context)

        // Add initial track
        addTrack()

        return () => {
          if (context && context.state !== "closed") {
            context.close()
          }
        }
      } catch (error) {
        console.error("Failed to initialize Web Audio API:", error)
        toast({
          title: "Audio Error",
          description: "Failed to initialize audio engine. Please try again.",
          variant: "destructive",
        })
      }
    }
  }, [])

  // Save state to history when tracks change
  useEffect(() => {
    if (tracks.length > 0) {
      // Only save if this is a new state (not from undo/redo)
      if (historyIndex === history.length - 1) {
        setHistory((prev) => [...prev.slice(0, historyIndex + 1), [...tracks]])
        setHistoryIndex((prev) => prev + 1)
      }
    }
  }, [tracks])

  const addTrack = useCallback(() => {
    const newTrack: Track = {
      id: uuidv4(),
      name: `Track ${tracks.length + 1}`,
      buffer: null,
      volume: 0.8,
      effects: {
        reverb: { enabled: false, wet: 0.3, decay: 1.5 },
        delay: { enabled: false, time: 0.3, feedback: 0.4 },
        eq: { enabled: false, low: 0, mid: 0, high: 0 },
        distortion: { enabled: false, amount: 0.2 },
      },
    }

    setTracks((prev) => [...prev, newTrack])
    setSelectedTrackId(newTrack.id)

    toast({
      title: "Track Added",
      description: `${newTrack.name} has been added.`,
    })
  }, [tracks.length, toast])

  const deleteTrack = useCallback(
    (id: string) => {
      setTracks((prev) => prev.filter((track) => track.id !== id))

      if (selectedTrackId === id) {
        setSelectedTrackId(null)
      }

      toast({
        title: "Track Deleted",
        description: "The track has been removed.",
      })
    },
    [selectedTrackId, toast],
  )

  const updateTrackVolume = useCallback((id: string, volume: number) => {
    setTracks((prev) => prev.map((track) => (track.id === id ? { ...track, volume } : track)))
  }, [])

  const updateTrackEffects = useCallback((id: string, effects: TrackEffects) => {
    setTracks((prev) => prev.map((track) => (track.id === id ? { ...track, effects } : track)))
  }, [])

  const togglePlayback = useCallback(() => {
    if (audioContext && audioContext.state === "suspended") {
      audioContext.resume()
    }

    setIsPlaying((prev) => !prev)

    if (!isPlaying) {
      toast({
        title: "Playback Started",
        description: "Your loops are now playing.",
      })
    }
  }, [audioContext, isPlaying, toast])

  const stopPlayback = useCallback(() => {
    setIsPlaying(false)
    setIsRecording(false)

    toast({
      title: "Playback Stopped",
      description: "All playback and recording has been stopped.",
    })
  }, [toast])

  const startRecording = useCallback(() => {
    if (!selectedTrackId) {
      toast({
        title: "No Track Selected",
        description: "Please select a track before recording.",
        variant: "destructive",
      })
      return
    }

    if (audioContext && audioContext.state === "suspended") {
      audioContext.resume()
    }

    // Request microphone access
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setIsRecording(true)
        setIsPlaying(true)

        // In a real app, we would connect the stream to the Web Audio API
        // and start recording here

        toast({
          title: "Recording Started",
          description: "Recording to the selected track.",
        })

        // Simulate recording for demo purposes
        setTimeout(() => {
          // Update the track with a simulated buffer
          setTracks((prev) =>
            prev.map((track) =>
              track.id === selectedTrackId
                ? { ...track, buffer: new ArrayBuffer(1000) } // Simulated buffer
                : track,
            ),
          )
        }, 500)
      })
      .catch((err) => {
        console.error("Error accessing microphone:", err)
        toast({
          title: "Microphone Error",
          description: "Could not access your microphone. Please check permissions.",
          variant: "destructive",
        })
      })
  }, [selectedTrackId, audioContext, toast])

  const stopRecording = useCallback(() => {
    setIsRecording(false)

    toast({
      title: "Recording Stopped",
      description: "Your recording has been added to the track.",
    })
  }, [toast])

  const toggleMetronome = useCallback(() => {
    setMetronomeEnabled((prev) => !prev)

    toast({
      title: metronomeEnabled ? "Metronome Off" : "Metronome On",
      description: metronomeEnabled ? "Metronome has been disabled." : `Metronome enabled at ${tempo} BPM.`,
    })
  }, [metronomeEnabled, tempo, toast])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setTracks(history[historyIndex - 1])

      toast({
        title: "Undo",
        description: "Previous action has been undone.",
      })
    }
  }, [history, historyIndex, toast])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setTracks(history[historyIndex + 1])

      toast({
        title: "Redo",
        description: "Action has been redone.",
      })
    }
  }, [history, historyIndex, toast])

  const value = {
    isPlaying,
    togglePlayback,
    stopPlayback,
    isRecording,
    startRecording,
    stopRecording,
    tracks,
    addTrack,
    deleteTrack,
    selectedTrackId,
    setSelectedTrackId,
    updateTrackVolume,
    updateTrackEffects,
    masterVolume,
    setMasterVolume,
    tempo,
    setTempo,
    metronomeEnabled,
    toggleMetronome,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    undo,
    redo,
  }

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}

export function useAudioContext() {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error("useAudioContext must be used within an AudioProvider")
  }
  return context
}
