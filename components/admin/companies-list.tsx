"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { Company } from "@/hooks/use-admin-api"

interface CompaniesListProps {
  companies: Company[]
  selectedCompany: Company | null
  onSelectCompany: (company: Company) => void
  onAddCompany?: () => void
  onDeleteCompany?: (companyId: number) => void
}

export function CompaniesList({
  companies,
  selectedCompany,
  onSelectCompany,
  onAddCompany,
  onDeleteCompany,
}: CompaniesListProps) {
  const handleDelete = (e: React.MouseEvent, companyId: number) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("[v0] Deleting company:", companyId)
    if (onDeleteCompany) {
      onDeleteCompany(companyId)
    }
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-[#0A2FF1] text-base text-xl">Subagentes</CardTitle>
        <Button size="sm" className="bg-[#0000FF] hover:bg-[#0000DD] rounded-full h-8 w-8 p-0" onClick={onAddCompany}>
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {companies.map((company) => (
            <div
              key={company.id}
              className={cn(
                "p-3 rounded-lg bg-white border border-gray-200 cursor-pointer transition-colors hover:bg-gray-50",
                selectedCompany?.id === company.id && "bg-gray-50 border-gray-300",
              )}
              onClick={() => onSelectCompany(company)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-sm mb-1">{company.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">
                    {company.industry || "Tecnología"} - {company.sector || "CABA"}
                  </p>
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="bg-cyan-400 text-white hover:bg-cyan-400 text-xs">
                      {company.is_active ? "Activa" : "Inactiva"}
                    </Badge>
                    <span className="text-xs text-gray-500">{company.user_count || 1} usuarios</span>
                  </div>
                </div>
                {onDeleteCompany && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log("[v0] Dropdown trigger clicked")
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => handleDelete(e, company.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
