'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShineBorder } from "@/components/magicui/shine-border"
import { TrendingUp, MessageCircle, Target, Clock } from "lucide-react"

interface MetricsData {
  outreachThisMonth: number
  replyRate: number
  closedDeals: number
  followUpsDue: number
}

interface DashboardMetricsProps {
  data: MetricsData
}

export default function DashboardMetrics({ data }: DashboardMetricsProps) {
  const metrics = [
    {
      title: "Outreach This Month",
      value: data.outreachThisMonth.toString(),
      icon: TrendingUp,
      description: "Total outreach messages sent",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Reply Rate",
      value: `${data.replyRate}%`,
      icon: MessageCircle,
      description: "Average response rate",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Closed Deals",
      value: data.closedDeals.toString(),
      icon: Target,
      description: "Successfully completed deals",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Follow-ups Due",
      value: data.followUpsDue.toString(),
      icon: Clock,
      description: "Pending follow-up actions",
      color: "from-orange-500 to-red-500"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon
        
        return (
          <ShineBorder
            key={index}
            className="relative overflow-hidden bg-gray-800 border-gray-700"
            color="#A07CFE"
          >
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 rounded-md bg-gradient-to-r ${metric.color}`}>
                  <IconComponent className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {metric.value}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          </ShineBorder>
        )
      })}
    </div>
  )
}