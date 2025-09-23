"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { FileUpload } from "./file-upload"
import { documentService, type PersonalityConfig } from "@/lib/documents"
import { useToast } from "@/hooks/use-toast"
import { Brain, Trash2, Upload, Loader2 } from "lucide-react"
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

export function PersonalityManager() {
  const [personalityConfig, setPersonalityConfig] = useState<PersonalityConfig | null>(null)
  const [personalityType, setPersonalityType] = useState("")
  const [description, setDescription] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadPersonalityConfig()
  }, [])

  const loadPersonalityConfig = async () => {
    try {
      const config = await documentService.getPersonalityConfig()
      setPersonalityConfig(config)
      setPersonalityType(config.personality_type)
      setDescription(config.description)
    } catch (error) {
      // No personality config exists yet
      setPersonalityConfig(null)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!personalityType.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un tipo de personalidad",
        variant: "destructive",
      })
      return
    }

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
      const response = await documentService.ingestPersonalityDocuments(selectedFiles, personalityType)
      toast({
        title: "Éxito",
        description: `${response.documents_processed} documentos de personalidad procesados`,
      })
      setSelectedFiles([])
      await loadPersonalityConfig()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al procesar documentos de personalidad",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleClearPersonality = async () => {
    try {
      await documentService.clearPersonalityConfig()
      toast({
        title: "Éxito",
        description: "Configuración de personalidad eliminada",
      })
      setPersonalityConfig(null)
      setPersonalityType("")
      setDescription("")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la configuración de personalidad",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Cargando configuración de personalidad...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {personalityConfig && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle>Personalidad Actual</CardTitle>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar configuración de personalidad?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción eliminará permanentemente la configuración de personalidad y todos los documentos
                      asociados. No se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearPersonality}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Tipo de Personalidad</Label>
                <p className="text-lg font-semibold">{personalityConfig.personality_type}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Descripción</Label>
                <p className="text-muted-foreground">{personalityConfig.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary">{personalityConfig.documents_count} documentos</Badge>
                <Badge variant="outline">
                  Actualizado: {new Date(personalityConfig.last_updated).toLocaleDateString()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{personalityConfig ? "Actualizar Personalidad" : "Configurar Personalidad de IA"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="personality-type">Tipo de Personalidad</Label>
              <Input
                id="personality-type"
                value={personalityType}
                onChange={(e) => setPersonalityType(e.target.value)}
                placeholder="ej: Asistente Profesional, Experto Técnico..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (Opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el comportamiento deseado de la IA..."
                className="min-h-[80px]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Documentos de Personalidad</Label>
            <FileUpload
              onFilesSelected={setSelectedFiles}
              maxFiles={5}
              acceptedFileTypes={[".pdf", ".txt", ".docx", ".md"]}
            />
          </div>

          <Button onClick={handleUpload} disabled={uploading || selectedFiles.length === 0} className="w-full">
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Procesando documentos...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {personalityConfig ? "Actualizar Personalidad" : "Configurar Personalidad"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
