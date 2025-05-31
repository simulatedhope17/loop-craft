"use client"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAudioContext } from "@/features/audio/context/AudioContext"

export default function EffectsPanel() {
  const { selectedTrackId, tracks, updateTrackEffects } = useAudioContext()

  const selectedTrack = tracks.find((track) => track.id === selectedTrackId)
  const effects = selectedTrack?.effects || {
    reverb: { enabled: false, wet: 0.3, decay: 1.5 },
    delay: { enabled: false, time: 0.3, feedback: 0.4 },
    eq: { enabled: false, low: 0, mid: 0, high: 0 },
    distortion: { enabled: false, amount: 0.2 },
  }

  const handleEffectToggle = (effectName: string, enabled: boolean) => {
    if (!selectedTrackId) return

    updateTrackEffects(selectedTrackId, {
      ...effects,
      [effectName]: {
        ...effects[effectName as keyof typeof effects],
        enabled,
      },
    })
  }

  const handleEffectParamChange = (effectName: string, paramName: string, value: number) => {
    if (!selectedTrackId) return

    updateTrackEffects(selectedTrackId, {
      ...effects,
      [effectName]: {
        ...effects[effectName as keyof typeof effects],
        [paramName]: value,
      },
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Effects</h3>
        {!selectedTrackId && <div className="text-sm text-muted-foreground">Select a track to edit effects</div>}
      </div>

      <Tabs defaultValue="reverb" className="w-full">
        <TabsList className="grid grid-cols-4 mb-2">
          <TabsTrigger value="reverb">Reverb</TabsTrigger>
          <TabsTrigger value="delay">Delay</TabsTrigger>
          <TabsTrigger value="eq">EQ</TabsTrigger>
          <TabsTrigger value="distortion">Dist</TabsTrigger>
        </TabsList>

        <div className={selectedTrackId ? "" : "opacity-50 pointer-events-none"}>
          <TabsContent value="reverb" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="reverb-toggle">Enable Reverb</Label>
              <Switch
                id="reverb-toggle"
                checked={effects.reverb.enabled}
                onCheckedChange={(checked) => handleEffectToggle("reverb", checked)}
                disabled={!selectedTrackId}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="reverb-wet">Wet</Label>
                  <span className="text-sm">{Math.round(effects.reverb.wet * 100)}%</span>
                </div>
                <Slider
                  id="reverb-wet"
                  value={[effects.reverb.wet * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleEffectParamChange("reverb", "wet", value[0] / 100)}
                  disabled={!selectedTrackId || !effects.reverb.enabled}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="reverb-decay">Decay</Label>
                  <span className="text-sm">{effects.reverb.decay.toFixed(1)}s</span>
                </div>
                <Slider
                  id="reverb-decay"
                  value={[effects.reverb.decay * 10]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleEffectParamChange("reverb", "decay", value[0] / 10)}
                  disabled={!selectedTrackId || !effects.reverb.enabled}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="delay" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="delay-toggle">Enable Delay</Label>
              <Switch
                id="delay-toggle"
                checked={effects.delay.enabled}
                onCheckedChange={(checked) => handleEffectToggle("delay", checked)}
                disabled={!selectedTrackId}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="delay-time">Time</Label>
                  <span className="text-sm">{(effects.delay.time * 1000).toFixed(0)}ms</span>
                </div>
                <Slider
                  id="delay-time"
                  value={[effects.delay.time * 100]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleEffectParamChange("delay", "time", value[0] / 100)}
                  disabled={!selectedTrackId || !effects.delay.enabled}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="delay-feedback">Feedback</Label>
                  <span className="text-sm">{Math.round(effects.delay.feedback * 100)}%</span>
                </div>
                <Slider
                  id="delay-feedback"
                  value={[effects.delay.feedback * 100]}
                  min={0}
                  max={99}
                  step={1}
                  onValueChange={(value) => handleEffectParamChange("delay", "feedback", value[0] / 100)}
                  disabled={!selectedTrackId || !effects.delay.enabled}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="eq" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="eq-toggle">Enable EQ</Label>
              <Switch
                id="eq-toggle"
                checked={effects.eq.enabled}
                onCheckedChange={(checked) => handleEffectToggle("eq", checked)}
                disabled={!selectedTrackId}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="eq-low">Low</Label>
                  <span className="text-sm">
                    {effects.eq.low > 0 ? "+" : ""}
                    {effects.eq.low}dB
                  </span>
                </div>
                <Slider
                  id="eq-low"
                  value={[effects.eq.low]}
                  min={-12}
                  max={12}
                  step={1}
                  onValueChange={(value) => handleEffectParamChange("eq", "low", value[0])}
                  disabled={!selectedTrackId || !effects.eq.enabled}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="eq-mid">Mid</Label>
                  <span className="text-sm">
                    {effects.eq.mid > 0 ? "+" : ""}
                    {effects.eq.mid}dB
                  </span>
                </div>
                <Slider
                  id="eq-mid"
                  value={[effects.eq.mid]}
                  min={-12}
                  max={12}
                  step={1}
                  onValueChange={(value) => handleEffectParamChange("eq", "mid", value[0])}
                  disabled={!selectedTrackId || !effects.eq.enabled}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="eq-high">High</Label>
                  <span className="text-sm">
                    {effects.eq.high > 0 ? "+" : ""}
                    {effects.eq.high}dB
                  </span>
                </div>
                <Slider
                  id="eq-high"
                  value={[effects.eq.high]}
                  min={-12}
                  max={12}
                  step={1}
                  onValueChange={(value) => handleEffectParamChange("eq", "high", value[0])}
                  disabled={!selectedTrackId || !effects.eq.enabled}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="distortion" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="distortion-toggle">Enable Distortion</Label>
              <Switch
                id="distortion-toggle"
                checked={effects.distortion.enabled}
                onCheckedChange={(checked) => handleEffectToggle("distortion", checked)}
                disabled={!selectedTrackId}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="distortion-amount">Amount</Label>
                  <span className="text-sm">{Math.round(effects.distortion.amount * 100)}%</span>
                </div>
                <Slider
                  id="distortion-amount"
                  value={[effects.distortion.amount * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleEffectParamChange("distortion", "amount", value[0] / 100)}
                  disabled={!selectedTrackId || !effects.distortion.enabled}
                />
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
