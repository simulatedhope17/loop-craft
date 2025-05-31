"use client"

import { useState, useEffect, useRef } from "react"
import TrackList from "@/features/audio/components/TrackList"
import TransportControls from "@/features/audio/components/TransportControls"
import { useAudioContext } from "@/features/audio/context/AudioContext"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX, Volume1, VibrateOffIcon as VolumeOff, Settings2Icon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Switch } from "@/components/ui/switch"

export default function Workspace() {
  const { masterVolume, setMasterVolume, isPlaying, selectedTrackId, tracks, updateTrackVolume, updateTrackEffects } =
    useAudioContext()
  const [isMuted, setIsMuted] = useState(false)
  const [previousVolume, setPreviousVolume] = useState(1)

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

  const CircularSlider = ({ value, onChange, size = 40, strokeWidth = 4, label, unit = "%", icon = null }) => {
    const [isDragging, setIsDragging] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [isTouching, setIsTouching] = useState(false)
    const [lastValue, setLastValue] = useState(value)
    const sliderRef = useRef(null)
    const audioRef = useRef(null)

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

    const getAngleFromEvent = (event, rect) => {
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Handle both mouse and touch events
      const clientX = event.touches ? event.touches[0].clientX : event.clientX
      const clientY = event.touches ? event.touches[0].clientY : event.clientY

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

    const handleStart = (event) => {
      event.preventDefault()
      setIsDragging(true)
      setIsTouching(event.type.includes("touch"))

      const rect = sliderRef.current.getBoundingClientRect()
      const newValue = getAngleFromEvent(event, rect)
      onChange(newValue)
      setLastValue(newValue)

      // Haptic and audio feedback
      if (navigator.vibrate && event.type.includes("touch")) {
        navigator.vibrate(15)
      }
      playClickSound()
    }

    const handleMove = (event) => {
      if (!isDragging) return
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

    const handleTapToJump = (event) => {
      if (isDragging) return
      event.preventDefault()

      const rect = sliderRef.current.getBoundingClientRect()
      const newValue = getAngleFromEvent(event, rect)
      onChange(newValue)
      setLastValue(newValue)

      // Feedback for tap-to-jump
      if (navigator.vibrate) {
        navigator.vibrate(25)
      }
      playClickSound()
    }

    const handleWheel = (event) => {
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
        const handleMouseMove = (e) => handleMove(e)
        const handleMouseUp = () => handleEnd()
        const handleTouchMove = (e) => handleMove(e)
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
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 pointer-events-none" />

      <div className="flex-1 container py-6 flex flex-col relative z-10">
        <div className="grid grid-cols-[auto_1fr] gap-6 flex-1">
          {/* Sliding Settings Menu */}
          <motion.div
            className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 overflow-hidden"
            initial={{ opacity: 0, x: -20, width: 0 }}
            animate={{
              opacity: selectedTrackId ? 1 : 0.7,
              x: 0,
              width: selectedTrackId ? "280px" : "60px",
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="h-full flex flex-col bg-gradient-to-b from-black/40 to-black/10 backdrop-blur-md">
              {selectedTrackId ? (
                // Unified Track Settings Interface
                <div className="h-full flex flex-col overflow-hidden">
                  <div className="p-3 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <h3 className="font-semibold text-xs">
                          Track {tracks.findIndex((t) => t.id === selectedTrackId) + 1} Settings
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-4">
                    {(() => {
                      const track = tracks.find((t) => t.id === selectedTrackId)
                      if (!track) return null

                      return (
                        <>
                          {/* Volume Control */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-medium text-muted-foreground border-b border-white/5 pb-1">
                              Volume
                            </h4>
                            <CircularSlider
                              value={track.volume * 100}
                              onChange={(value) => updateTrackVolume(selectedTrackId!, value / 100)}
                              label="Track Volume"
                              size={50}
                              icon={<Volume2 className="h-4 w-4" />}
                            />
                          </div>

                          {/* Effects Section */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-medium text-muted-foreground border-b border-white/5 pb-1">
                              Effects
                            </h4>

                            {/* Reverb */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs">Reverb</span>
                                <Switch
                                  checked={track.effects.reverb.enabled}
                                  onCheckedChange={(checked) =>
                                    updateTrackEffects(selectedTrackId!, {
                                      ...track.effects,
                                      reverb: { ...track.effects.reverb, enabled: checked },
                                    })
                                  }
                                  className="scale-75"
                                />
                              </div>
                              {track.effects.reverb.enabled && (
                                <motion.div
                                  className="grid grid-cols-2 gap-2"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <CircularSlider
                                    value={track.effects.reverb.wet * 100}
                                    onChange={(value) =>
                                      updateTrackEffects(selectedTrackId!, {
                                        ...track.effects,
                                        reverb: { ...track.effects.reverb, wet: value / 100 },
                                      })
                                    }
                                    label="Wet"
                                    size={35}
                                  />
                                  <CircularSlider
                                    value={track.effects.reverb.decay * 10}
                                    onChange={(value) =>
                                      updateTrackEffects(selectedTrackId!, {
                                        ...track.effects,
                                        reverb: { ...track.effects.reverb, decay: value / 10 },
                                      })
                                    }
                                    label="Decay"
                                    unit="s"
                                    size={35}
                                  />
                                </motion.div>
                              )}
                            </div>

                            {/* Delay */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs">Delay</span>
                                <Switch
                                  checked={track.effects.delay.enabled}
                                  onCheckedChange={(checked) =>
                                    updateTrackEffects(selectedTrackId!, {
                                      ...track.effects,
                                      delay: { ...track.effects.delay, enabled: checked },
                                    })
                                  }
                                  className="scale-75"
                                />
                              </div>
                              {track.effects.delay.enabled && (
                                <motion.div
                                  className="grid grid-cols-2 gap-2"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <CircularSlider
                                    value={track.effects.delay.time * 100}
                                    onChange={(value) =>
                                      updateTrackEffects(selectedTrackId!, {
                                        ...track.effects,
                                        delay: { ...track.effects.delay, time: value / 100 },
                                      })
                                    }
                                    label="Time"
                                    unit="ms"
                                    size={35}
                                  />
                                  <CircularSlider
                                    value={track.effects.delay.feedback * 100}
                                    onChange={(value) =>
                                      updateTrackEffects(selectedTrackId!, {
                                        ...track.effects,
                                        delay: { ...track.effects.delay, feedback: value / 100 },
                                      })
                                    }
                                    label="Feedback"
                                    size={35}
                                  />
                                </motion.div>
                              )}
                            </div>

                            {/* EQ */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs">EQ</span>
                                <Switch
                                  checked={track.effects.eq.enabled}
                                  onCheckedChange={(checked) =>
                                    updateTrackEffects(selectedTrackId!, {
                                      ...track.effects,
                                      eq: { ...track.effects.eq, enabled: checked },
                                    })
                                  }
                                  className="scale-75"
                                />
                              </div>
                              {track.effects.eq.enabled && (
                                <motion.div
                                  className="grid grid-cols-3 gap-1"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <CircularSlider
                                    value={((track.effects.eq.low + 12) / 24) * 100}
                                    onChange={(value) =>
                                      updateTrackEffects(selectedTrackId!, {
                                        ...track.effects,
                                        eq: { ...track.effects.eq, low: (value / 100) * 24 - 12 },
                                      })
                                    }
                                    label="Low"
                                    unit="dB"
                                    size={30}
                                  />
                                  <CircularSlider
                                    value={((track.effects.eq.mid + 12) / 24) * 100}
                                    onChange={(value) =>
                                      updateTrackEffects(selectedTrackId!, {
                                        ...track.effects,
                                        eq: { ...track.effects.eq, mid: (value / 100) * 24 - 12 },
                                      })
                                    }
                                    label="Mid"
                                    unit="dB"
                                    size={30}
                                  />
                                  <CircularSlider
                                    value={((track.effects.eq.high + 12) / 24) * 100}
                                    onChange={(value) =>
                                      updateTrackEffects(selectedTrackId!, {
                                        ...track.effects,
                                        eq: { ...track.effects.eq, high: (value / 100) * 24 - 12 },
                                      })
                                    }
                                    label="High"
                                    unit="dB"
                                    size={30}
                                  />
                                </motion.div>
                              )}
                            </div>

                            {/* Distortion */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs">Distortion</span>
                                <Switch
                                  checked={track.effects.distortion.enabled}
                                  onCheckedChange={(checked) =>
                                    updateTrackEffects(selectedTrackId!, {
                                      ...track.effects,
                                      distortion: { ...track.effects.distortion, enabled: checked },
                                    })
                                  }
                                  className="scale-75"
                                />
                              </div>
                              {track.effects.distortion.enabled && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <CircularSlider
                                    value={track.effects.distortion.amount * 100}
                                    onChange={(value) =>
                                      updateTrackEffects(selectedTrackId!, {
                                        ...track.effects,
                                        distortion: { ...track.effects.distortion, amount: value / 100 },
                                      })
                                    }
                                    label="Amount"
                                    size={40}
                                  />
                                </motion.div>
                              )}
                            </div>
                          </div>

                          {/* Master Controls */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-medium text-muted-foreground border-b border-white/5 pb-1">
                              Master
                            </h4>
                            <div className="flex items-center justify-between">
                              <CircularSlider
                                value={masterVolume * 100}
                                onChange={(value) => setMasterVolume(value / 100)}
                                label="Master Volume"
                                size={45}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleMuteToggle}
                                className="h-8 w-8 hover:bg-white/10"
                              >
                                {isMuted || masterVolume === 0 ? (
                                  <VolumeX className="h-4 w-4" />
                                ) : (
                                  <Volume2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>
              ) : (
                // Collapsed Global Settings (keep existing content)
                <div className="p-2 flex flex-col items-center justify-between h-full">
                  <div className="flex flex-col items-center gap-2 pt-2">
                    <Settings2Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground rotate-90 origin-center transform translate-y-6">
                      Settings
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-2 flex-1 justify-center">
                    <Volume2 className="h-3 w-3 text-muted-foreground" />
                    <div className="h-24 w-1 bg-white/10 rounded-full relative">
                      <motion.div
                        className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-primary/50 rounded-full"
                        style={{ height: `${masterVolume * 100}%` }}
                        initial={{ height: 0 }}
                        animate={{ height: `${masterVolume * 100}%` }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Animated glow effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent"
                          animate={{ y: ["-100%", "100%"] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        />
                      </motion.div>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{Math.round(masterVolume * 100)}</span>
                  </div>

                  <div className="pb-2">
                    <div className="h-1 w-8 bg-white/10 rounded-full my-2"></div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Main Content Area */}
          <div className="flex flex-col space-y-6">
            {/* Track List */}
            <motion.div
              className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10 flex-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <TrackList />
            </motion.div>

            {/* Transport Controls */}
            <motion.div
              className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <TransportControls />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Global Progress Bar */}
      <motion.div
        className="bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 border-t border-primary/20 transition-all duration-300 ease-in-out relative overflow-hidden"
        animate={{
          height: isPlaying ? "4px" : "0px",
          borderTopWidth: isPlaying ? "1px" : "0px",
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="bg-gradient-to-r from-primary via-primary/80 to-primary h-full"
          animate={{
            width: isPlaying ? "100%" : "0%",
          }}
          transition={{
            duration: isPlaying ? 4 : 0.3,
            repeat: isPlaying ? Number.POSITIVE_INFINITY : 0,
            ease: "linear",
          }}
        />

        {/* Glow effect */}
        {isPlaying && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
        )}
      </motion.div>
    </div>
  )
}
