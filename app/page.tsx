"use client"

import { useState, useEffect } from "react"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import Workspace from "@/features/workspace/components/Workspace"
import Header from "@/components/Header"
import { AudioProvider } from "@/features/audio/context/AudioContext"
import { useIsMobile } from "@/hooks/use-mobile"

export default function Home() {
  const { toast } = useToast()
  const [isLoaded, setIsLoaded] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    // Check if browser supports Web Audio API
    if (!window.AudioContext && !(window as any).webkitAudioContext) {
      toast({
        title: "Browser not supported",
        description: "Your browser doesn't support Web Audio API. Please use a modern browser.",
        variant: "destructive",
      })
    } else {
      setIsLoaded(true)
    }
  }, [toast])

  return (
    <main className={`min-h-screen bg-background text-foreground flex flex-col ${isMobile ? 'pb-16' : ''}`}>
      <Header />
      {isLoaded ? (
        <AudioProvider>
          <Workspace />
        </AudioProvider>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Loading Audio Engine...</h2>
            <p>Please wait while we initialize the audio components</p>
          </div>
        </div>
      )}
      <Toaster />
    </main>
  )
}
