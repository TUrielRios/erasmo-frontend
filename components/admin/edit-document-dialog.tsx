"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { Document } from "@/hooks/use-admin-api"

interface EditDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: Document | null
  form: {
    description: string
    priority: number
    category: string
    is_active: boolean
  }
  setForm: (form: any) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
}

export function EditDocumentDialog({
  open,
  onOpenChange,
  document,
  form,
  setForm,
  onSubmit,
  loading,
}: EditDocumentDialogProps) {
  if (!document) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar documento</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Archivo</Label>
            <p className="text-sm text-muted-foreground mt-1">{document.filename}</p>
          </div>

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

          <div className="flex items-center justify-between">
            <Label>Activo</Label>
            <Switch checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#0000FF] hover:bg-[#0000DD]">
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
