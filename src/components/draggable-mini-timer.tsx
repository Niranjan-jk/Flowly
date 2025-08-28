'use client'

import React, { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { MagicCard } from '@/components/magicui/magic-card'
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text'
import { Button } from '@/components/ui/button'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee,
  Briefcase,
  Timer,
  Maximize2,
  X,
  GripVertical
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePomodoro } from '@/contexts/pomodoro-context'
import Link from 'next/link'

interface Position {
  x: number
  y: number
}

export default function DraggableMiniTimer() {
  const pathname = usePathname()
  const [position, setPosition] = useState<Position>({ x: 24, y: 24 }) // bottom-6 right-6 equivalent
  const [isDragging, setIsDragging] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 })
  const [initialPosition, setInitialPosition] = useState<Position>({ x: 0, y: 0 })
  const timerRef = useRef<HTMLDivElement>(null)
  
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
  const shouldHide = hiddenPaths.includes(pathname) || 
    hiddenPaths.some(path => path !== '/' && pathname.startsWith(path + '/'))

  // Load position from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mini-timer-position')
    const savedVisibility = localStorage.getItem('mini-timer-visible')
    
    if (saved) {
      try {
        const savedPosition = JSON.parse(saved)
        setPosition(savedPosition)
      } catch (e) {
        console.warn('Failed to parse saved timer position')
      }
    }
    
    if (savedVisibility) {
      setIsVisible(savedVisibility === 'true')
    }
  }, [])

  // Save position to localStorage
  useEffect(() => {
    localStorage.setItem('mini-timer-position', JSON.stringify(position))
  }, [position])

  // Save visibility to localStorage
  useEffect(() => {
    localStorage.setItem('mini-timer-visible', String(isVisible))
  }, [isVisible])

  // Listen for restore events
  useEffect(() => {
    const handleRestore = () => {
      setIsVisible(true)
    }

    window.addEventListener('timer-restore', handleRestore)
    return () => window.removeEventListener('timer-restore', handleRestore)
  }, [])

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setDragStart({ x: e.clientX, y: e.clientY })
    setInitialPosition(position)
    setIsDragging(true)
  }

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      
      const deltaX = dragStart.x - e.clientX
      const deltaY = dragStart.y - e.clientY  // Fixed: invert deltaY calculation
      
      const newX = Math.max(24, Math.min(initialPosition.x + deltaX, window.innerWidth - 350))
      const newY = Math.max(24, Math.min(initialPosition.y + deltaY, window.innerHeight - 150))
      
      setPosition({ x: newX, y: newY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false })
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'grabbing'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = 'auto'
      document.body.style.cursor = 'auto'
    }
  }, [isDragging, dragStart, initialPosition])

  if (shouldHide || !isVisible) {
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
    <div 
      ref={timerRef}
      className="fixed z-[100] select-none"
      style={{ 
        right: `${position.x}px`, 
        bottom: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      <MagicCard className={cn(
        "transition-all duration-300 border-gray-700 shadow-2xl backdrop-blur-md rounded-xl",
        "hover:shadow-purple-500/20",
        modeInfo.bgColor,
        isActive && "shadow-purple-500/25",
        isDragging && "scale-105 rotate-1"
      )}>
        <div className="flex items-center gap-3 p-4">
          {/* Drag Handle */}
          <div 
            className="cursor-grab hover:cursor-grabbing"
            onMouseDown={handleMouseDown}
            title="Drag to move timer"
          >
            <GripVertical className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
          </div>

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
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetTimer}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
              title="Reset Timer"
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
              title={isActive ? "Pause Timer" : "Start Timer"}
            >
              {isActive ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </Button>

            {/* Go to Kanban Button */}
            <Link href="/kanban">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                title="Go to Kanban Board"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
            </Link>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
              title="Close Timer"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </MagicCard>
    </div>
  )
}