"use client"

import type React from "react"
import { useRef } from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Upload } from "lucide-react"

interface EditProtocolDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    form: {
        name: string
        description: string
        content: string
        version: string
        category: string
        is_active: boolean
    }
    setForm: (form: any) => void
    onSubmit: (e: React.FormEvent) => void
    loading: boolean
}

export function EditProtocolDialog({
    open,
    onOpenChange,
    form,
    setForm,
    onSubmit,
    loading,
}: EditProtocolDialogProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.name.endsWith(".txt")) {
            alert("Solo se permiten archivos .txt")
            return
        }

        try {
            const text = await file.text()
            setForm({ ...form, content: text })
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        } catch (error) {
            console.error("Error reading file:", error)
            alert("Error al leer el archivo")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Protocolo Centralizado</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="edit-proto-name">
                            Nombre del Protocolo <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="edit-proto-name"
                            placeholder="Ej: Protocolo Ventas v2"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="edit-proto-version">
                                Versión <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit-proto-version"
                                placeholder="v1"
                                value={form.version}
                                onChange={(e) => setForm({ ...form, version: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="edit-proto-category">Categoría</Label>
                            <Input
                                id="edit-proto-category"
                                placeholder="Ej: ventas, soporte, marketing"
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="edit-proto-description">Descripción</Label>
                        <Textarea
                            id="edit-proto-description"
                            placeholder="Breve descripción del protocolo..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={2}
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="edit-proto-content">
                                Contenido del Protocolo <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex items-center space-x-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".txt"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="edit-proto-file-upload"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="h-3 w-3 mr-2" />
                                    Cargar desde .txt
                                </Button>
                            </div>
                        </div>
                        <Textarea
                            id="edit-proto-content"
                            placeholder="Escribe las instrucciones del protocolo aquí o carga un archivo .txt..."
                            value={form.content}
                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                            rows={12}
                            required
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Este contenido será usado por todos los sub-agentes que referencien este protocolo
                        </p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="edit-proto-is_active"
                            checked={form.is_active}
                            onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                        />
                        <Label htmlFor="edit-proto-is_active" className="cursor-pointer">
                            Protocolo activo
                        </Label>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-[#0000FF] hover:bg-[#0000DD]">
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
