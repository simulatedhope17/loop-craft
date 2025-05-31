"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Trash2, Play, Pause, VolumeX, Volume2, Settings } from "lucide-react"
import { useAudioContext } from "@/features/audio/context/AudioContext"
import type { Track as TrackType } from "@/features/audio/types"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface TrackProps {
  track: TrackType
  index: number
}

export default function Track({ track, index }: TrackProps) {
  const {
    selectedTrackId,
    setSelectedTrackId,
    deleteTrack,
    updateTrackVolume,
    updateTrackEffects,
    isRecording,
    startRecording,
    stopRecording,
    isPlaying,
    togglePlayback,
  } = useAudioContext()

  const [isExpanded, setIsExpanded] = useState(false)
  const [isTrackPlaying, setIsTrackPlaying] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState(`${index + 1}`)

  const isSelected = selectedTrackId === track.id
  const isActiveTrack = isRecording && isSelected
  const hasAudio = track.buffer !== null

  // Vibrant color palette for tracks
  const colors = [
    { primary: "#00D4FF", secondary: "#0099CC", glow: "rgba(0, 212, 255, 0.3)" }, // Cyan
    { primary: "#FF6B6B", secondary: "#CC5555", glow: "rgba(255, 107, 107, 0.3)" }, // Red
    { primary: "#4ECDC4", secondary: "#3EA39C", glow: "rgba(78, 205, 196, 0.3)" }, // Teal
    { primary: "#45B7D1", secondary: "#3692A7", glow: "rgba(69, 183, 209, 0.3)" }, // Blue
    { primary: "#96CEB4", secondary: "#78A590", glow: "rgba(150, 206, 180, 0.3)" }, // Green
    { primary: "#FFEAA7", secondary: "#CCBB85", glow: "rgba(255, 234, 167, 0.3)" }, // Yellow
    { primary: "#DDA0DD", secondary: "#B180B1", glow: "rgba(221, 160, 221, 0.3)" }, // Plum
    { primary: "#98D8C8", secondary: "#7AAD9F", glow: "rgba(152, 216, 200, 0.3)" }, // Mint
  ]

  const trackColor = colors[index % colors.length]

  const handleTrackSelect = () => {
    setSelectedTrackId(track.id)
  }

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const drawCircularWaveform = () => {
      if (!ctx || !canvas) return

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = Math.min(centerX, centerY) - 8
      const innerRadius = radius * 0.3

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw outer ring
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.strokeStyle = isSelected ? trackColor.primary : `${trackColor.primary}80`
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw inner circle
      ctx.beginPath()
      ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI)
      ctx.fillStyle = trackColor.primary
      ctx.fill()

      if (hasAudio || isActiveTrack) {
        const numPoints = 64
        const angleStep = (2 * Math.PI) / numPoints
        const time = Date.now() * 0.001

        ctx.beginPath()
        ctx.strokeStyle = trackColor.primary
        ctx.lineWidth = 2

        for (let i = 0; i < numPoints; i++) {
          const angle = i * angleStep - Math.PI / 2

          let amplitude = 0.2
          if (isActiveTrack) {
            amplitude = 0.4 + Math.sin(time * 6 + i * 0.2) * 0.3
          } else if (hasAudio && (isPlaying || isTrackPlaying)) {
            amplitude = 0.3 + Math.sin(time * 2 + i * 0.15 + index) * 0.2
          }

          const waveRadius = radius * (0.6 + amplitude * 0.4)
          const x = centerX + Math.cos(angle) * waveRadius
          const y = centerY + Math.sin(angle) * waveRadius

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }

        ctx.stroke()

        // Draw playhead
        if ((isPlaying || isTrackPlaying) && hasAudio) {
          const playheadAngle = ((Date.now() % 4000) / 4000) * 2 * Math.PI - Math.PI / 2
          const playheadRadius = radius * 0.9

          ctx.beginPath()
          ctx.moveTo(centerX, centerY)
          ctx.lineTo(
            centerX + Math.cos(playheadAngle) * playheadRadius,
            centerY + Math.sin(playheadAngle) * playheadRadius,
          )
          ctx.strokeStyle = "#FFFFFF"
          ctx.lineWidth = 2
          ctx.stroke()
        }
      }

      animationRef.current = requestAnimationFrame(drawCircularWaveform)
    }

    drawCircularWaveform()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [hasAudio, isActiveTrack, isPlaying, isTrackPlaying, isSelected, trackColor, index])

  const handleRecordToggle = () => {
    if (isActiveTrack) {
      stopRecording()
    } else {
      setSelectedTrackId(track.id)
      startRecording()
    }
  }

  const handlePlayToggle = () => {
    if (hasAudio) {
      setIsTrackPlaying(!isTrackPlaying)
      setSelectedTrackId(track.id)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    updateTrackVolume(track.id, value[0] / 100)
  }

  const handleEffectToggle = (effectName: string, enabled: boolean) => {
    updateTrackEffects(track.id, {
      ...track.effects,
      [effectName]: {
        ...track.effects[effectName as keyof typeof track.effects],
        enabled,
      },
    })
  }

  const handleEffectParamChange = (effectName: string, paramName: string, value: number) => {
    updateTrackEffects(track.id, {
      ...track.effects,
      [effectName]: {
        ...track.effects[effectName as keyof typeof track.effects],
        [paramName]: value,
      },
    })
  }

  const handleNameUpdate = (newName: string) => {
    // You'll need to add updateTrackName to your AudioContext
    // For now, we'll store it in the track object
    // updateTrackName(track.id, newName || `${index + 1}`)
    console.log(`Track ${track.id} renamed to: ${newName || index + 1}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Circular Track */}
      <motion.div
        className={cn(
          "relative w-32 h-32 cursor-pointer transition-all duration-300",
          "hover:scale-110",
          isSelected && "scale-110",
        )}
        onClick={handleTrackSelect}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 1.05 }}
        style={{
          filter: isSelected ? `drop-shadow(0 0 20px ${trackColor.glow})` : "none",
        }}
      >
        <canvas ref={canvasRef} className="w-full h-full" width={128} height={128} />

        {/* Control Buttons Overlay */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {/* Main control group with 2x3 grid (2 cols, 3 rows) */}
          <div className="bg-black/80 backdrop-blur-md border border-white/40 rounded-lg p-1.5 shadow-lg">
            <div className="grid grid-cols-2 gap-1">
              {/* Top Left - Record */}
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "h-5 w-5 rounded-md transition-all duration-300",
                  isActiveTrack && "bg-red-500/90 animate-pulse shadow-md shadow-red-500/50",
                  "hover:bg-white/20",
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  if (isActiveTrack) {
                    stopRecording()
                  } else {
                    setSelectedTrackId(track.id)
                    startRecording()
                  }
                }}
              >
                {isActiveTrack ? (
                  <div className="h-1.5 w-1.5 bg-white rounded-sm" />
                ) : (
                  <Mic className="h-2.5 w-2.5 text-white" />
                )}
              </Button>

              {/* Top Right - Play/Pause */}
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "h-5 w-5 rounded-md transition-all duration-300",
                  isTrackPlaying && hasAudio && "bg-green-500/90 shadow-md shadow-green-500/50",
                  "hover:bg-white/20",
                  !hasAudio && "opacity-50 cursor-not-allowed",
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  handlePlayToggle()
                }}
                disabled={!hasAudio}
              >
                {isTrackPlaying && hasAudio ? (
                  <Pause className="h-2.5 w-2.5 text-white" />
                ) : (
                  <Play className="h-2.5 w-2.5 text-white" />
                )}
              </Button>

              {/* Middle Left - Delete */}
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "h-5 w-5 rounded-md transition-all duration-300",
                  "hover:bg-red-500/90 shadow-md shadow-red-500/50",
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  deleteTrack(track.id)
                }}
              >
                <Trash2 className="h-2.5 w-2.5 text-white" />
              </Button>

              {/* Middle Right - Mute */}
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "h-5 w-5 rounded-md transition-all duration-300",
                  track.volume === 0 && "bg-orange-500/90 shadow-md shadow-orange-500/50",
                  "hover:bg-white/20",
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  handleVolumeChange([track.volume === 0 ? 80 : 0])
                }}
              >
                {track.volume === 0 ? (
                  <VolumeX className="h-2.5 w-2.5 text-white" />
                ) : (
                  <Volume2 className="h-2.5 w-2.5 text-white" />
                )}
              </Button>

              {/* Bottom - Settings (spans 2 columns) */}
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "h-5 w-10 col-span-2 rounded-md transition-all duration-300",
                  isSelected && "bg-blue-500/90 shadow-md shadow-blue-500/50",
                  "hover:bg-white/20",
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedTrackId(track.id)
                }}
              >
                <Settings className="h-2.5 w-2.5 text-white" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Track Number/Name - Editable */}
        <div
          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-[10px] font-bold px-1 py-0.5 rounded cursor-pointer max-w-20 truncate"
          style={{ backgroundColor: trackColor.primary, color: "#000" }}
          onClick={(e) => {
            e.stopPropagation()
            setIsEditingName(true)
            setTempName(track.name || `${index + 1}`)
          }}
        >
          {isEditingName ? (
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={() => {
                setIsEditingName(false)
                handleNameUpdate(tempName)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsEditingName(false)
                  handleNameUpdate(tempName)
                }
                if (e.key === "Escape") {
                  setIsEditingName(false)
                  setTempName(track.name || `${index + 1}`)
                }
              }}
              className="bg-transparent text-[10px] font-bold text-center outline-none w-full"
              style={{ color: "#000" }}
              autoFocus
              onFocus={(e) => e.target.select()}
            />
          ) : (
            <span className="text-[10px]">{track.name || index + 1}</span>
          )}
        </div>

        {/* Recording Indicator */}
        <AnimatePresence>
          {isActiveTrack && (
            <motion.div
              className="absolute -top-1 -right-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Audio Indicator */}
        {hasAudio && !isActiveTrack && (
          <div
            className="absolute -top-1 -right-1 h-3 w-3 rounded-full shadow-lg"
            style={{ backgroundColor: trackColor.primary }}
          />
        )}
      </motion.div>
    </motion.div>
  )
}
