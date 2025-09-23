"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Building2, Plus, Search, MoreHorizontal, FileText, Settings } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { getAuthToken, isAdmin } from "@/lib/auth"

interface Company {
  id: string
  name: string
  email: string
  status: "active" | "inactive"
  documentsCount: number
  createdAt: string
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!isAdmin()) {
      router.push("/login")
      return
    }

    const fetchCompanies = async () => {
      try {
        const token = getAuthToken()
        const response = await fetch("/api/v1/admin/companies", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setCompanies(data)
          setFilteredCompanies(data)
        }
      } catch (error) {
        console.error("Error fetching companies:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanies()
  }, [router])

  useEffect(() => {
    const filtered = companies.filter(
      (company) =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredCompanies(filtered)
  }, [searchTerm, companies])

  const handleStatusChange = async (companyId: string, newStatus: "active" | "inactive") => {
    try {
      const token = getAuthToken()
      const response = await fetch(`/api/v1/admin/companies/${companyId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setCompanies((prev) =>
          prev.map((company) => (company.id === companyId ? { ...company, status: newStatus } : company)),
        )
      }
    } catch (error) {
      console.error("Error updating company status:", error)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Cargando empresas...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Empresas</h1>
            <p className="text-muted-foreground">Gestiona todas las empresas registradas</p>
          </div>
          <Button onClick={() => router.push("/admin/companies/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Empresa
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Empresas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Companies Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Empresas ({filteredCompanies.length})</CardTitle>
            <CardDescription>Administra el estado y configuración de cada empresa</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Documentos</TableHead>
                  <TableHead>Fecha de Registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{company.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{company.email}</TableCell>
                    <TableCell>
                      <Badge variant={company.status === "active" ? "default" : "secondary"}>
                        {company.status === "active" ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{company.documentsCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(company.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/admin/companies/${company.id}`)}>
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/admin/companies/${company.id}/documents`)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Documentos
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/admin/companies/${company.id}/ai-config`)}>
                            <Settings className="h-4 w-4 mr-2" />
                            Configuración IA
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(company.id, company.status === "active" ? "inactive" : "active")
                            }
                          >
                            {company.status === "active" ? "Desactivar" : "Activar"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
