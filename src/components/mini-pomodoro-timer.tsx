'use client'

import React from 'react'
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text'
import { Button } from '@/components/ui/button'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee,
  Briefcase,
  Timer
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePomodoro } from '@/contexts/pomodoro-context'

export default function MiniPomodoroTimer() {
  const {
    isActive,
    seconds,
    mode,
    completedCycles,
    toggleTimer,
    resetTimer,
    formatTime,
    getProgress,
    getModeInfo
  } = usePomodoro()

  const modeInfo = getModeInfo()
  
  const getIconComponent = () => {
    switch (mode) {
      case 'work': return Briefcase
      case 'shortBreak': return Coffee
      case 'longBreak': return Timer
    }
  }
  
  const IconComponent = getIconComponent()

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-700">
      {/* Status Icon */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
        isActive ? "border-blue-400 bg-blue-400/10 animate-pulse" : "border-gray-600 bg-gray-700/50"
      )}>
        <IconComponent className={cn(
          "h-4 w-4 transition-colors duration-300",
          isActive ? "text-blue-400" : "text-gray-400"
        )} />
      </div>

      {/* Timer Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <AnimatedShinyText className="text-sm font-medium truncate">
            {modeInfo.title}
          </AnimatedShinyText>
          <span className="text-xs text-gray-400">
            Cycle {completedCycles + 1}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-lg font-mono font-bold text-white">
            {formatTime(seconds)}
          </span>
          {/* Mini Progress Bar */}
          <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(getProgress(), 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={resetTimer}
          className="h-8 w-8 p-0 text-gray-400 hover:text-white"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTimer}
          className={cn(
            "h-8 w-8 p-0 transition-colors",
            isActive 
              ? "text-red-400 hover:text-red-300" 
              : "text-green-400 hover:text-green-300"
          )}
        >
          {isActive ? (
            <Pause className="h-3 w-3" />
          ) : (
            <Play className="h-3 w-3 ml-0.5" />
          )}
        </Button>
      </div>
    </div>
  )
}