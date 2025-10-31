"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload, MoreHorizontal, Trash2, Edit } from "lucide-react"
import { Loader2 } from "lucide-react"
import type { Document } from "@/hooks/use-admin-api"

interface DocumentsListProps {
  documents: Document[]
  loading: boolean
  onUpload: () => void
  onEdit: (doc: Document) => void
  onDelete: (docId: number) => void
}

export function DocumentsList({ documents, loading, onUpload, onEdit, onDelete }: DocumentsListProps) {
  const [showMenuForDoc, setShowMenuForDoc] = useState<number | null>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      knowledge_base: "Base de conocimiento",
      instructions: "Instrucciones",
      company_info: "Información de empresa",
    }
    return labels[category] || category
  }

  const handleToggleMenu = (docId: number) => {
    console.log("🔵 Botón clickeado para documento:", docId)
    setShowMenuForDoc(showMenuForDoc === docId ? null : docId)
  }

  const handleEdit = (doc: Document) => {
    console.log("✏️ EDIT CLICKED:", doc.filename)
    setShowMenuForDoc(null)
    onEdit(doc)
  }

  const handleDelete = (docId: number) => {
    console.log("🗑️ DELETE CLICKED:", docId)
    setShowMenuForDoc(null)
    onDelete(docId)
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-[#0000FF] text-base">Documentos</CardTitle>
        <Button size="sm" onClick={onUpload} className="bg-[#0000FF] hover:bg-[#0000DD] text-xs">
          <Upload className="h-3 w-3 mr-1" />
          Subir
        </Button>
      </CardHeader>
      <CardContent>
        {loading && documents.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">No hay documentos cargados</div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate text-gray-900">{doc.filename}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs text-gray-600 border-gray-300">
                        {getCategoryLabel(doc.category)}
                      </Badge>
                      <span className="text-xs text-gray-500">{formatFileSize(doc.file_size)}</span>
                    </div>
                  </div>
                </div>

                {/* Menú manual como en el código anterior */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleMenu(doc.id)}
                    className="ml-2 h-8 w-8 p-0"
                    type="button"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>

                  {showMenuForDoc === doc.id && (
                    <div className="absolute right-0 top-8 z-50 min-w-[160px] bg-white border border-gray-200 rounded-md shadow-lg">
                      <div className="py-1">
                        <button
                          onClick={() => handleEdit(doc)}
                          className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}