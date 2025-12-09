"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { AdminLayout } from "@/components/admin/admin-layout"
import { getAuthToken } from "@/lib/auth"
import { ArrowLeft } from "lucide-react"

export default function ProtocolFormPage() {
    const router = useRouter()
    const params = useParams()
    const protocolId = params?.id as string | undefined
    const isEdit = protocolId && protocolId !== "new"

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        content: "",
        version: "v1",
        category: "",
        is_active: true,
    })
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(isEdit)

    useEffect(() => {
        if (isEdit) {
            fetchProtocol()
        }
    }, [protocolId])

    const fetchProtocol = async () => {
        try {
            const token = getAuthToken()
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/protocols/${protocolId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setFormData({
                    name: data.name,
                    description: data.description || "",
                    content: data.content,
                    version: data.version,
                    category: data.category || "",
                    is_active: data.is_active,
                })
            }
        } catch (error) {
            console.error("Error fetching protocol:", error)
        } finally {
            setIsFetching(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const token = getAuthToken()
            const url = isEdit
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/protocols/${protocolId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/protocols/`

            const response = await fetch(url, {
                method: isEdit ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                alert(isEdit ? "Protocolo actualizado exitosamente" : "Protocolo creado exitosamente")
                router.push("/admin/protocols")
            } else {
                const error = await response.json()
                alert(`Error: ${error.detail || "Error al guardar protocolo"}`)
            }
        } catch (error) {
            console.error("Error saving protocol:", error)
            alert("Error al guardar protocolo")
        } finally {
            setIsLoading(false)
        }
    }

    if (isFetching) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Cargando protocolo...</div>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            {isEdit ? "Editar Protocolo" : "Nuevo Protocolo"}
                        </h1>
                        <p className="text-muted-foreground">
                            {isEdit
                                ? "Actualizar este protocolo afectará a todos los sub-agentes que lo usan"
                                : "Crea un protocolo reutilizable para múltiples sub-agentes"}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información del Protocolo</CardTitle>
                        <CardDescription>Todos los campos son obligatorios excepto descripción y categoría</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Nombre del Protocolo <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Ej: Protocolo Ventas v2"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Input
                                    id="description"
                                    placeholder="Breve descripción del protocolo"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            {/* Version & Category */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="version">
                                        Versión <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="version"
                                        placeholder="v1"
                                        value={formData.version}
                                        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Categoría</Label>
                                    <Input
                                        id="category"
                                        placeholder="Ej: ventas, soporte, marketing"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                                <Label htmlFor="content">
                                    Contenido del Protocolo <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="content"
                                    placeholder="Escribe las instrucciones del protocolo aquí..."
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows={15}
                                    required
                                    className="font-mono text-sm"
                                />
                                <p className="text-sm text-muted-foreground">
                                    Este contenido será usado por todos los sub-agentes que referencien este protocolo
                                </p>
                            </div>

                            {/* Is Active */}
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_active"
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                />
                                <Label htmlFor="is_active" className="cursor-pointer">
                                    Protocolo activo
                                </Label>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end space-x-4">
                                <Button type="button" variant="outline" onClick={() => router.back()}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Guardando..." : isEdit ? "Actualizar Protocolo" : "Crear Protocolo"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
}
