'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text'
import { Button } from '@/components/ui/button'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee,
  Briefcase,
  Timer,
  Maximize2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePomodoro } from '@/contexts/pomodoro-context'
import Link from 'next/link'

export default function FloatingMiniTimer() {
  const pathname = usePathname()
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

  // Don't show on dashboard, auth pages, or root page
  const hiddenPaths = ['/', '/dashboard', '/login', '/sign-up', '/signup', '/forgot-password']
  // Also check for paths that start with auth-related routes (with trailing slashes)
  const shouldHide = hiddenPaths.includes(pathname) || 
    hiddenPaths.some(path => path !== '/' && pathname.startsWith(path + '/'))

  if (shouldHide) {
    return null
  }

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
    <div className="fixed bottom-6 right-6 z-[100]">
      <div className={cn(
        "flex items-center gap-3 p-4 rounded-xl border border-gray-700 shadow-2xl backdrop-blur-md transition-all duration-300",
        " hover:bg-gray-800/95",
        modeInfo.bgColor,
        isActive && "shadow-purple-500/25"
      )}>
        {/* Status Icon */}
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
          isActive 
            ? "border-blue-400 bg-blue-400/10 animate-pulse" 
            : "border-gray-600 bg-gray-700/50"
        )}>
          <IconComponent className={cn(
            "h-5 w-5 transition-colors duration-300",
            isActive ? "text-blue-400" : "text-gray-400"
          )} />
        </div>

        {/* Timer Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <AnimatedShinyText className="text-sm font-medium truncate">
              {modeInfo.title}
            </AnimatedShinyText>
            <span className="text-xs text-gray-400">
              #{completedCycles + 1}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xl font-mono font-bold text-white min-w-[4.5rem]">
              {formatTime(seconds)}
            </span>
            
            {/* Progress Bar */}
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden min-w-[60px]">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(getProgress(), 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetTimer}
            className="h-9 w-9 p-0 text-gray-400 hover:text-white"
            title="Reset Timer"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTimer}
            className={cn(
              "h-9 w-9 p-0 transition-colors",
              isActive 
                ? "text-red-400 hover:text-red-300" 
                : "text-green-400 hover:text-green-300"
            )}
            title={isActive ? "Pause Timer" : "Start Timer"}
          >
            {isActive ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </Button>

          {/* Go to Kanban Button */}
          <Link href="/kanban">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-gray-400 hover:text-white"
              title="Go to Kanban Board"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}