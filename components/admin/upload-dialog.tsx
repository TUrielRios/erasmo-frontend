"use client"

import type React from "react"
import { useState, useEffect } from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { X } from "lucide-react"
import { getAuthToken } from "@/lib/auth"

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: {
    category: string
    description: string
    priority: number
    files: File[]
    useProtocol: boolean
    protocolId: number | null
  }
  setForm: (form: any) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
}

interface Protocol {
  id: number
  name: string
  version: string
  category: string
}

export function UploadDialog({ open, onOpenChange, form, setForm, onSubmit, loading }: UploadDialogProps) {
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [loadingProtocols, setLoadingProtocols] = useState(false)

  useEffect(() => {
    if (open) {
      fetchProtocols()
    }
  }, [open])

  const fetchProtocols = async () => {
    setLoadingProtocols(true)
    try {
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/protocols/?active_only=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProtocols(data)
      }
    } catch (error) {
      console.error("Error fetching protocols:", error)
    } finally {
      setLoadingProtocols(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm({ ...form, files: Array.from(e.target.files) })
    }
  }

  const removeFile = (index: number) => {
    const newFiles = form.files.filter((_, i) => i !== index)
    setForm({ ...form, files: newFiles })
  }

  const isSubmitDisabled = () => {
    if (loading) return true
    if (form.useProtocol) {
      return !form.protocolId
    }
    return form.files.length === 0
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subir documentos</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Source Type */}
          <div>
            <Label>Tipo de contenido</Label>
            <RadioGroup
              value={form.useProtocol ? "protocol" : "file"}
              onValueChange={(value) =>
                setForm({
                  ...form,
                  useProtocol: value === "protocol",
                  files: value === "protocol" ? [] : form.files,
                  protocolId: value === "file" ? null : form.protocolId,
                })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="file" id="file" />
                <Label htmlFor="file" className="cursor-pointer font-normal">
                  Subir archivo individual
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="protocol" id="protocol" />
                <Label htmlFor="protocol" className="cursor-pointer font-normal">
                  Usar protocolo centralizado
                </Label>
              </div>
            </RadioGroup>
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

          {/* Protocol Selection */}
          {form.useProtocol ? (
            <div>
              <Label>Protocolo</Label>
              <Select
                value={form.protocolId?.toString()}
                onValueChange={(value) => setForm({ ...form, protocolId: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingProtocols ? "Cargando..." : "Selecciona un protocolo"} />
                </SelectTrigger>
                <SelectContent>
                  {protocols.map((protocol) => (
                    <SelectItem key={protocol.id} value={protocol.id.toString()}>
                      {protocol.name} ({protocol.version})
                      {protocol.category && ` - ${protocol.category}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {protocols.length === 0 && !loadingProtocols && (
                <p className="text-xs text-yellow-600 mt-1">
                  No hay protocolos disponibles. Crea uno primero en la sección Protocolos.
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Al seleccionar un protocolo, el contenido se cargará desde la biblioteca centralizada
              </p>
            </div>
          ) : (
            /* File Upload */
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
              <p className="text-xs text-muted-foreground mt-1">Solo archivos .txt</p>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitDisabled()} className="bg-[#0000FF] hover:bg-[#0000DD]">
              {loading ? "Guardando..." : form.useProtocol ? "Vincular Protocolo" : "Subir"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
