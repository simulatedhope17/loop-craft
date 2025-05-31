"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MoonIcon, SunIcon, HelpCircleIcon, Settings2Icon, SaveIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Header() {
  const { theme, setTheme } = useTheme()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = () => {
    setIsExporting(true)
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false)
    }, 1500)
  }

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-full bg-primary animate-pulse"></div>
            <h1 className="text-xl font-bold tracking-tight">LoopCraft</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleExport} disabled={isExporting}>
            <SaveIcon className="h-5 w-5" />
            <span className="sr-only">Export</span>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <HelpCircleIcon className="h-5 w-5" />
                <span className="sr-only">Help</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Help & Information</SheetTitle>
                <SheetDescription>Learn how to use LoopCraft effectively</SheetDescription>
              </SheetHeader>
              <Tabs defaultValue="shortcuts" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
                  <TabsTrigger value="guide">Guide</TabsTrigger>
                  <TabsTrigger value="about">About</TabsTrigger>
                </TabsList>
                <TabsContent value="shortcuts" className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Keyboard Shortcuts</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Space</div>
                      <div>Play/Pause</div>
                      <div>R</div>
                      <div>Record</div>
                      <div>Shift+R</div>
                      <div>Overdub</div>
                      <div>Backspace</div>
                      <div>Clear Track</div>
                      <div>Ctrl+Z</div>
                      <div>Undo</div>
                      <div>Ctrl+Y</div>
                      <div>Redo</div>
                      <div>M</div>
                      <div>Metronome On/Off</div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="guide" className="mt-4 space-y-4">
                  <p>LoopCraft is designed for musicians to create multi-track loops in real-time.</p>
                  <ol className="list-decimal pl-4 space-y-2">
                    <li>Select a track by clicking on it</li>
                    <li>Press record to start recording a loop</li>
                    <li>Play your instrument into your microphone</li>
                    <li>Press stop when finished or let it auto-stop at the end of the loop</li>
                    <li>Add more tracks and build your composition</li>
                  </ol>
                </TabsContent>
                <TabsContent value="about" className="mt-4">
                  <p>LoopCraft v1.0.0</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    A web-based looper application for musicians. Create multi-track loops with effects in real-time.
                  </p>
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings2Icon className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
                <SheetDescription>Configure your looper preferences</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span>Theme</span>
                  <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </div>
                {/* More settings would go here */}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
