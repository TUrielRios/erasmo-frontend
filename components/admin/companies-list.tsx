"use client"
import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Building2, MoreHorizontal, Eye, Edit } from "lucide-react"
import type { Company } from "@/hooks/use-admin-api"

interface CompaniesListProps {
  companies: Company[]
  selectedCompany: Company | null
  onSelectCompany: (company: Company) => void
}

export const CompaniesList: React.FC<CompaniesListProps> = ({ companies, selectedCompany, onSelectCompany }) => {
  const handleViewDetails = (e: React.MouseEvent, company: Company) => {
    e.preventDefault()
    e.stopPropagation()
    onSelectCompany(company)
  }

  const handleEdit = (e: React.MouseEvent, company: Company) => {
    e.preventDefault()
    e.stopPropagation()
    // Aquí puedes agregar la lógica para editar la compañía
    console.log("Editar compañía:", company.id)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Compañías
          <Badge variant="secondary">{companies.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-auto overflow-auto">
          <div className="space-y-2">
            {companies.map((company) => (
              <div
                key={company.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedCompany?.id === company.id ? "bg-accent border-accent-foreground" : "hover:bg-accent/50"
                }`}
                onClick={() => onSelectCompany(company)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{company.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {company.industry} • {company.sector}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge
                        variant="secondary"
                        className={company.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {company.is_active ? "Activa" : "Inactiva"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{company.user_count || 0} usuarios</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem 
                        onClick={(e) => handleViewDetails(e, company)}
                        className="cursor-pointer"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => handleEdit(e, company)}
                        className="cursor-pointer"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}

            {companies.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No se encontraron compañías</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}