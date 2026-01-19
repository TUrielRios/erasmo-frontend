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
      value: dashboard.overview?.total_companies || 0,
      icon: "/icons/parlante.svg",
    },
    {
      title: "Conversaciones",
      value: dashboard.overview?.total_conversations || 0,
      icon: "/icons/viñeta.svg",
    },
    {
      title: "Total Usuarios",
      value: dashboard.overview?.total_users || 0,
      icon: "/icons/user.svg",
    },
    {
      title: "Documentos",
      value: dashboard.usage_stats?.document_uploads || 0,
      icon: "/icons/hoja.svg",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-m font-bold text-blue-600 ">{stat.title}</CardTitle>
            <img src={stat.icon} alt={stat.title} className="h-5 w-5" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
