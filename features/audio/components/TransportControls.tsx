"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Play, Pause, Square, Mic, RotateCcw, RotateCw, Music, Timer } from "lucide-react"
import { useAudioContext } from "@/features/audio/context/AudioContext"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export default function TransportControls() {
  const {
    isPlaying,
    togglePlayback,
    isRecording,
    startRecording,
    stopRecording,
    stopPlayback,
    tempo,
    setTempo,
    selectedTrackId,
    metronomeEnabled,
    toggleMetronome,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useAudioContext()

  const [countdownValue, setCountdownValue] = useState<number | null>(null)
  const [isCountingIn, setIsCountingIn] = useState(false)

  // Handle countdown for recording
  useEffect(() => {
    if (isCountingIn && countdownValue !== null) {
      if (countdownValue > 0) {
        const timer = setTimeout(() => {
          setCountdownValue(countdownValue - 1)
        }, 60000 / tempo)

        return () => clearTimeout(timer)
      } else {
        setIsCountingIn(false)
        setCountdownValue(null)
        startRecording()
      }
    }
  }, [isCountingIn, countdownValue, tempo, startRecording])

  const handleRecordWithCountIn = () => {
    if (selectedTrackId) {
      setIsCountingIn(true)
      setCountdownValue(4) // 4 beat count-in
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Transport Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant={isPlaying ? "secondary" : "default"}
              size="icon"
              onClick={togglePlayback}
              className={cn(
                "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
                "bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
                "border border-white/20 backdrop-blur-sm",
                isPlaying && "from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70",
              )}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
            </Button>
          </motion.div>

          {/* Stop Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="icon"
              onClick={stopPlayback}
              className={cn(
                "h-12 w-12 rounded-full transition-all duration-300",
                "bg-white/5 backdrop-blur-sm border-white/20",
                "hover:bg-white/10 hover:border-white/30",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
              disabled={!isPlaying && !isRecording}
            >
              <Square className="h-5 w-5" />
            </Button>
          </motion.div>

          {/* Record Button */}
          <div className="relative">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                onClick={startRecording}
                disabled={isCountingIn || !selectedTrackId}
                className={cn(
                  "h-12 w-12 rounded-full transition-all duration-300",
                  "bg-white/5 backdrop-blur-sm border-white/20",
                  "hover:bg-red-500/20 hover:border-red-500/30",
                  isRecording && "bg-red-500/80 border-red-500/50 animate-pulse shadow-lg shadow-red-500/30",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                <Mic className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* Countdown Indicator */}
            <AnimatePresence>
              {isCountingIn && countdownValue !== null && (
                <motion.div
                  className="absolute -top-10 left-1/2 transform -translate-x-1/2"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  key={countdownValue}
                >
                  <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold shadow-lg backdrop-blur-sm border border-white/20">
                    {countdownValue}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Count-in Record Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRecordWithCountIn}
              disabled={isRecording || isCountingIn || !selectedTrackId}
              className={cn(
                "h-12 w-12 rounded-full transition-all duration-300",
                "bg-white/5 backdrop-blur-sm border-white/20",
                "hover:bg-white/10 hover:border-white/30",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
              title="Record with count-in"
            >
              <Timer className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center gap-3">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="icon"
                onClick={undo}
                disabled={!canUndo}
                className={cn(
                  "h-10 w-10 rounded-full transition-all duration-300",
                  "bg-white/5 backdrop-blur-sm border-white/20",
                  "hover:bg-white/10 hover:border-white/30",
                  "disabled:opacity-30 disabled:cursor-not-allowed",
                )}
                title="Undo"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="icon"
                onClick={redo}
                disabled={!canRedo}
                className={cn(
                  "h-10 w-10 rounded-full transition-all duration-300",
                  "bg-white/5 backdrop-blur-sm border-white/20",
                  "hover:bg-white/10 hover:border-white/30",
                  "disabled:opacity-30 disabled:cursor-not-allowed",
                )}
                title="Redo"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          {/* Metronome Toggle */}
          <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
            <Switch
              id="metronome"
              checked={metronomeEnabled}
              onCheckedChange={toggleMetronome}
              className="data-[state=checked]:bg-primary"
            />
            <Label htmlFor="metronome" className="flex items-center gap-2 cursor-pointer">
              <Music
                className={cn("h-4 w-4 transition-colors", metronomeEnabled ? "text-primary" : "text-muted-foreground")}
              />
              <span className="text-sm font-medium">Metronome</span>
            </Label>
          </div>
        </div>
      </div>

      {/* Tempo Control */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
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
      </div>
    </div>
  )
}
