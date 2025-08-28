'use client'

import React from 'react'
import { MagicCard } from '@/components/magicui/magic-card'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Volume2, 
  VolumeX,
  Coffee,
  Briefcase,
  Timer
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePomodoro } from '@/contexts/pomodoro-context'
import { toast } from 'sonner'

export default function PomodoroTimer() {
  const {
    isActive,
    seconds,
    mode,
    completedCycles,
    settings,
    toggleTimer,
    resetTimer,
    updateSettings,
    formatTime,
    getProgress,
    getModeInfo
  } = usePomodoro()

  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [tempSettings, setTempSettings] = React.useState(settings)

  React.useEffect(() => {
    setTempSettings(settings)
  }, [settings])

  const modeInfo = getModeInfo()
  const getIconComponent = () => {
    switch (mode) {
      case 'work': return Briefcase
      case 'shortBreak': return Coffee
      case 'longBreak': return Timer
    }
  }
  const IconComponent = getIconComponent()

  const saveSettings = () => {
    updateSettings(tempSettings)
    setSettingsOpen(false)
    toast.success('Settings saved successfully!')
  }

  return (
    <div className="w-full">
      <MagicCard className={cn(
        "p-6 transition-all duration-500",
        modeInfo.bgColor,
        isActive && "shadow-lg shadow-purple-500/25"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <IconComponent className="h-5 w-5 text-white" />
            <AnimatedShinyText className="text-lg font-semibold">
              {modeInfo.title}
            </AnimatedShinyText>
          </div>
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Pomodoro Settings</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="work-duration">Work Duration (min)</Label>
                  <Input
                    id="work-duration"
                    type="number"
                    min="1"
                    max="60"
                    value={tempSettings.workDuration}
                    onChange={(e) => setTempSettings(prev => ({
                      ...prev,
                      workDuration: parseInt(e.target.value) || 25
                    }))}
                  />
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="short-break">Short Break (min)</Label>
                  <Input
                    id="short-break"
                    type="number"
                    min="1"
                    max="30"
                    value={tempSettings.shortBreakDuration}
                    onChange={(e) => setTempSettings(prev => ({
                      ...prev,
                      shortBreakDuration: parseInt(e.target.value) || 5
                    }))}
                  />
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="long-break">Long Break (min)</Label>
                  <Input
                    id="long-break"
                    type="number"
                    min="1"
                    max="60"
                    value={tempSettings.longBreakDuration}
                    onChange={(e) => setTempSettings(prev => ({
                      ...prev,
                      longBreakDuration: parseInt(e.target.value) || 15
                    }))}
                  />
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label htmlFor="cycles">Cycles before long break</Label>
                  <Input
                    id="cycles"
                    type="number"
                    min="2"
                    max="10"
                    value={tempSettings.cyclesBeforeLongBreak}
                    onChange={(e) => setTempSettings(prev => ({
                      ...prev,
                      cyclesBeforeLongBreak: parseInt(e.target.value) || 4
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound">Sound notifications</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTempSettings(prev => ({
                      ...prev,
                      soundEnabled: !prev.soundEnabled
                    }))}
                    className="text-gray-400 hover:text-white"
                  >
                    {tempSettings.soundEnabled ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={saveSettings}>Save Settings</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Progress Ring */}
        <div className="relative w-40 h-40 mx-auto mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className="text-gray-700"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="url(#gradient)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 70}`}
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - getProgress() / 100)}`}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className={cn("stop-blue-500")} />
                <stop offset="100%" className={cn("stop-purple-600")} />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-mono font-bold text-white mb-2">
              {formatTime(seconds)}
            </div>
            <div className="text-sm text-gray-400">
              Cycle {completedCycles + 1}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="lg"
            onClick={resetTimer}
            className="text-gray-400 hover:text-white"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
          
          <RainbowButton
            onClick={toggleTimer}
            className="w-16 h-16 rounded-full flex items-center justify-center"
          >
            {isActive ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-1" />
            )}
          </RainbowButton>

          <Button
            variant="ghost"
            size="lg"
            onClick={() => updateSettings({
              ...settings,
              soundEnabled: !settings.soundEnabled
            })}
            className="text-gray-400 hover:text-white"
          >
            {settings.soundEnabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Completion Stats */}
        <div className="mt-6 text-center">
          <div className="text-sm text-gray-400">
            Completed today: <span className="text-white font-semibold">{completedCycles}</span> sessions
          </div>
        </div>
      </MagicCard>
    </div>
  )
}