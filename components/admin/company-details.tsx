"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Company } from "@/hooks/use-admin-api"

interface CompanyDetailsProps {
  company: Company | null
  companyDetails: Company | null
  documentsCount: number
  onDelete?: (id: string) => void
}

export function CompanyDetails({ company, companyDetails, documentsCount, onDelete }: CompanyDetailsProps) {
  if (!company) {
    return (
      <Card className="border-gray-200">
        <CardContent className="py-12 text-center text-muted-foreground">
          Selecciona un subagente para ver sus detalles
        </CardContent>
      </Card>
    )
  }

  const details = companyDetails || company

  console.log("[v0] Company details:", details)

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Fecha no disponible"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Fecha inválida"
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Fecha inválida"
    }
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#0000FF] text-base">{details.name || "Sin nombre"}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-cyan-400 text-white hover:bg-cyan-400 text-xs">
              {details.is_active ? "Activo" : "Inactivo"}
            </Badge>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(details.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-xs font-medium text-gray-500 mb-1">Descripción</h4>
          <p className="text-sm text-gray-900">
            {details.description ||
              `Compañía en el sector ${details.sector || "no especificado"} de la industria ${details.industry || "no especificada"}`}
          </p>
        </div>

        <div>
          <h4 className="text-xs font-medium text-gray-500 mb-1">Industria</h4>
          <p className="text-sm font-medium text-gray-900">{details.industry || "Tecnología"}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-1">Usuarios</h4>
            <p className="text-2xl font-bold text-gray-900">{details.user_count || 0}</p>
          </div>
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-1">Sector</h4>
            <p className="text-sm font-medium text-gray-900">{details.sector || "CABA"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-1">Creada</h4>
            <div className="flex items-center space-x-1 text-sm text-gray-900">
              <Calendar className="h-3 w-3 text-gray-400" />
              <span>{formatDate(details.created_at)}</span>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-1">Documentos</h4>
            <div className="flex items-center space-x-1">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="text-2xl font-bold text-gray-900">{documentsCount}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
