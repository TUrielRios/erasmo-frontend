"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, Trash2, Brain, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function KnowledgeManager() {
  const [files, setFiles] = useState<File[]>([])
  const [personality, setPersonality] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles = Array.from(selectedFiles).filter((file) => file.type === "text/plain" || file.name.endsWith(".md"))

    setFiles((prev) => [...prev, ...newFiles])

    setIsUploading(true)
    try {
      const formData = new FormData()
      newFiles.forEach((file) => formData.append("files", file))

      const response = await fetch("/api/v1/ingest", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        console.log("[v0] Files uploaded successfully")
      }
    } catch (error) {
      console.log("[v0] Upload failed:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const updatePersonality = async () => {
    try {
      const response = await fetch("/api/v1/ingest/personality", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ personality }),
      })

      if (response.ok) {
        console.log("[v0] Personality updated successfully")
      }
    } catch (error) {
      console.log("[v0] Failed to update personality:", error)
    }
  }

  const clearKnowledgeBase = async () => {
    try {
      const response = await fetch("/api/v1/ingest/clear", {
        method: "DELETE",
      })

      if (response.ok) {
        setFiles([])
        console.log("[v0] Knowledge base cleared")
      }
    } catch (error) {
      console.log("[v0] Failed to clear knowledge base:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Subir Documentos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Arrastra archivos aquí o haz clic para seleccionar</p>
            <p className="text-sm text-muted-foreground mb-4">Formatos soportados: .txt, .md</p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isUploading ? "Subiendo..." : "Seleccionar Archivos"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,.md"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Archivos cargados:</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{file.name}</span>
                    <Badge variant="secondary">{(file.size / 1024).toFixed(1)} KB</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personality Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Configurar Personalidad</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="personality">Personalidad de Erasmo</Label>
            <Textarea
              id="personality"
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              placeholder="Describe cómo quieres que se comporte Erasmo. Por ejemplo: 'Eres un experto en estrategia de marca con 15 años de experiencia. Respondes de manera profesional pero amigable...'"
              rows={4}
            />
          </div>
          <Button
            onClick={updatePersonality}
            disabled={!personality.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Settings className="h-4 w-4 mr-2" />
            Actualizar Personalidad
          </Button>
        </CardContent>
      </Card>

      {/* Knowledge Base Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trash2 className="h-5 w-5" />
            <span>Gestión de Base de Conocimiento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Limpiar Base de Conocimiento</p>
              <p className="text-sm text-muted-foreground">Elimina todos los documentos y configuraciones</p>
            </div>
            <Button variant="destructive" onClick={clearKnowledgeBase}>
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar Todo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
