"use client"

import type React from "react"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, File, Trash2, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectFile {
  id: number
  project_id: number
  filename: string
  original_filename: string
  file_size: number
  file_type: string
  category: "instructions" | "knowledge_base" | "reference" | "general"
  priority: number
  is_active: boolean
  created_at: string
}

interface FileManagerProps {
  projectId: number | null
  projectFiles: ProjectFile[]
  isLoadingFiles: boolean
  uploadingFiles: any[]
  pendingFiles: File[]
  selectedCategory: "instructions" | "knowledge_base" | "reference" | "general"
  onCategoryChange: (category: "instructions" | "knowledge_base" | "reference" | "general") => void
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemovePendingFile: (index: number) => void
  onConfirmUpload: () => void
  onDeleteFile: (fileId: number) => void
  onClose: () => void
}

const categories = [
  {
    value: "instructions" as const,
    label: "Instrucciones",
    description: "Guías y reglas específicas",
    icon: "📋",
  },
  {
    value: "knowledge_base" as const,
    label: "Conocimiento",
    description: "Información general",
    icon: "📚",
  },
  {
    value: "reference" as const,
    label: "Referencia",
    description: "Documentos de consulta",
    icon: "🔖",
  },
]

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

export function FileManager({
  projectFiles,
  isLoadingFiles,
  uploadingFiles,
  pendingFiles,
  selectedCategory,
  onCategoryChange,
  onFileSelect,
  onRemovePendingFile,
  onConfirmUpload,
  onDeleteFile,
  onClose,
}: FileManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filesByCategory = categories.map((cat) => ({
    ...cat,
    files: projectFiles.filter((f) => f && typeof f === "object" && f.category === cat.value),
  }))

  return (
    <div className="border-b border-border bg-muted/30">
      <div className="p-4 max-w-4xl mx-auto">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Categoría del archivo</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => onCategoryChange(category.value)}
                  className={cn(
                    "p-2 rounded-lg border-2 transition-all text-left",
                    selectedCategory === category.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{category.icon}</span>
                    <span className="font-medium text-xs">{category.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div
            className="p-6 border-2 border-dashed border-border rounded-lg text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground mb-1">Haz clic para subir archivos</p>
            <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, TXT, MD (Max 10MB)</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={onFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.md,.csv,.xlsx"
            />
          </div>

          {pendingFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">
                  Archivos seleccionados ({pendingFiles.length})
                </h4>
                <Button onClick={onConfirmUpload} size="sm" className="flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span>Subir archivos</span>
                </Button>
              </div>
              <div className="space-y-2">
                {pendingFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-2 bg-background rounded-lg border border-border"
                  >
                    <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      onClick={() => onRemovePendingFile(index)}
                      className="p-1 hover:bg-destructive/10 rounded transition-all"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadingFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Subiendo archivos...</h4>
              {uploadingFiles.map((uploadFile) => (
                <div
                  key={uploadFile.id}
                  className="flex items-center space-x-3 p-2 bg-background rounded-lg border border-border"
                >
                  <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                  </div>
                  {uploadFile.status === "uploading" && (
                    <Loader2 className="h-4 w-4 text-primary animate-spin flex-shrink-0" />
                  )}
                  {uploadFile.status === "success" && <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />}
                  {uploadFile.status === "error" && <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />}
                </div>
              ))}
            </div>
          )}

          {isLoadingFiles ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : projectFiles.length > 0 ? (
            <div className="space-y-3">
              {filesByCategory.map(
                (category) =>
                  category.files.length > 0 && (
                    <div key={category.value}>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm">{category.icon}</span>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                          {category.label} ({category.files.length})
                        </h4>
                      </div>
                      <div className="space-y-1">
                        {category.files.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-2 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors group"
                          >
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{file.original_filename}</p>
                                <p className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => onDeleteFile(file.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-all"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
              )}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">No hay archivos en este proyecto</p>
          )}

          <Button variant="ghost" size="sm" onClick={onClose} className="w-full">
            Cerrar gestor de archivos
          </Button>
        </div>
      </div>
    </div>
  )
}
