'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Timer } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TimerRestoreButton() {
  const pathname = usePathname()
  
  // Don't show on dashboard, auth pages, or root page
  const hiddenPaths = ['/', '/dashboard', '/login', '/sign-up', '/signup', '/forgot-password']
  const shouldHide = hiddenPaths.includes(pathname) || 
    hiddenPaths.some(path => path !== '/' && pathname.startsWith(path + '/'))

  const [isTimerVisible, setIsTimerVisible] = React.useState(true)

  React.useEffect(() => {
    const checkTimerVisibility = () => {
      const savedVisibility = localStorage.getItem('mini-timer-visible')
      setIsTimerVisible(savedVisibility === 'true')
    }

    // Check initial state
    checkTimerVisibility()

    // Listen for changes
    const interval = setInterval(checkTimerVisibility, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleRestoreTimer = () => {
    localStorage.setItem('mini-timer-visible', 'true')
    setIsTimerVisible(true)
    // Dispatch custom event to notify the timer component
    window.dispatchEvent(new CustomEvent('timer-restore'))
  }

  if (shouldHide || isTimerVisible) {
    return null
  }

  return (
    <div className="fixed bottom-6 left-6 z-[99]">
      <Button
        onClick={handleRestoreTimer}
        className={cn(
          "h-12 w-12 rounded-full shadow-lg",
          "bg-gradient-to-br from-purple-600 to-blue-600",
          "hover:from-purple-700 hover:to-blue-700",
          "border border-purple-500/50",
          "transition-all duration-300 hover:scale-105"
        )}
        title="Restore Focus Timer"
      >
        <Timer className="h-5 w-5 text-white" />
      </Button>
    </div>
  )
}