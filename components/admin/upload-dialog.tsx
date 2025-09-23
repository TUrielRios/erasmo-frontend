"use client"
import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface UploadForm {
  category: string
  description: string
  priority: number
  files: File[]
}

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: UploadForm
  setForm: React.Dispatch<React.SetStateAction<UploadForm>>
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
}

export const UploadDialog: React.FC<UploadDialogProps> = ({ open, onOpenChange, form, setForm, onSubmit, loading }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Subir Documentos</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
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

          <div>
            <Label>Archivos (.txt)</Label>
            <Input
              type="file"
              multiple
              accept=".txt"
              onChange={(e) => setForm((prev) => ({ ...prev, files: Array.from(e.target.files || []) }))}
            />
            {form.files.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">{form.files.length} archivo(s) seleccionado(s)</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || form.files.length === 0}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                "Subir"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
