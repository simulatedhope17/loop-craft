"use client"
import Track from "./Track"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { useAudioContext } from "@/features/audio/context/AudioContext"
import { motion, AnimatePresence } from "framer-motion"

export default function TrackList() {
  const { tracks, addTrack, isPlaying, togglePlayback } = useAudioContext()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Loop Station
          </h2>
          <p className="text-sm text-gray-400">
            {tracks.length} {tracks.length === 1 ? "track" : "tracks"} • {tracks.filter((t) => t.buffer).length}{" "}
            recorded
          </p>
        </div>

        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={addTrack}
              size="sm"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Track
            </Button>
          </motion.div>
        </div>
      </div>

      {tracks.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center py-16 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Master Play Button */}
          <motion.div
            className="relative w-32 h-32 mb-8 cursor-pointer"
            onClick={addTrack}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              filter: "drop-shadow(0 0 30px rgba(0, 212, 255, 0.4))",
            }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 opacity-20" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <PlusIcon className="h-12 w-12 text-white" />
            </div>

            {/* Segmented outer ring */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 128 128">
              {Array.from({ length: 32 }, (_, i) => {
                const angle = (i * 360) / 32
                const isActive = i % 4 === 0
                return (
                  <motion.line
                    key={i}
                    x1="64"
                    y1="4"
                    x2="64"
                    y2={isActive ? "12" : "8"}
                    stroke="rgba(0, 212, 255, 0.8)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    transform={`rotate(${angle} 64 64)`}
                    animate={{
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.1,
                    }}
                  />
                )
              })}
            </svg>
          </motion.div>

          <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Create Your First Loop
          </h3>
          <p className="text-gray-400 max-w-md leading-relaxed">
            Start by adding a track to begin recording. Each circular track can hold a loop that syncs perfectly with
            others.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Track Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-8 justify-items-center">
            <AnimatePresence mode="popLayout">
              {tracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                >
                  <Track track={track} index={index} />
                </motion.div>
              ))}

              {/* Add Track Button */}
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.3,
                  delay: tracks.length * 0.05,
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                }}
              >
                <motion.div
                  className="w-24 h-24 cursor-pointer flex items-center justify-center rounded-full border-2 border-dashed border-gray-600 hover:border-cyan-400 transition-all duration-300"
                  onClick={addTrack}
                  whileHover={{ scale: 1.1, borderColor: "#00D4FF" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <PlusIcon className="h-8 w-8 text-gray-600 hover:text-cyan-400 transition-colors" />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}
