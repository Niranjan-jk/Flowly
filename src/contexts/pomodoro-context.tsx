'use client'

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { toast } from 'sonner'

interface PomodoroSettings {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  cyclesBeforeLongBreak: number
  soundEnabled: boolean
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak'

interface PomodoroContextType {
  // Timer state
  isActive: boolean
  seconds: number
  mode: TimerMode
  completedCycles: number
  settings: PomodoroSettings
  
  // Timer controls
  toggleTimer: () => void
  resetTimer: () => void
  updateSettings: (newSettings: PomodoroSettings) => void
  
  // Helper functions
  formatTime: (totalSeconds: number) => string
  getProgress: () => number
  getModeInfo: () => {
    title: string
    color: string
    bgColor: string
  }
}

const defaultSettings: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  cyclesBeforeLongBreak: 4,
  soundEnabled: true
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined)

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false)
  const [seconds, setSeconds] = useState(25 * 60) // Default 25 minutes
  const [mode, setMode] = useState<TimerMode>('work')
  const [completedCycles, setCompletedCycles] = useState(0)
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    // Load settings from localStorage on initialization
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pomodoro-settings')
      return saved ? JSON.parse(saved) : defaultSettings
    }
    return defaultSettings
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmVAAwCR4GaBh')
    }
  }, [])

  // Load timer state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('pomodoro-state')
      if (savedState) {
        const { seconds: savedSeconds, mode: savedMode, completedCycles: savedCycles, isActive: savedIsActive } = JSON.parse(savedState)
        setSeconds(savedSeconds)
        setMode(savedMode)
        setCompletedCycles(savedCycles)
        setIsActive(savedIsActive)
      }
    }
  }, [])

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const state = { seconds, mode, completedCycles, isActive }
      localStorage.setItem('pomodoro-state', JSON.stringify(state))
    }
  }, [seconds, mode, completedCycles, isActive])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoro-settings', JSON.stringify(settings))
    }
  }, [settings])

  // Main timer logic
  useEffect(() => {
    if (isActive && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds(seconds => seconds - 1)
      }, 1000)
    } else if (isActive && seconds === 0) {
      // Timer completed
      handleTimerComplete()
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, seconds])

  const handleTimerComplete = () => {
    setIsActive(false)
    
    // Play sound if enabled
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e))
    }

    if (mode === 'work') {
      const newCompletedCycles = completedCycles + 1
      setCompletedCycles(newCompletedCycles)
      
      // Determine next mode
      if (newCompletedCycles % settings.cyclesBeforeLongBreak === 0) {
        setMode('longBreak')
        setSeconds(settings.longBreakDuration * 60)
        toast.success(`Work session complete! Time for a long break (${settings.longBreakDuration} min)`, {
          description: `Completed ${newCompletedCycles} work sessions`
        })
      } else {
        setMode('shortBreak')
        setSeconds(settings.shortBreakDuration * 60)
        toast.success(`Work session complete! Time for a short break (${settings.shortBreakDuration} min)`, {
          description: `Completed ${newCompletedCycles} work sessions`
        })
      }
    } else {
      // Break completed, back to work
      setMode('work')
      setSeconds(settings.workDuration * 60)
      toast.success('Break time over! Ready for another work session?', {
        description: 'Stay focused and productive!'
      })
    }
  }

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    if (mode === 'work') {
      setSeconds(settings.workDuration * 60)
    } else if (mode === 'shortBreak') {
      setSeconds(settings.shortBreakDuration * 60)
    } else {
      setSeconds(settings.longBreakDuration * 60)
    }
  }

  const updateSettings = (newSettings: PomodoroSettings) => {
    setSettings(newSettings)
    // Reset timer to new work duration if currently in work mode and not active
    if (mode === 'work' && !isActive) {
      setSeconds(newSettings.workDuration * 60)
    }
  }

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const getProgress = () => {
    let totalTime: number
    if (mode === 'work') {
      totalTime = settings.workDuration * 60
    } else if (mode === 'shortBreak') {
      totalTime = settings.shortBreakDuration * 60
    } else {
      totalTime = settings.longBreakDuration * 60
    }
    return ((totalTime - seconds) / totalTime) * 100
  }

  const getModeInfo = () => {
    switch (mode) {
      case 'work':
        return {
          title: 'Focus Time',
          color: 'from-blue-500 to-purple-600',
          bgColor: 'bg-blue-500/10'
        }
      case 'shortBreak':
        return {
          title: 'Short Break',
          color: 'from-green-500 to-emerald-600',
          bgColor: 'bg-green-500/10'
        }
      case 'longBreak':
        return {
          title: 'Long Break',
          color: 'from-orange-500 to-red-600',
          bgColor: 'bg-orange-500/10'
        }
    }
  }

  const value = {
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
  }

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  )
}

export function usePomodoro() {
  const context = useContext(PomodoroContext)
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider')
  }
  return context
}