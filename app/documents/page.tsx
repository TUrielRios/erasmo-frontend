"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUpload } from "@/components/documents/file-upload"
import { DocumentStats } from "@/components/documents/document-stats"
import { PersonalityManager } from "@/components/documents/personality-manager"
import { documentService } from "@/lib/documents"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, Brain, Trash2, ArrowLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function DocumentsPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [clearing, setClearing] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Por favor selecciona al menos un archivo",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      const response = await documentService.ingestDocuments(selectedFiles)
      toast({
        title: "Éxito",
        description: `${response.documents_processed} documentos procesados en ${response.processing_time.toFixed(2)}s`,
      })
      setSelectedFiles([])
      // Refresh stats by reloading the page component
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al procesar documentos",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleClearKnowledgeBase = async () => {
    setClearing(true)
    try {
      await documentService.clearKnowledgeBase()
      toast({
        title: "Éxito",
        description: "Base de conocimiento eliminada",
      })
      // Refresh stats
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la base de conocimiento",
        variant: "destructive",
      })
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Chat
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Gestión de Documentos</h1>
              <p className="text-muted-foreground">Administra tu base de conocimiento y personalidad de IA</p>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar Base de Conocimiento
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar toda la base de conocimiento?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente todos los documentos procesados y fragmentos indexados. No se
                  puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearKnowledgeBase}
                  disabled={clearing}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {clearing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    "Eliminar Todo"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Stats */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Estado de la Base de Conocimiento</h2>
            <DocumentStats />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="upload" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Subir Documentos
              </TabsTrigger>
              <TabsTrigger value="personality" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Personalidad IA
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Subir Documentos a la Base de Conocimiento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FileUpload onFilesSelected={setSelectedFiles} maxFiles={20} />

                  <Button onClick={handleUpload} disabled={uploading || selectedFiles.length === 0} className="w-full">
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Procesando documentos...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Procesar Documentos ({selectedFiles.length})
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="personality" className="space-y-6">
              <PersonalityManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
