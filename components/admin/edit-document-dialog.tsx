"use client"
import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import type { Document } from "@/hooks/use-admin-api"

interface EditForm {
  description: string
  priority: number
  category: string
  is_active: boolean
}

interface EditDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: Document | null
  form: EditForm
  setForm: React.Dispatch<React.SetStateAction<EditForm>>
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
}

export const EditDocumentDialog: React.FC<EditDocumentDialogProps> = ({
  open,
  onOpenChange,
  document,
  form,
  setForm,
  onSubmit,
  loading,
}) => {
  if (!document) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Documento</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Nombre del archivo</Label>
            <Input value={document.filename} disabled />
          </div>

          <div>
            <Label>Categoría</Label>
            <Select value={form.category} onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="knowledge_base">Base de Conocimiento</SelectItem>
                <SelectItem value="instructions">Instrucciones</SelectItem>
                <SelectItem value="company_info">Información de la Empresa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Descripción</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción del documento..."
              rows={3}
            />
          </div>

          <div>
            <Label>Prioridad (1-5)</Label>
            <Select
              value={form.priority.toString()}
              onValueChange={(value) => setForm((prev) => ({ ...prev, priority: Number.parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Muy Alta</SelectItem>
                <SelectItem value="2">2 - Alta</SelectItem>
                <SelectItem value="3">3 - Media</SelectItem>
                <SelectItem value="4">4 - Baja</SelectItem>
                <SelectItem value="5">5 - Muy Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.is_active}
              onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
              className="rounded"
            />
            <Label htmlFor="isActive">Documento activo</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
