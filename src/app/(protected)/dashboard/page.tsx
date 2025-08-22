'use client'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardMetrics from '@/components/dashboard-metrics'
import DashboardBentoGrid from '@/components/dashboard-bento-grid'
import NavigationDock from '@/components/navigation-dock'
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [metricsData, setMetricsData] = useState({
    outreachThisMonth: 0,
    replyRate: 0,
    closedDeals: 0,
    followUpsDue: 0
  })

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (user) {
          // Load CRM data to calculate metrics
          const { data: clients } = await supabase
            .from('crm_clients')
            .select('*')
            .eq('user_id', user.id)
          
          if (clients) {
            const currentMonth = new Date().getMonth()
            const currentYear = new Date().getFullYear()
            
            // Calculate metrics from CRM data
            const thisMonthClients = clients.filter(client => {
              const createdDate = new Date(client.created_at)
              return createdDate.getMonth() === currentMonth && 
                     createdDate.getFullYear() === currentYear
            })
            
            const closedDeals = clients.filter(client => client.status === 'Closed').length
            const followUpsDue = clients.filter(client => client.status === 'Idle').length
            
            // Mock reply rate calculation (you can implement actual tracking)
            const replyRate = thisMonthClients.length > 0 ? 
              Math.round((closedDeals / thisMonthClients.length) * 100) : 0
            
            setMetricsData({
              outreachThisMonth: thisMonthClients.length,
              replyRate: Math.min(replyRate, 100),
              closedDeals,
              followUpsDue
            })
          }
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-100 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="border-b border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <AnimatedShinyText className="text-3xl font-bold">
                Dashboard
              </AnimatedShinyText>
              <p className="text-gray-400 mt-1">
                Welcome back, {user?.email ? user.email.split('@')[0] : 'User'}!
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg">
              <p className="text-sm font-medium">Flowly CRM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Cards */}
        <DashboardMetrics data={metricsData} />
        
        {/* Bento Grid Navigation */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Navigation</h2>
          <DashboardBentoGrid />
        </div>
        
        {/* Recent Activity Section */}
        <div className="rounded-lg shadow-sm border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">CRM system initialized and ready</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-300">Dashboard metrics are being tracked</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-300">Welcome to your new CRM dashboard!</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Dock */}
      <NavigationDock />
    </div>
  )
}