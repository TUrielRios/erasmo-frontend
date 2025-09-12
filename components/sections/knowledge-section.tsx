"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Trash2, RefreshCw, CheckCircle, AlertCircle, Database, HardDrive } from "lucide-react"

interface IngestionStatus {
  status: string
  documents_count: number
  last_updated: string
  processing_progress?: number
  total_size?: number
}

interface DocumentInfo {
  name: string
  size: number
  type: string
  uploaded_at: string
  status: string
}

export default function KnowledgeSection() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>("")
  const [ingestionStatus, setIngestionStatus] = useState<IngestionStatus | null>(null)
  const [documents, setDocuments] = useState<DocumentInfo[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    loadIngestionStatus()
    loadDocuments()
  }, [])

  const loadIngestionStatus = async () => {
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch("http://localhost:8000/api/v1/ingest/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setIngestionStatus(data)
      }
    } catch (error) {
      console.log("[v0] Failed to load ingestion status:", error)
    }
  }

  const loadDocuments = async () => {
    const mockDocuments: DocumentInfo[] = [
      {
        name: "brand-guidelines.pdf",
        size: 2048000,
        type: "PDF",
        uploaded_at: new Date().toISOString(),
        status: "processed",
      },
      {
        name: "marketing-strategy.docx",
        size: 1024000,
        type: "DOCX",
        uploaded_at: new Date().toISOString(),
        status: "processing",
      },
    ]
    setDocuments(mockDocuments)
  }

  const handleFileUpload = async () => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadStatus("Subiendo documentos...")
    setUploadProgress(0)

    try {
      const token = localStorage.getItem("access_token")
      const formData = new FormData()

      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i])
      }

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch("http://localhost:8000/api/v1/ingest", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        setUploadStatus("Documentos subidos exitosamente")
        setFiles(null)
        loadIngestionStatus()
        loadDocuments()
      } else {
        setUploadStatus("Error al subir documentos")
      }
    } catch (error) {
      console.log("[v0] Failed to upload documents:", error)
      setUploadStatus("Error de conexión")
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }

  const clearKnowledgeBase = async () => {
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch("http://localhost:8000/api/v1/ingest/clear", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setUploadStatus("Base de conocimiento limpiada")
        loadIngestionStatus()
        setDocuments([])
      }
    } catch (error) {
      console.log("[v0] Failed to clear knowledge base:", error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Gestión de Conocimiento</h2>
        <p className="text-muted-foreground">
          Sube y gestiona documentos para que Erasmo pueda aprender sobre tu marca y negocio
        </p>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Subir Documentos</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Documentos</span>
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Estado</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Subir Nuevos Documentos</span>
              </CardTitle>
              <CardDescription>
                Sube archivos PDF, TXT, DOCX para entrenar a Erasmo con información específica de tu negocio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="files">Seleccionar archivos</Label>
                <Input
                  id="files"
                  type="file"
                  multiple
                  accept=".pdf,.txt,.docx,.doc,.md"
                  onChange={(e) => setFiles(e.target.files)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos soportados: PDF, TXT, DOCX, DOC, MD. Tamaño máximo: 10MB por archivo.
                </p>
              </div>

              {files && files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{files.length} archivo(s) seleccionado(s):</p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {Array.from(files).map((file, index) => (
                      <div key={index} className="flex items-center justify-between text-sm bg-muted p-2 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <Badge variant="secondary">{formatFileSize(file.size)}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso de subida</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}

              <Button
                onClick={handleFileUpload}
                disabled={!files || files.length === 0 || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Documentos
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Documentos Subidos</span>
              </CardTitle>
              <CardDescription>Lista de todos los documentos en la base de conocimiento</CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(doc.size)} • {doc.type} • {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={doc.status === "processed" ? "default" : "secondary"}>
                          {doc.status === "processed" ? "Procesado" : "Procesando"}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay documentos subidos aún</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Estado de la Base de Conocimiento</span>
                </CardTitle>
                <CardDescription>Información sobre los documentos procesados</CardDescription>
              </CardHeader>
              <CardContent>
                {ingestionStatus ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Estado:</span>
                        <Badge variant={ingestionStatus.status === "ready" ? "default" : "secondary"}>
                          {ingestionStatus.status === "ready" ? "Listo" : "Procesando"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Documentos:</span>
                        <span className="text-sm font-medium">{ingestionStatus.documents_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Última actualización:</span>
                        <span className="text-sm font-medium">
                          {new Date(ingestionStatus.last_updated).toLocaleDateString()}
                        </span>
                      </div>
                      {ingestionStatus.total_size && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Tamaño total:</span>
                          <span className="text-sm font-medium">{formatFileSize(ingestionStatus.total_size)}</span>
                        </div>
                      )}
                    </div>

                    {ingestionStatus.processing_progress && ingestionStatus.processing_progress < 100 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progreso de procesamiento</span>
                          <span>{ingestionStatus.processing_progress}%</span>
                        </div>
                        <Progress value={ingestionStatus.processing_progress} className="w-full" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay datos de estado disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HardDrive className="h-5 w-5" />
                  <span>Acciones de Gestión</span>
                </CardTitle>
                <CardDescription>Operaciones de mantenimiento de la base de conocimiento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" onClick={loadIngestionStatus} className="w-full bg-transparent">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar Estado
                </Button>

                <Button variant="outline" onClick={loadDocuments} className="w-full bg-transparent">
                  <FileText className="h-4 w-4 mr-2" />
                  Recargar Lista de Documentos
                </Button>

                <div className="pt-4 border-t">
                  <Button variant="destructive" onClick={clearKnowledgeBase} className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpiar Base de Conocimiento
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Esta acción eliminará todos los documentos y no se puede deshacer
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {uploadStatus && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div
              className={`flex items-center space-x-2 text-sm ${
                uploadStatus.includes("Error") ? "text-destructive" : "text-green-600"
              }`}
            >
              {uploadStatus.includes("Error") ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <span>{uploadStatus}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
