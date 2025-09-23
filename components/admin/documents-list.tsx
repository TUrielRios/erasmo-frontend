"use client"
import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Upload, FileText, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import type { Document } from "@/hooks/use-admin-api"

interface DocumentsListProps {
  documents: Document[] | null
  loading: boolean
  onUpload: () => void
  onEdit: (document: Document) => void
  onDelete: (documentId: string) => void
}

export const DocumentsList: React.FC<DocumentsListProps> = ({ documents, loading, onUpload, onEdit, onDelete }) => {
  const [showMenuForDoc, setShowMenuForDoc] = useState<string | null>(null)
  const documentsArray = Array.isArray(documents) ? documents : []

  const handleToggleMenu = (docId: string) => {
    console.log("🔵 Botón clickeado para documento:", docId)
    setShowMenuForDoc(showMenuForDoc === docId ? null : docId)
  }

  const handleEdit = (doc: Document) => {
    console.log("✏️ EDIT CLICKED:", doc.filename)
    setShowMenuForDoc(null)
    onEdit(doc)
  }

  const handleDelete = (docId: string) => {
    console.log("🗑️ DELETE CLICKED:", docId)
    setShowMenuForDoc(null)
    onDelete(docId)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Documentos ({documentsArray.length})
          <Button size="sm" onClick={onUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Subir
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {documentsArray.map((doc) => (
              <div key={doc.id} className="relative flex items-center justify-between p-3 border rounded-lg bg-white">
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-medium truncate">{doc.filename}</h5>
                  <p className="text-xs text-gray-500">
                    {doc.category} • Prioridad {doc.priority}
                  </p>
                </div>
                
                <div className="relative">
                  {/* Botón de tres puntos */}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleToggleMenu(doc.id)}
                    className="ml-2 h-8 w-8 p-0"
                    type="button"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>

                  {/* Menú manual */}
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

            {documentsArray.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No hay documentos</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}