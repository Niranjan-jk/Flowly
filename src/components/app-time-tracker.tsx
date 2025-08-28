'use client'

import React, { useState, useEffect } from 'react'
import { MagicCard } from '@/components/magicui/magic-card'
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Monitor, 
  Code, 
  Chrome, 
  MessageSquare, 
  FileText, 
  Music, 
  Image, 
  Terminal,
  RefreshCw,
  Clock,
  TrendingUp,
  Eye,
  EyeOff,
  Database,
  Gamepad2,
  Mail,
  Camera,
  Calculator,
  Settings,
  Folder
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppUsage {
  name: string
  timeSpent: number // in minutes
  percentage: number
  icon: React.ElementType
  category: 'productivity' | 'development' | 'communication' | 'entertainment' | 'system'
  isActive: boolean
  lastUsed: string
}

// Real-time Windows app usage fetcher
const fetchWindowsAppUsage = async (): Promise<AppUsage[]> => {
  try {
    // Call our API endpoint for app usage data
    const response = await fetch('/api/app-usage', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (!data.success || !data.apps) {
      throw new Error('Invalid API response format')
    }
    
    // Map API data to our AppUsage interface
    const apps: AppUsage[] = data.apps.map((app: any) => ({
      name: app.name,
      timeSpent: app.timeSpent,
      percentage: app.percentage,
      icon: getIconForApp(app.name),
      category: app.category,
      isActive: app.isActive,
      lastUsed: app.lastUsed
    }))
    
    return apps
  } catch (error) {
    console.error('Failed to fetch Windows app usage:', error)
    return []
  }
}

// Helper function to get appropriate icons for apps
const getIconForApp = (appName: string): React.ElementType => {
  const name = appName.toLowerCase()
  
  if (name.includes('code') || name.includes('visual studio')) return Code
  if (name.includes('chrome') || name.includes('browser')) return Chrome
  if (name.includes('teams') || name.includes('slack') || name.includes('discord')) return MessageSquare
  if (name.includes('notion') || name.includes('figma')) return FileText
  if (name.includes('spotify') || name.includes('music')) return Music
  if (name.includes('terminal') || name.includes('postman')) return Terminal
  if (name.includes('steam') || name.includes('game')) return Gamepad2
  if (name.includes('outlook') || name.includes('mail')) return Mail
  if (name.includes('obs') || name.includes('camera')) return Camera
  if (name.includes('calculator')) return Calculator
  if (name.includes('explorer') || name.includes('file')) return Folder
  if (name.includes('settings')) return Settings
  if (name.includes('database')) return Database
  
  // Default icon based on category would be handled by the calling component
  return Monitor
}

// Legacy mock data for fallback
const mockAppData: AppUsage[] = [
  {
    name: 'VS Code',
    timeSpent: 245,
    percentage: 35,
    icon: Code,
    category: 'development',
    isActive: true,
    lastUsed: 'Active now'
  },
  {
    name: 'Chrome',
    timeSpent: 180,
    percentage: 26,
    icon: Chrome,
    category: 'productivity',
    isActive: true,
    lastUsed: 'Active now'
  },
  {
    name: 'Slack',
    timeSpent: 95,
    percentage: 14,
    icon: MessageSquare,
    category: 'communication',
    isActive: false,
    lastUsed: '5 min ago'
  },
  {
    name: 'Notion',
    timeSpent: 78,
    percentage: 11,
    icon: FileText,
    category: 'productivity',
    isActive: false,
    lastUsed: '12 min ago'
  },
  {
    name: 'Spotify',
    timeSpent: 65,
    percentage: 9,
    icon: Music,
    category: 'entertainment',
    isActive: true,
    lastUsed: 'Active now'
  },
  {
    name: 'Terminal',
    timeSpent: 32,
    percentage: 5,
    icon: Terminal,
    category: 'development',
    isActive: false,
    lastUsed: '1 hour ago'
  }
]

export default function AppTimeTracker() {
  const [apps, setApps] = useState<AppUsage[]>([])
  const [isTracking, setIsTracking] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isMinimized, setIsMinimized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [dataSource, setDataSource] = useState<'api' | 'fallback'>('api')

  // Load app data on component mount
  useEffect(() => {
    loadAppData()
  }, [])

  const loadAppData = async () => {
    setIsLoading(true)
    try {
      const apiData = await fetchWindowsAppUsage()
      if (apiData.length > 0) {
        setApps(apiData)
        setDataSource('api')
      } else {
        // Fallback to legacy mock data if API fails
        setApps(mockAppData)
        setDataSource('fallback')
      }
    } catch (error) {
      console.error('Failed to load app data:', error)
      setApps(mockAppData)
      setDataSource('fallback')
    } finally {
      setIsLoading(false)
    }
  }

  // Simulate real-time updates
  useEffect(() => {
    if (!isTracking || isLoading) return

    const interval = setInterval(async () => {
      // Refresh data periodically for live tracking
      await loadAppData()
      setLastUpdated(new Date())
    }, 15000) // Update every 15 seconds for more live feel

    return () => clearInterval(interval)
  }, [isTracking, isLoading])

  const totalTime = apps.reduce((sum, app) => sum + app.timeSpent, 0)

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    return `${hours}h ${mins}m`
  }

  const getCategoryColor = (category: AppUsage['category']) => {
    switch (category) {
      case 'development': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'productivity': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'communication': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'entertainment': return 'bg-pink-500/20 text-pink-400 border-pink-500/30'
      case 'system': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const refreshData = async () => {
    await loadAppData()
    setLastUpdated(new Date())
  }

  return (
    <div className="w-full">
      <MagicCard className="p-4 sm:p-6 h-[400px] flex flex-col">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <AnimatedShinyText className="text-lg font-semibold text-white truncate">
                App Time Tracker
              </AnimatedShinyText>
              <p className="text-gray-400 text-sm truncate">
                Total: {formatTime(totalTime)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-gray-400 hover:text-white h-8 w-8 p-0"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshData}
                className="text-gray-400 hover:text-white h-8 w-8 p-0"
                title="Refresh data"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <RainbowButton
              onClick={() => setIsTracking(!isTracking)}
              className="h-8 px-3 text-xs flex-shrink-0"
            >
              {isTracking ? 'Pause' : 'Start'}
            </RainbowButton>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Status Indicator */}
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isTracking ? "bg-green-500 animate-pulse" : "bg-gray-500"
                )} />
                <span className="text-xs text-gray-400 truncate">
                  {isTracking ? 'Live tracking' : 'Paused'} • {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs px-2 py-0 h-5",
                  dataSource === 'api' 
                    ? "border-blue-500/30 text-blue-400" 
                    : "border-yellow-500/30 text-yellow-400"
                )}
              >
                {dataSource === 'api' ? 'API Data' : 'Fallback'}
              </Badge>
            </div>

            {/* Apps List - Scrollable */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {isLoading ? (
                // Loading skeleton
                [...Array(6)].map((_, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/30 animate-pulse">
                    <div className="w-5 h-5 bg-gray-700 rounded-full" />
                    <div className="w-6 h-6 bg-gray-700 rounded-lg" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-gray-700 rounded w-20" />
                      <div className="h-2 bg-gray-800 rounded w-16" />
                    </div>
                    <div className="text-right space-y-1">
                      <div className="h-3 bg-gray-700 rounded w-12" />
                      <div className="h-2 bg-gray-800 rounded w-8" />
                    </div>
                  </div>
                ))
              ) : (
                apps.sort((a, b) => b.timeSpent - a.timeSpent).map((app, index) => {
                const IconComponent = app.icon
                return (
                  <div
                    key={app.name}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-lg border transition-all duration-200 overflow-hidden",
                      "bg-gray-800/50 border-gray-700 hover:bg-gray-700/50",
                      app.isActive && "ring-1 ring-blue-500/30 bg-blue-500/5"
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {/* Rank */}
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0",
                        index === 0 ? "bg-yellow-500/20 text-yellow-400" :
                        index === 1 ? "bg-gray-400/20 text-gray-300" :
                        index === 2 ? "bg-orange-500/20 text-orange-400" :
                        "bg-gray-600/20 text-gray-500"
                      )}>
                        {index + 1}
                      </div>

                      {/* App Icon */}
                      <div className="w-6 h-6 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-3 w-3 text-gray-300" />
                      </div>

                      {/* App Info */}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-1">
                          <span className="text-white font-medium text-sm truncate block">{app.name}</span>
                          {app.isActive && (
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Badge variant="outline" className={cn("text-xs px-1 py-0 h-4 flex-shrink-0", getCategoryColor(app.category))}>
                            {app.category}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Time and Progress */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-white font-medium text-sm">{formatTime(app.timeSpent)}</div>
                      <div className="text-xs text-gray-400">{app.percentage}%</div>
                      
                      {/* Progress Bar */}
                      <div className="w-12 h-1 bg-gray-700 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(app.percentage * 2, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
                })
              )}
            </div>

            {/* Summary Stats */}
            <div className="mt-3 pt-3 border-t border-gray-700 flex-shrink-0">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 mx-auto mb-1">
                    <Clock className="h-3 w-3 text-blue-400" />
                  </div>
                  <div className="text-xs font-medium text-white">
                    {formatTime(totalTime)}
                  </div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20 mx-auto mb-1">
                    <TrendingUp className="h-3 w-3 text-green-400" />
                  </div>
                  <div className="text-xs font-medium text-white">
                    {apps.filter(app => app.isActive).length}
                  </div>
                  <div className="text-xs text-gray-500">Active</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 mx-auto mb-1">
                    <Monitor className="h-3 w-3 text-purple-400" />
                  </div>
                  <div className="text-xs font-medium text-white">
                    {apps.length}
                  </div>
                  <div className="text-xs text-gray-500">Apps</div>
                </div>
              </div>
            </div>
          </>
        )}
      </MagicCard>
    </div>
  )
}