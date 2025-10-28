"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, FileText, Activity } from "lucide-react"

interface DashboardStatsProps {
  dashboard: any
}

export function DashboardStats({ dashboard }: DashboardStatsProps) {
  if (!dashboard) return null

  const stats = [
    {
      title: "Total Compañías",
      value: dashboard.total_companies || 0,
      icon: Building2,
      color: "text-blue-600",
    },
    {
      title: "Compañías Activas",
      value: dashboard.active_companies || 0,
      icon: Activity,
      color: "text-green-600",
    },
    {
      title: "Total Usuarios",
      value: dashboard.total_users || 0,
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Total Documentos",
      value: dashboard.total_documents || 0,
      icon: FileText,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
