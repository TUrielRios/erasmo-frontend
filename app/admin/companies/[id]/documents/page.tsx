"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, Upload, MoreHorizontal, Download, Trash2 } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { getAuthToken, isAdmin } from "@/lib/auth"

interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: string
  status: "processing" | "ready" | "error"
}

interface Company {
  id: string
  name: string
}

export default function CompanyDocumentsPage() {
  const [company, setCompany] = useState<Company | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  useEffect(() => {
    if (!isAdmin()) {
      router.push("/login")
      return
    }

    const fetchData = async () => {
      try {
        const token = getAuthToken()

        // Fetch company details
        const companyResponse = await fetch(`/api/v1/admin/companies/${companyId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (companyResponse.ok) {
          const companyData = await companyResponse.json()
          setCompany(companyData)
        }

        // Fetch documents
        const documentsResponse = await fetch(`/api/v1/admin/companies/${companyId}/documents`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (documentsResponse.ok) {
          const documentsData = await documentsResponse.json()
          setDocuments(documentsData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router, companyId])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadError("")

    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append("documents", file)
      })

      const token = getAuthToken()
      const response = await fetch(`/api/v1/admin/companies/${companyId}/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const newDocuments = await response.json()
        setDocuments((prev) => [...prev, ...newDocuments])
      } else {
        const error = await response.json()
        setUploadError(error.message || "Error al subir documentos")
      }
    } catch (error) {
      setUploadError("Error de conexión al subir documentos")
    } finally {
      setIsUploading(false)
      // Reset file input
      event.target.value = ""
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este documento?")) return

    try {
      const token = getAuthToken()
      const response = await fetch(`/api/v1/admin/companies/${companyId}/documents/${documentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== documentId))
      }
    } catch (error) {
      console.error("Error deleting document:", error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Cargando documentos...</div>
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
            <h1 className="text-3xl font-bold text-foreground">Documentos - {company?.name}</h1>
            <p className="text-muted-foreground">Gestiona los documentos de conocimiento de la empresa</p>
          </div>
          <Button onClick={() => router.push("/admin/companies")}>Volver a Empresas</Button>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Subir Documentos</CardTitle>
            <CardDescription>Sube documentos PDF, TXT o DOCX para entrenar la IA de la empresa</CardDescription>
          </CardHeader>
          <CardContent>
            {uploadError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="documents">Seleccionar Documentos</Label>
                <Input
                  id="documents"
                  type="file"
                  multiple
                  accept=".pdf,.txt,.docx,.doc"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="mt-1"
                />
              </div>

              {isUploading && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Upload className="h-4 w-4 animate-spin" />
                  <span>Subiendo documentos...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos ({documents.length})</CardTitle>
            <CardDescription>Lista de todos los documentos cargados para esta empresa</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de Subida</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{document.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{document.type.toUpperCase()}</TableCell>
                    <TableCell>{formatFileSize(document.size)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          document.status === "ready"
                            ? "default"
                            : document.status === "processing"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {document.status === "ready"
                          ? "Listo"
                          : document.status === "processing"
                            ? "Procesando"
                            : "Error"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(document.uploadedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Descargar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteDocument(document.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
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
