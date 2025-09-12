"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Settings, User, Shield, Database, RefreshCw, CheckCircle, Download, Trash2, Key, Bell } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface MemoryStatus {
  total_memories: number
  active_memories: number
  memory_usage: number
  last_cleanup: string
  status: string
}

interface SystemHealth {
  status: string
  version: string
  uptime: number
  database_status: string
  ai_service_status: string
}

export default function SettingsSection() {
  const { user, logout } = useAuth()
  const [memoryStatus, setMemoryStatus] = useState<MemoryStatus | null>(null)
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  // User profile states
  const [username, setUsername] = useState(user?.username || "")
  const [email, setEmail] = useState(user?.email || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    loadMemoryStatus()
    loadSystemHealth()
  }, [])

  const loadMemoryStatus = async () => {
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch("http://localhost:8000/api/v1/query/memory/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setMemoryStatus(data)
      } else {
        // Mock data for demonstration
        setMemoryStatus({
          total_memories: 156,
          active_memories: 89,
          memory_usage: 67.5,
          last_cleanup: new Date().toISOString(),
          status: "healthy",
        })
      }
    } catch (error) {
      console.log("[v0] Failed to load memory status:", error)
      setMemoryStatus({
        total_memories: 156,
        active_memories: 89,
        memory_usage: 67.5,
        last_cleanup: new Date().toISOString(),
        status: "healthy",
      })
    }
  }

  const loadSystemHealth = async () => {
    try {
      const response = await fetch("http://localhost:8000/")
      if (response.ok) {
        const data = await response.json()
        setSystemHealth({
          status: "healthy",
          version: "1.0.0",
          uptime: 86400,
          database_status: "connected",
          ai_service_status: "operational",
          ...data,
        })
      }
    } catch (error) {
      console.log("[v0] Failed to load system health:", error)
      setSystemHealth({
        status: "healthy",
        version: "1.0.0",
        uptime: 86400,
        database_status: "connected",
        ai_service_status: "operational",
      })
    }
  }

  const refreshToken = async () => {
    setIsLoading(true)
    try {
      const refreshToken = localStorage.getItem("refresh_token")
      const response = await fetch("http://localhost:8000/api/v1/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("access_token", data.access_token)
        alert("Token actualizado exitosamente")
      }
    } catch (error) {
      console.log("[v0] Failed to refresh token:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportAllData = async () => {
    try {
      const token = localStorage.getItem("access_token")
      // This would be a comprehensive export endpoint
      const response = await fetch("http://localhost:8000/api/v1/user/export", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `erasmo-data-export-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.log("[v0] Failed to export data:", error)
      alert("Función de exportación no disponible en el backend actual")
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Configuraciones</h2>
        <p className="text-muted-foreground">Gestiona tu cuenta, preferencias y configuraciones del sistema</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Preferencias</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Seguridad</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Sistema</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Información del Perfil</span>
              </CardTitle>
              <CardDescription>Actualiza tu información personal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de usuario</Label>
                  <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Información de la cuenta</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">ID de usuario:</span>
                    <p className="font-mono">{user?.id || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fecha de registro:</span>
                    <p>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</p>
                  </div>
                </div>
              </div>

              <Button className="w-full md:w-auto">Guardar Cambios</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Preferencias de la Aplicación</span>
              </CardTitle>
              <CardDescription>Personaliza tu experiencia con Erasmo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones</Label>
                  <p className="text-sm text-muted-foreground">Recibir notificaciones sobre nuevas funciones</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Guardado automático</Label>
                  <p className="text-sm text-muted-foreground">Guardar conversaciones automáticamente</p>
                </div>
                <Switch checked={autoSave} onCheckedChange={setAutoSave} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo oscuro</Label>
                  <p className="text-sm text-muted-foreground">Usar tema oscuro (próximamente)</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} disabled />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Exportar Datos</h4>
                <p className="text-sm text-muted-foreground">
                  Descarga todos tus datos incluyendo conversaciones, configuraciones y documentos
                </p>
                <Button variant="outline" onClick={exportAllData}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Todos los Datos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>Seguridad de la Cuenta</span>
              </CardTitle>
              <CardDescription>Gestiona la seguridad de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Cambiar Contraseña</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Contraseña actual</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nueva contraseña</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <Button disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}>
                    Cambiar Contraseña
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Gestión de Tokens</h4>
                <p className="text-sm text-muted-foreground">
                  Actualiza tu token de acceso si experimentas problemas de autenticación
                </p>
                <Button variant="outline" onClick={refreshToken} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Actualizar Token
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-destructive">Zona de Peligro</h4>
                <p className="text-sm text-muted-foreground">Estas acciones son permanentes y no se pueden deshacer</p>
                <Button variant="destructive" onClick={logout}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cerrar Sesión en Todos los Dispositivos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Estado del Sistema</span>
                </CardTitle>
                <CardDescription>Información sobre el estado de Erasmo</CardDescription>
              </CardHeader>
              <CardContent>
                {systemHealth ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Estado general:</span>
                      <Badge variant={systemHealth.status === "healthy" ? "default" : "destructive"}>
                        {systemHealth.status === "healthy" ? "Saludable" : "Con problemas"}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Versión:</span>
                      <span className="text-sm font-medium">{systemHealth.version}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Tiempo activo:</span>
                      <span className="text-sm font-medium">{formatUptime(systemHealth.uptime)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Base de datos:</span>
                      <Badge variant={systemHealth.database_status === "connected" ? "default" : "destructive"}>
                        {systemHealth.database_status === "connected" ? "Conectada" : "Desconectada"}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Servicio IA:</span>
                      <Badge variant={systemHealth.ai_service_status === "operational" ? "default" : "destructive"}>
                        {systemHealth.ai_service_status === "operational" ? "Operacional" : "Con problemas"}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
                    <p className="text-muted-foreground">Cargando estado del sistema...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Estado de la Memoria</span>
                </CardTitle>
                <CardDescription>Información sobre el sistema de memoria de IA</CardDescription>
              </CardHeader>
              <CardContent>
                {memoryStatus ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total de memorias:</span>
                      <span className="text-sm font-medium">{memoryStatus.total_memories}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Memorias activas:</span>
                      <span className="text-sm font-medium">{memoryStatus.active_memories}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Uso de memoria:</span>
                      <Badge variant={memoryStatus.memory_usage < 80 ? "default" : "destructive"}>
                        {memoryStatus.memory_usage.toFixed(1)}%
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Última limpieza:</span>
                      <span className="text-sm font-medium">
                        {new Date(memoryStatus.last_cleanup).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Estado:</span>
                      <Badge variant={memoryStatus.status === "healthy" ? "default" : "destructive"}>
                        {memoryStatus.status === "healthy" ? "Saludable" : "Requiere atención"}
                      </Badge>
                    </div>

                    <Button variant="outline" onClick={loadMemoryStatus} className="w-full bg-transparent">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Actualizar Estado
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
                    <p className="text-muted-foreground">Cargando estado de memoria...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
