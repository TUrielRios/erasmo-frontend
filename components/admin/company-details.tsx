"use client"
import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Building2 } from "lucide-react"
import type { Company } from "@/hooks/use-admin-api"
import { formatDate } from "@/lib/admin-utils"

interface CompanyDetailsProps {
  company: Company | null
  companyDetails: Company | null
  documentsCount: number
}

export const CompanyDetails: React.FC<CompanyDetailsProps> = ({ company, companyDetails, documentsCount }) => {
  if (!company) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Selecciona una compañía para ver los detalles</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {company.name}
          <Badge
            variant="secondary"
            className={company.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
          >
            {company.is_active ? "Activa" : "Inactiva"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Descripción</Label>
          <p className="text-sm text-muted-foreground mt-1">
            {companyDetails?.description || company.description || "Sin descripción"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Industria</Label>
            <p className="text-sm text-muted-foreground">{company.industry}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Sector</Label>
            <p className="text-sm text-muted-foreground">{company.sector}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Usuarios</Label>
            <p className="text-sm text-muted-foreground">{company.user_count || 0}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Documentos</Label>
            <p className="text-sm text-muted-foreground">{documentsCount}</p>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Creada</Label>
          <p className="text-sm text-muted-foreground">{formatDate(company.created_at)}</p>
        </div>
      </CardContent>
    </Card>
  )
}
