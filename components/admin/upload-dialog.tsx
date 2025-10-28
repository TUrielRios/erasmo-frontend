"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: {
    category: string
    description: string
    priority: number
    files: File[]
  }
  setForm: (form: any) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
}

export function UploadDialog({ open, onOpenChange, form, setForm, onSubmit, loading }: UploadDialogProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm({ ...form, files: Array.from(e.target.files) })
    }
  }

  const removeFile = (index: number) => {
    const newFiles = form.files.filter((_, i) => i !== index)
    setForm({ ...form, files: newFiles })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Subir documentos</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Categoría</Label>
            <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="knowledge_base">Base de conocimiento</SelectItem>
                <SelectItem value="instructions">Instrucciones</SelectItem>
                <SelectItem value="company_info">Información de empresa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Descripción</Label>
            <Textarea
              placeholder="Descripción del documento..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label>Prioridad (1-5)</Label>
            <Select
              value={form.priority.toString()}
              onValueChange={(value) => setForm({ ...form, priority: Number.parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1: Muy Alta</SelectItem>
                <SelectItem value="2">2: Alta</SelectItem>
                <SelectItem value="3">3: Media</SelectItem>
                <SelectItem value="4">4: Baja</SelectItem>
                <SelectItem value="5">5: Muy Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Archivos</Label>
            <Input type="file" multiple accept=".txt" onChange={handleFileChange} className="mt-1" />
            {form.files.length > 0 && (
              <div className="mt-2 space-y-1">
                {form.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                    <span className="truncate">{file.name}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Elegir archivos. Sin archivos seleccionados</p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || form.files.length === 0}
              className="bg-[#0000FF] hover:bg-[#0000DD]"
            >
              {loading ? "Subiendo..." : "Subir"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
