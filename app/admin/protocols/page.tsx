"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileCode, Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Users } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { getAuthToken } from "@/lib/auth"
import { CreateProtocolDialog } from "@/components/admin/create-protocol-dialog"
import { useAdminApi } from "@/hooks/use-admin-api"
import { useToast } from "@/components/ui/use-toast"

interface Protocol {
    id: number
    name: string
    description: string
    version: string
    category: string
    usage_count: number
    is_active: boolean
    created_at: string
    updated_at: string
}

export default function ProtocolsPage() {
    const [protocols, setProtocols] = useState<Protocol[]>([])
    const [filteredProtocols, setFilteredProtocols] = useState<Protocol[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [newProtocol, setNewProtocol] = useState({
        name: "",
        description: "",
        content: "",
        version: "v1",
        category: "",
        is_active: true
    })

    const router = useRouter()
    const { createProtocol, loading: creatingProtocol } = useAdminApi()
    const { toast } = useToast()

    useEffect(() => {
        fetchProtocols()
    }, [])

    const fetchProtocols = async () => {
        try {
            const token = getAuthToken()
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/protocols/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setProtocols(data)
                setFilteredProtocols(data)
            }
        } catch (error) {
            console.error("Error fetching protocols:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const filtered = protocols.filter(
            (protocol) =>
                protocol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                protocol.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                protocol.category?.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        setFilteredProtocols(filtered)
    }, [searchTerm, protocols])

    const handleCreateProtocol = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const result = await createProtocol(newProtocol)

            if (result) {
                toast({
                    title: "Protocolo creado",
                    description: "El protocolo ha sido creado correctamente",
                })
                setCreateDialogOpen(false)
                setNewProtocol({
                    name: "",
                    description: "",
                    content: "",
                    version: "v1",
                    category: "",
                    is_active: true
                })
                fetchProtocols()
            } else {
                toast({
                    title: "Error",
                    description: "No se pudo crear el protocolo",
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error("Error creating protocol:", error)
            toast({
                title: "Error",
                description: "Ocurrió un error al crear el protocolo",
                variant: "destructive"
            })
        }
    }

    const handleDelete = async (protocolId: number, usageCount: number) => {
        const force = usageCount > 0
        const confirmMessage = force
            ? `Este protocolo está siendo usado por ${usageCount} sub-agentes. ¿Eliminar de todas formas? Esto desvinculará todos los documentos.`
            : "¿Estás seguro de eliminar este protocolo?"

        if (!confirm(confirmMessage)) return

        try {
            const token = getAuthToken()
            const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/protocols/${protocolId}${force ? "?force=true" : ""}`
            const response = await fetch(url, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.ok) {
                setProtocols((prev) => prev.filter((p) => p.id !== protocolId))
                alert("Protocolo eliminado exitosamente")
            }
        } catch (error) {
            console.error("Error deleting protocol:", error)
            alert("Error al eliminar protocolo")
        }
    }

    const handleViewUsage = async (protocolId: number) => {
        try {
            const token = getAuthToken()
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/protocols/${protocolId}/usage`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                const companies = data.usage_by_company || []
                const message =
                    companies.length > 0
                        ? `Este protocolo es usado por:\n\n${companies.map((c: any) => `• ${c.company_name}: ${c.documents.length} documentos`).join("\n")}`
                        : "Este protocolo no está siendo usado actualmente"

                alert(message)
            }
        } catch (error) {
            console.error("Error fetching usage:", error)
        }
    }

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Cargando protocolos...</div>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Protocolos Centralizados</h1>
                        <p className="text-muted-foreground">Gestiona protocolos reutilizables para múltiples sub-agentes</p>
                    </div>
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Protocolo
                    </Button>
                </div>

                {/* Search */}
                <Card>
                    <CardHeader>
                        <CardTitle>Buscar Protocolos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre, descripción o categoría..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-sm"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Protocols Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Biblioteca de Protocolos ({filteredProtocols.length})</CardTitle>
                        <CardDescription>
                            Actualizar un protocolo afecta automáticamente a todos los sub-agentes que lo usan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredProtocols.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                {searchTerm ? "No se encontraron protocolos" : "No hay protocolos creados aún"}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Categoría</TableHead>
                                        <TableHead>Versión</TableHead>
                                        <TableHead>Uso</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Creado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProtocols.map((protocol) => (
                                        <TableRow key={protocol.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <FileCode className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <div className="font-medium">{protocol.name}</div>
                                                        <div className="text-sm text-muted-foreground">{protocol.description}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{protocol.category || "Sin categoría"}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{protocol.version}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <button
                                                    onClick={() => handleViewUsage(protocol.id)}
                                                    className="flex items-center space-x-1 text-sm hover:underline"
                                                >
                                                    <Users className="h-3 w-3" />
                                                    <span>{protocol.usage_count} sub-agentes</span>
                                                </button>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={protocol.is_active ? "default" : "secondary"}>
                                                    {protocol.is_active ? "Activo" : "Inactivo"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{new Date(protocol.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild onPointerDown={(e) => e.stopPropagation()}>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="z-[100]">
                                                        <DropdownMenuItem onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.push(`/admin/protocols/${protocol.id}`);
                                                        }}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Ver Detalles
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.push(`/admin/protocols/${protocol.id}/edit`);
                                                        }}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleViewUsage(protocol.id);
                                                            }}
                                                            className="text-blue-600"
                                                        >
                                                            <Users className="h-4 w-4 mr-2" />
                                                            Ver Uso ({protocol.usage_count})
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(protocol.id, protocol.usage_count);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Eliminar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            <CreateProtocolDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                form={newProtocol}
                setForm={setNewProtocol}
                onSubmit={handleCreateProtocol}
                loading={creatingProtocol}
            />
        </AdminLayout>
    )
}


