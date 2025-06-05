"use client"

import { useState, useEffect, useRef } from "react"
import TrackList from "@/features/audio/components/TrackList"
import TransportControls from "@/features/audio/components/TransportControls"
import { useAudioContext } from "@/features/audio/context/AudioContext"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX, Volume1, VibrateOffIcon as VolumeOff, Settings2Icon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import { useIsMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"

interface CircularSliderProps {
  value: number
  onChange: (value: number) => void
  size?: number
  strokeWidth?: number
  label: string
  unit?: string
  icon?: React.ReactNode
}

export default function Workspace() {
  const { masterVolume, setMasterVolume, isPlaying, selectedTrackId, tracks, updateTrackVolume, updateTrackEffects, tempo, setTempo } =
    useAudioContext()
  const [isMuted, setIsMuted] = useState(false)
  const [previousVolume, setPreviousVolume] = useState(1)
  const isMobile = useIsMobile()
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(true)

  console.log('Workspace render: isMobile =', isMobile, ', isMenuCollapsed =', isMenuCollapsed);

  const toggleMenu = () => {
    setIsMenuCollapsed(!isMenuCollapsed)
  }

  const handleMuteToggle = () => {
    if (isMuted) {
      setMasterVolume(previousVolume)
      setIsMuted(false)
    } else {
      setPreviousVolume(masterVolume)
      setMasterVolume(0)
      setIsMuted(true)
    }
  }

  const CircularSlider = ({ value, onChange, size = 40, strokeWidth = 4, label, unit = "%", icon = null }: CircularSliderProps) => {
    const [isDragging, setIsDragging] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [isTouching, setIsTouching] = useState(false)
    const [lastValue, setLastValue] = useState(value)
    const sliderRef = useRef<HTMLDivElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)

    const radius = (size - strokeWidth * 2) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (value / 100) * circumference

    // Create subtle click sound for feedback
    const playClickSound = () => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(() => {}) // Ignore autoplay restrictions
      }
    }

    const getAngleFromEvent = (event: MouseEvent | TouchEvent, rect: DOMRect) => {
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Handle both mouse and touch events
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY

      // Calculate angle from center to cursor/touch point
      const deltaX = clientX - centerX
      const deltaY = clientY - centerY

      // Convert to angle (0 to 2π), starting from top (12 o'clock position)
      let angle = Math.atan2(deltaX, -deltaY)
      if (angle < 0) angle += 2 * Math.PI

      // Convert angle to percentage (0-100)
      const percentage = (angle / (2 * Math.PI)) * 100

      return Math.max(0, Math.min(100, percentage))
    }

    const handleStart = (event: React.MouseEvent | React.TouchEvent) => {
      event.preventDefault()
      setIsDragging(true)
      setIsTouching('touches' in event)

      if (sliderRef.current) {
        const rect = sliderRef.current.getBoundingClientRect()
        const newValue = getAngleFromEvent(event.nativeEvent, rect)
        onChange(newValue)
        setLastValue(newValue)

        // Haptic and audio feedback
        if (navigator.vibrate && 'touches' in event) {
          navigator.vibrate(15)
        }
        playClickSound()
      }
    }

    const handleMove = (event: MouseEvent | TouchEvent) => {
      if (!isDragging || !sliderRef.current) return
      event.preventDefault()

      const rect = sliderRef.current.getBoundingClientRect()
      const newValue = getAngleFromEvent(event, rect)

      // Immediate responsive updates during drag
      onChange(newValue)
      setLastValue(newValue)

      // Throttled haptic feedback during drag
      if (navigator.vibrate && isTouching && Math.random() < 0.15) {
        navigator.vibrate(8)
      }
    }

    const handleEnd = () => {
      setIsDragging(false)
      setIsTouching(false)

      // Final haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(20)
      }
    }

    const handleTapToJump = (event: React.MouseEvent | React.TouchEvent) => {
      if (isDragging || !sliderRef.current) return
      event.preventDefault()

      const rect = sliderRef.current.getBoundingClientRect()
      const newValue = getAngleFromEvent(event.nativeEvent, rect)
      onChange(newValue)
      setLastValue(newValue)

      // Feedback for tap-to-jump
      if (navigator.vibrate) {
        navigator.vibrate(25)
      }
      playClickSound()
    }

    const handleWheel = (event: React.WheelEvent) => {
      if (!isHovered) return
      event.preventDefault()

      const delta = event.deltaY > 0 ? -2 : 2
      const newValue = Math.max(0, Math.min(100, value + delta))
      onChange(newValue)

      if (navigator.vibrate) {
        navigator.vibrate(5)
      }
    }

    // Add global event listeners when dragging
    useEffect(() => {
      if (isDragging) {
        const handleMouseMove = (e: MouseEvent) => handleMove(e)
        const handleMouseUp = () => handleEnd()
        const handleTouchMove = (e: TouchEvent) => handleMove(e)
        const handleTouchEnd = () => handleEnd()

        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("mouseup", handleMouseUp)
        document.addEventListener("touchmove", handleTouchMove, { passive: false })
        document.addEventListener("touchend", handleTouchEnd)

        return () => {
          document.removeEventListener("mousemove", handleMouseMove)
          document.removeEventListener("mouseup", handleMouseUp)
          document.removeEventListener("touchmove", handleTouchMove)
          document.removeEventListener("touchend", handleTouchEnd)
        }
      }
    }, [isDragging])

    // Calculate knob position with improved precision
    // Remove these lines:

    // Dynamic icon based on value (for volume controls)
    const getDynamicIcon = () => {
      if (label.toLowerCase().includes("volume")) {
        if (value === 0) return <VolumeOff className="h-3 w-3" />
        if (value < 30) return <Volume1 className="h-3 w-3" />
        if (value < 70) return <Volume2 className="h-3 w-3" />
        return <Volume2 className="h-3 w-3" />
      }
      return icon
    }

    // Get theme-aware colors
    const getThemeColors = () => {
      const isDark = document.documentElement.classList.contains("dark")
      return {
        track: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
        trackHover: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
        shadow: isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)",
        glow: "hsl(var(--primary)/0.4)",
      }
    }

    const colors = getThemeColors()

    return (
      <motion.div
        className="flex flex-col items-center gap-1"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Hidden audio element for click feedback */}
        <audio ref={audioRef} preload="auto" style={{ display: "none" }}>
          <source
            src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT"
            type="audio/wav"
          />
        </audio>

        <div
          ref={sliderRef}
          className="relative cursor-pointer select-none touch-none"
          style={{
            width: size,
            height: size,
            filter: `drop-shadow(0 2px 8px ${colors.shadow})`,
          }}
          onMouseDown={handleStart}
          onTouchStart={handleStart}
          onClick={handleTapToJump}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onWheel={handleWheel}
        >
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Outer glow effect */}
            <defs>
              <filter id={`glow-${label.replace(/\s+/g, "")}`}>
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <linearGradient id={`gradient-${label.replace(/\s+/g, "")}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="50%" stopColor="hsl(var(--primary)/0.9)" />
                <stop offset="100%" stopColor="hsl(var(--primary)/0.7)" />
              </linearGradient>

              {/* Knob gradient */}
            </defs>

            {/* Background track with subtle shadow */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius + 1}
              stroke={colors.shadow}
              strokeWidth="1"
              fill="none"
              opacity="0.3"
            />

            {/* Main background track */}
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.track}
              strokeWidth={strokeWidth}
              fill="none"
              animate={{
                stroke: isHovered ? colors.trackHover : colors.track,
                strokeWidth: isHovered ? strokeWidth + 0.5 : strokeWidth,
              }}
              transition={{ duration: 0.2 }}
            />

            {/* Progress track with neon glow */}
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={`url(#gradient-${label.replace(/\s+/g, "")})`}
              strokeWidth={strokeWidth + 1}
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              filter={isDragging ? `url(#glow-${label.replace(/\s+/g, "")})` : "none"}
              animate={{
                strokeDashoffset: strokeDashoffset,
                strokeWidth: isDragging ? strokeWidth + 2 : strokeWidth + 1,
              }}
              transition={{
                strokeDashoffset: {
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 0.8,
                },
                strokeWidth: { duration: 0.2 },
              }}
              style={{
                filter: isDragging ? `drop-shadow(0 0 8px ${colors.glow})` : "none",
              }}
            />

            {/* Knob with 3D effect */}
          </svg>

          {/* Center content with pulsing animation */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            animate={{
              scale: isDragging ? 1.1 : 1,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {getDynamicIcon() && (
              <motion.div
                animate={{
                  scale: isDragging ? 1.3 : value > lastValue ? 1.2 : 1,
                  rotate: isDragging ? 5 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  scale: { duration: 0.3 },
                }}
              >
                {getDynamicIcon()}
              </motion.div>
            )}
            <motion.span
              className="text-xs font-medium"
              animate={{
                color: isDragging ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                scale: isDragging ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {Math.round(value)}
              {unit}
            </motion.span>
          </motion.div>

          {/* Outer glow ring when active */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  boxShadow: `0 0 20px hsl(var(--primary)/0.6), 0 0 40px hsl(var(--primary)/0.3)`,
                  border: `1px solid hsl(var(--primary)/0.3)`,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>

          {/* Pulse effect on value change */}
          <AnimatePresence>
            {value !== lastValue && (
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none border-2"
                style={{
                  borderColor: "hsl(var(--primary)/0.6)",
                }}
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.3, opacity: 0 }}
                exit={{ scale: 1, opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Label with enhanced styling */}
        <motion.span
          className="text-xs text-muted-foreground text-center font-medium"
          animate={{
            color: isDragging ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
            scale: isDragging ? 1.05 : 1,
          }}
          transition={{ duration: 0.2 }}
          style={{
            textShadow: isDragging ? "0 0 8px hsl(var(--primary)/0.5)" : "none",
          }}
        >
          {label}
        </motion.span>
      </motion.div>
    )
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
      {/* Main content area */}
      <div className={cn("flex-1 flex flex-col gap-4 min-h-0 p-4", isMobile && !isMenuCollapsed ? "pb-56" : "pb-24")}>
        <div className="flex-1 overflow-auto">
          <TrackList />
        </div>
      </div>

      {/* Controls panel */} 
      {isMobile ? (
        /* Mobile fixed bottom menu */
        <div className={
          cn(
            'fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-2 transition-transform duration-300 ease-in-out z-50 flex flex-col',
            isMenuCollapsed ? 'translate-y-[calc(100%-64px)]' : 'translate-y-0' // Use a fixed pixel value for collapsed height
          )
        }>
          {/* Transport controls - always visible part */}
          <div className="flex items-center justify-between h-16 w-full">
            <TransportControls />
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="ml-2 text-primary">
              {isMenuCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          
          {/* Collapsible menu content (Master Settings) */}
          <AnimatePresence>
            {!isMenuCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="mt-4 space-y-4 pb-4 overflow-y-auto"
              >
                {/* Tempo Control */}
                <div className="flex items-center gap-4">
                  <div className="text-sm font-semibold w-16 text-center">
                    <div className="text-xs text-muted-foreground mb-1">TEMPO</div>
                    <div className="text-lg">{tempo}</div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <Slider
                      value={[tempo]}
                      min={40}
                      max={240}
                      step={1}
                      onValueChange={(value) => setTempo(value[0])}
                      className="w-full"
                    />

                    {/* Tempo Markers */}
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>40</span>
                      <span>120</span>
                      <span>240</span>
                    </div>
                  </div>

                  <div className="text-sm font-medium w-16 text-center">
                    <div className="text-xs text-muted-foreground">BPM</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Desktop fixed bottom menu */
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-2 z-50 flex items-center justify-between px-6">
          <TransportControls />
          {/* Tempo Control */}
          <div className="flex items-center gap-4 w-64">
            <div className="text-sm font-semibold w-16 text-center">
              <div className="text-xs text-muted-foreground mb-1">TEMPO</div>
              <div className="text-lg">{tempo}</div>
            </div>

            <div className="flex-1 space-y-2">
              {/* Need to read tempo state and setTempo function from context in Workspace.tsx */}
              {/* For now, placeholder or pass from context */}
              <Slider
                value={[tempo]}
                min={40}
                max={240}
                step={1}
                onValueChange={(value) => setTempo(value[0])}
                className="w-full"
              />

              {/* Tempo Markers */}
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>40</span>
                <span>120</span>
                <span>240</span>
              </div>
            </div>

            <div className="text-sm font-medium w-16 text-center">
              <div className="text-xs text-muted-foreground">BPM</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
