"use client"
import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, MessageSquare, FileText } from "lucide-react"
import type { Dashboard } from "@/hooks/use-admin-api"

interface DashboardStatsProps {
  dashboard: Dashboard | null
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ dashboard }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Compañías</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboard?.overview.total_companies || 0}</div>
          <p className="text-xs text-muted-foreground">compañías registradas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboard?.overview.total_users || 0}</div>
          <p className="text-xs text-muted-foregreen">
            +{dashboard?.overview.new_users_week || 0} esta semana
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversaciones</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboard?.overview.total_conversations || 0}</div>
          <p className="text-xs text-muted-foreground">
            +{dashboard?.overview.new_conversations_week || 0} esta semana
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Documentos</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboard?.usage_stats.document_uploads || 0}</div>
          <p className="text-xs text-muted-foreground">documentos subidos</p>
        </CardContent>
      </Card>
    </div>
  )
}