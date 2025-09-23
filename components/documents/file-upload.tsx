"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, File, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  acceptedFileTypes?: string[]
  maxFileSize?: number
}

export function FileUpload({
  onFilesSelected,
  maxFiles = 10,
  acceptedFileTypes = [".pdf", ".txt", ".docx", ".md"],
  maxFileSize = 10 * 1024 * 1024, // 10MB
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const { toast } = useToast()

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        toast({
          title: "Archivos rechazados",
          description: `${rejectedFiles.length} archivo(s) no cumplen los requisitos`,
          variant: "destructive",
        })
      }

      const newFiles = [...selectedFiles, ...acceptedFiles].slice(0, maxFiles)
      setSelectedFiles(newFiles)
      onFilesSelected(newFiles)
    },
    [selectedFiles, maxFiles, onFilesSelected, toast],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/markdown": [".md"],
    },
    maxSize: maxFileSize,
    maxFiles: maxFiles - selectedFiles.length,
  })

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    onFilesSelected(newFiles)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary hover:bg-muted/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-lg font-medium">Suelta los archivos aquí...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">Arrastra archivos aquí o haz clic para seleccionar</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Máximo {maxFiles} archivos, hasta {formatFileSize(maxFileSize)} cada uno
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {acceptedFileTypes.map((type) => (
                    <Badge key={type} variant="outline">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Archivos seleccionados ({selectedFiles.length})</h3>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                  <File className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => removeFile(index)} className="h-6 w-6 p-0">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
