"use client"
import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Company } from "@/hooks/use-admin-api"
import { formatDate } from "@/lib/admin-utils"

interface RecentCompaniesProps {
  companies: Company[]
}

export const RecentCompanies: React.FC<RecentCompaniesProps> = ({ companies }) => {
  if (!companies || companies.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compañías Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {companies.map((company) => (
            <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">{company.name}</h4>
                <p className="text-sm text-muted-foreground">Creada el {formatDate(company.created_at)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{company.user_count || 0} usuarios</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
