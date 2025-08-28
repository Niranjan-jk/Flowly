import { NextRequest, NextResponse } from 'next/server'

// Global store type declaration
declare global {
  var appUsageStore: string | undefined
}

// This endpoint provides app usage data
// In the future, this could be extended to:
// 1. Call a Windows service/daemon that tracks real app usage
// 2. Read from Windows Performance Toolkit or similar
// 3. Integrate with third-party time tracking tools
// 4. Connect to a desktop app that monitors system activity

interface AppUsageData {
  name: string
  timeSpent: number // in minutes
  percentage: number
  category: 'productivity' | 'development' | 'communication' | 'entertainment' | 'system'
  isActive: boolean
  lastUsed: string
  processName?: string
  windowTitle?: string
}

// Simulated realistic app usage based on common development workflows
const generateRealisticAppUsage = (): AppUsageData[] => {
  const currentTime = new Date()
  const hour = currentTime.getHours()
  const isWorkingHours = hour >= 9 && hour <= 17
  const isEvening = hour >= 18 && hour <= 23
  
  const apps: Omit<AppUsageData, 'timeSpent' | 'percentage' | 'isActive' | 'lastUsed'>[] = [
    {
      name: 'Visual Studio Code',
      category: 'development',
      processName: 'Code.exe',
      windowTitle: 'Visual Studio Code'
    },
    {
      name: 'Chrome',
      category: 'productivity',
      processName: 'chrome.exe',
      windowTitle: 'Google Chrome'
    },
    {
      name: 'Teams',
      category: 'communication',
      processName: 'Teams.exe',
      windowTitle: 'Microsoft Teams'
    },
    {
      name: 'Slack',
      category: 'communication',
      processName: 'slack.exe',
      windowTitle: 'Slack'
    },
    {
      name: 'Discord',
      category: 'communication',
      processName: 'Discord.exe',
      windowTitle: 'Discord'
    },
    {
      name: 'Notion',
      category: 'productivity',
      processName: 'Notion.exe',
      windowTitle: 'Notion'
    },
    {
      name: 'Spotify',
      category: 'entertainment',
      processName: 'Spotify.exe',
      windowTitle: 'Spotify'
    },
    {
      name: 'Terminal',
      category: 'development',
      processName: 'WindowsTerminal.exe',
      windowTitle: 'Windows Terminal'
    },
    {
      name: 'Figma',
      category: 'productivity',
      processName: 'Figma.exe',
      windowTitle: 'Figma'
    },
    {
      name: 'Postman',
      category: 'development',
      processName: 'Postman.exe',
      windowTitle: 'Postman'
    },
    {
      name: 'Steam',
      category: 'entertainment',
      processName: 'steam.exe',
      windowTitle: 'Steam'
    },
    {
      name: 'Outlook',
      category: 'communication',
      processName: 'OUTLOOK.EXE',
      windowTitle: 'Microsoft Outlook'
    }
  ]

  // Get stored usage data or initialize with timestamp
  const storedData = JSON.parse(globalThis.appUsageStore || '{}')
  const lastUpdate = storedData.lastUpdate || Date.now()
  const timeDiff = Math.floor((Date.now() - lastUpdate) / 60000) // minutes since last update
      
  const appsWithUsage = apps.map(app => {
    const stored = storedData[app.name] || { totalTime: Math.floor(Math.random() * 180) + 30 }
    let baseTime = stored.totalTime
        
    // Add live increments based on activity
    if (timeDiff > 0) {
      if (app.category === 'development' && isWorkingHours) {
        baseTime += Math.min(timeDiff * 0.8, 5) // Active development
      } else if (app.category === 'communication') {
        baseTime += Math.min(timeDiff * 0.3, 2) // Background communication
      } else if (app.category === 'entertainment' && !isWorkingHours) {
        baseTime += Math.min(timeDiff * 0.6, 3) // Entertainment usage
      }
    }
    let isActive = false
    let activityMultiplier = 1

    // Determine active status and activity patterns
    if (app.category === 'development' && isWorkingHours) {
      isActive = Math.random() > 0.3
      activityMultiplier = 1.2
    } else if (app.category === 'communication') {
      isActive = Math.random() > 0.5
      activityMultiplier = 1.1
    } else if (app.category === 'entertainment') {
      isActive = isEvening ? Math.random() > 0.4 : Math.random() > 0.8
      activityMultiplier = isEvening ? 1.3 : 0.8
    } else if (app.category === 'productivity' && isWorkingHours) {
      isActive = Math.random() > 0.6
      activityMultiplier = 1.1
    } else {
      isActive = Math.random() > 0.9
    }

    const timeSpent = Math.floor(baseTime * activityMultiplier)
    const lastUsed = isActive ? 'Active now' : `${Math.floor(Math.random() * 60) + 1}m ago`

    return { ...app, timeSpent, percentage: 0, isActive, lastUsed }
  })

  // Store updated data for next call
  const updatedStore: Record<string, any> = { lastUpdate: Date.now() }
  appsWithUsage.forEach(app => {
    updatedStore[app.name] = { totalTime: app.timeSpent }
  })
  globalThis.appUsageStore = JSON.stringify(updatedStore)

  // Calculate percentages
  const totalTime = appsWithUsage.reduce((sum, app) => sum + app.timeSpent, 0)
  const appsWithPercentages = appsWithUsage.map(app => ({
    ...app,
    percentage: totalTime > 0 ? Math.round((app.timeSpent / totalTime) * 100) : 0
  }))

  // Filter out apps with very little usage and sort by time spent
  return appsWithPercentages
    .filter(app => app.timeSpent > 10) // Only show apps used for more than 10 minutes
    .sort((a, b) => b.timeSpent - a.timeSpent)
    .slice(0, 15) // Top 15 apps
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeDetails = searchParams.get('details') === 'true'
    
    // Generate or fetch app usage data
    const appUsage = generateRealisticAppUsage()
    
    // Calculate summary statistics
    const totalTime = appUsage.reduce((sum, app) => sum + app.timeSpent, 0)
    const activeApps = appUsage.filter(app => app.isActive).length
    const categories = {
      development: appUsage.filter(app => app.category === 'development').length,
      productivity: appUsage.filter(app => app.category === 'productivity').length,
      communication: appUsage.filter(app => app.category === 'communication').length,
      entertainment: appUsage.filter(app => app.category === 'entertainment').length,
      system: appUsage.filter(app => app.category === 'system').length
    }

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalApps: appUsage.length,
        activeApps,
        totalTime, // in minutes
        totalTimeFormatted: `${Math.floor(totalTime / 60)}h ${totalTime % 60}m`,
        categories
      },
      apps: includeDetails ? appUsage : appUsage.map(({ processName, windowTitle, ...app }) => app),
      note: 'This is simulated data. In production, this would connect to Windows APIs or a system monitoring service.',
      integration: {
        suggestions: [
          'Install a Windows service to track real app usage',
          'Use Windows Performance Toolkit (WPT) for detailed metrics',
          'Integrate with RescueTime or similar time-tracking tools',
          'Create a desktop companion app for real-time monitoring',
          'Use PowerShell scripts to query running processes'
        ]
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('App Usage API Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch app usage data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, appName, duration } = body

    // This endpoint could be used to:
    // 1. Log manual app usage
    // 2. Receive data from a Windows service
    // 3. Update app usage statistics
    // 4. Set app tracking preferences

    console.log(`App usage action: ${action} for ${appName} (${duration} minutes)`)

    return NextResponse.json({
      success: true,
      message: `Logged ${action} for ${appName}`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('App Usage POST Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process app usage action',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}