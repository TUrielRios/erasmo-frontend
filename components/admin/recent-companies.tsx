"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2 } from "lucide-react"
import type { Company } from "@/hooks/use-admin-api"

interface RecentCompaniesProps {
  companies: Company[]
}

export function RecentCompanies({ companies }: RecentCompaniesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compañías Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {companies.map((company) => (
            <div key={company.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{company.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {company.industry} - {company.sector}
                  </p>
                </div>
              </div>
              <Badge variant={company.is_active ? "default" : "secondary"}>
                {company.is_active ? "Activa" : "Inactiva"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
