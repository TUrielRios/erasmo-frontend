"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Brain, Plus, Search, MessageSquare, MoreHorizontal, Trash2, Edit, LogOut } from "lucide-react"
import { getAuthToken, getUser, logout } from "@/lib/auth"
import { cn } from "@/lib/utils"

interface Conversation {
  id: string
  title: string
  lastMessage: string
  updatedAt: string
  messageCount: number
}

interface ChatSidebarProps {
  activeConversationId: string | null
  onConversationSelect: (id: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

// Get API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export function ChatSidebar({
  activeConversationId,
  onConversationSelect,
  sidebarOpen,
  setSidebarOpen,
}: ChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [userLoading, setUserLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  // Función para verificar autenticación
  const checkAuthentication = (): { user: any } | null => {
    try {
      if (typeof window === "undefined") {
        console.log("[Auth Check] Running on server side, skipping")
        return null
      }

      const currentUser = getUser()
      
      console.log("[Auth Check] User exists:", !!currentUser)
      console.log("[Auth Check] User active:", currentUser?.is_active)
      console.log("[Auth Check] User role:", currentUser?.role)
      
      if (!currentUser) {
        console.error("[Auth Check] No user found in localStorage")
        setAuthError("Sesión expirada. Por favor, inicia sesión nuevamente.")
        return null
      }

      if (!currentUser.is_active) {
        console.error("[Auth Check] User is inactive")
        setAuthError("Usuario inactivo. Contacta al administrador.")
        return null
      }
      
      return { user: currentUser }
    } catch (error) {
      console.error("[Auth Check] Error checking authentication:", error)
      setAuthError("Error al verificar autenticación")
      return null
    }
  }

  // Función para manejar errores de autenticación
  const handleAuthError = (message: string = "Error de autenticación") => {
    console.error("[Auth Error]", message)
    setAuthError(message)
    logout()
    router.push("/login")
  }

  // Efecto para inicializar el cliente y la autenticación
  useEffect(() => {
    setIsClient(true)
    
    if (typeof window === "undefined") {
      return
    }

    const authData = checkAuthentication()
    
    if (!authData?.user) {
      console.log("[Init] No valid user found, redirecting to login")
      handleAuthError("No hay sesión activa")
      return
    }
    
    setUser(authData.user)
    setUserLoading(false)
    setAuthError(null)
    
    console.log("[Init] Authentication successful, user loaded:", authData.user.username)
  }, [router])

  // Efecto para cargar conversaciones
  useEffect(() => {
    if (userLoading || !isClient) return

    const fetchConversations = async () => {
      setIsLoading(true)
      
      try {
        const authData = checkAuthentication()
        
        if (!authData) {
          handleAuthError("Usuario no disponible al cargar conversaciones")
          return
        }

        console.log("[API Call] Fetching conversations for user:", authData.user.username)
        console.log("[API Call] Using API URL:", API_URL)

        const response = await fetch(`${API_URL}/api/v1/chat/conversations?user_id=${authData.user.id}`, {
          headers: {
            "Content-Type": "application/json",
          },
        })

        console.log("[API Call] Response status:", response.status)

        if (response.ok) {
          const data = await response.json()
          console.log("[API Call] Raw conversations data:", data)
          
          // Transformar los datos - USAR session_id como ID principal
          const transformedConversations = (Array.isArray(data) ? data : data.conversations || []).map((conv: any) => ({
            id: conv.session_id, // Usar session_id como id principal
            numericId: conv.id, // Guardar el id numérico por si lo necesitamos
            title: conv.title || conv.name || "Conversación sin título",
            lastMessage: conv.lastMessage || conv.last_message || "Sin mensajes",
            updatedAt: conv.updatedAt || conv.updated_at || conv.created_at || new Date().toISOString(),
            messageCount: conv.messageCount || conv.message_count || 0,
          }))
          
          console.log("[API Call] Transformed conversations:", transformedConversations.length, "conversations")
          setConversations(transformedConversations)
          setAuthError(null)
        } else {
          const errorText = await response.text()
          console.error("[API Call] Error response:", response.status, errorText)

          if (response.status === 401) {
            handleAuthError("Token expirado o inválido")
          } else if (response.status === 403) {
            handleAuthError("Acceso denegado")
          } else {
            setAuthError(`Error del servidor: ${response.status}`)
          }
        }
      } catch (error) {
        console.error("[API Call] Network error:", error)
        setAuthError("Error de conexión con el servidor")
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [userLoading, router, isClient])

  const createNewConversation = async () => {
    try {
      const authData = checkAuthentication()
      
      if (!authData) {
        handleAuthError("No se puede crear conversación sin autenticación")
        return
      }

      console.log("[CREATE] Creating new conversation for user:", authData.user.id)
      console.log("[CREATE] Using API URL:", API_URL)

      const response = await fetch(`${API_URL}/api/v1/chat/conversations?user_id=${authData.user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Nueva conversación",
          user_id: authData.user.id,
        }),
      })

      console.log("[CREATE] Create conversation response status:", response.status)

      if (response.ok) {
        const newConversation = await response.json()
        console.log("[CREATE] New conversation created:", newConversation)
        
        // Transformar la nueva conversación al formato esperado - USAR session_id
        const transformedConversation = {
          id: newConversation.session_id, // Usar session_id como id principal
          numericId: newConversation.id, // Guardar el id numérico
          title: newConversation.title || "Nueva conversación",
          lastMessage: "Sin mensajes",
          updatedAt: newConversation.created_at || new Date().toISOString(),
          messageCount: 0,
        }
        
        setConversations((prev) => [transformedConversation, ...prev])
        onConversationSelect(transformedConversation.id)
        setSidebarOpen(false)
        setAuthError(null)
      } else if (response.status === 401) {
        handleAuthError("Sesión expirada")
      } else {
        const errorText = await response.text()
        console.error("Error creating conversation:", response.status, errorText)
        setAuthError(`Error al crear conversación: ${response.status}`)
      }
    } catch (error) {
      console.error("Error creating conversation:", error)
      setAuthError("Error al crear conversación")
    }
  }

  const deleteConversation = async (conversationId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta conversación?")) return

    try {
      const authData = checkAuthentication()
      
      if (!authData) {
        handleAuthError("No se puede eliminar conversación sin autenticación")
        return
      }

      console.log("[DELETE] Deleting conversation:", conversationId)
      console.log("[DELETE] Using API URL:", API_URL)

      // Usar session_id en lugar de conversation_id para la eliminación
      const response = await fetch(`${API_URL}/api/v1/chat/conversations/${conversationId}?user_id=${authData.user.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setConversations((prev) => prev.filter((conv) => conv.id !== conversationId))
        if (activeConversationId === conversationId) {
          onConversationSelect("")
        }
        setAuthError(null)
        console.log("[DELETE] Conversation deleted successfully:", conversationId)
      } else if (response.status === 401) {
        handleAuthError("Sesión expirada")
      } else {
        const errorText = await response.text()
        console.error("Error deleting conversation:", response.status, errorText)
        setAuthError(`Error al eliminar conversación: ${response.status}`)
      }
    } catch (error) {
      console.error("Error deleting conversation:", error)
      setAuthError("Error al eliminar conversación")
    }
  }

  if (userLoading || !isClient) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  // Mostrar error de autenticación si existe
  if (authError) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <div className="text-red-500 mb-2">Error de Autenticación</div>
          <div className="text-sm text-muted-foreground mb-4">{authError}</div>
          <Button 
            onClick={() => router.push("/login")} 
            variant="outline"
            size="sm"
          >
            Ir a Login
          </Button>
        </div>
      </div>
    )
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-primary" />
            <div>
              <h2 className="font-semibold text-sidebar-foreground">Erasmo</h2>
              <p className="text-xs text-muted-foreground">IA de estrategia de marca</p>
            </div>
          </div>
        </div>

        <Button onClick={createNewConversation} className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Conversación
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 overflow-auto">
        <div className="p-2">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">Cargando conversaciones...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {searchTerm ? "No se encontraron conversaciones" : "No hay conversaciones aún"}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                    activeConversationId === conversation.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50",
                  )}
                  onClick={() => {
                    onConversationSelect(conversation.id)
                    setSidebarOpen(false)
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <h3 className="font-medium text-sm truncate">{conversation.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(conversation.updatedAt).toLocaleDateString()}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {conversation.messageCount}
                      </Badge>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Renombrar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteConversation(conversation.id)
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* User Info */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.full_name || user?.username}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.company?.name}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              logout()
              router.push("/login")
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-80 md:flex-col">
        <SidebarContent />
      </div>
    </>
  )
}