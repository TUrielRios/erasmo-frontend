"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Search, MoreHorizontal, Trash2, Edit, ChevronDown, ChevronRight } from "lucide-react"
import { getUser, logout } from "@/lib/auth"
import { projectService } from "@/lib/projects"
import { chatService, type Conversation as APIConversation } from "@/lib/chat"
import { cn } from "@/lib/utils"

interface Conversation {
  id: number
  session_id: string
  title: string
  lastMessage: string
  messageCount: number
  projectId?: number | null
}

interface Project {
  id: number
  name: string
  description: string | null
  conversationCount?: number
}

interface ChatSidebarProps {
  activeConversationId: string | null
  onConversationSelect: (id: string, projectId: number | null, projectName: string | null) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function ChatSidebar({
  activeConversationId,
  onConversationSelect,
  sidebarOpen,
  setSidebarOpen,
}: ChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [networkError, setNetworkError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [editingConversationId, setEditingConversationId] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [projectsExpanded, setProjectsExpanded] = useState(true)
  const [chatsExpanded, setChatsExpanded] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)

    if (typeof window === "undefined") {
      return
    }

    try {
      const currentUser = getUser()

      if (!currentUser) {
        setAuthError("Sesión expirada. Por favor, inicia sesión nuevamente.")
        router.push("/login")
        return
      }

      if (!currentUser.is_active) {
        setAuthError("Usuario inactivo. Contacta al administrador.")
        router.push("/login")
        return
      }

      setUser(currentUser)
      setAuthError(null)
    } catch (error) {
      console.error("[Auth Check] Error checking authentication:", error)
      setAuthError("Error al verificar autenticación")
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    if (!isClient || !user) return

    const fetchProjects = async () => {
      setIsLoadingProjects(true)
      setNetworkError(null)

      try {
        const projectsData = await projectService.getProjects()
        setProjects(
          projectsData.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            conversationCount: p.conversation_count,
          })),
        )
      } catch (error) {
        console.error("[Projects] Error fetching projects:", error)
        setNetworkError("Error al cargar proyectos. Intenta de nuevo.")
      } finally {
        setIsLoadingProjects(false)
      }
    }

    fetchProjects()
  }, [isClient, user])

  useEffect(() => {
    if (!isClient || !user) return

    const fetchConversations = async () => {
      setIsLoading(true)
      setNetworkError(null)

      try {
        const data = await chatService.getConversations(selectedProjectId || undefined)

        const transformedConversations = data.map((conv: APIConversation) => ({
          id: conv.id,
          session_id: conv.session_id,
          title: conv.title || "Conversación sin título",
          lastMessage: "Sin mensajes",
          messageCount: conv.message_count || 0,
          projectId: conv.project_id,
        }))

        setConversations(transformedConversations)
      } catch (error) {
        console.error("[API Call] Error fetching conversations:", error)
        const errorMessage = error instanceof Error ? error.message : "Error desconocido"
        if (errorMessage.includes("autenticado") || errorMessage.includes("token")) {
          setAuthError("Sesión expirada. Por favor, inicia sesión nuevamente.")
          logout()
          router.push("/login")
        } else {
          setNetworkError("Error al cargar conversaciones. Intenta de nuevo.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()

    // Exponer la función globalmente para que el componente de chat la pueda llamar
    if (typeof window !== "undefined") {
      (window as any).refreshConversations = fetchConversations
    }

    // Limpiar al desmontar
    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).refreshConversations
      }
    }
  }, [isClient, user, selectedProjectId, router])

  const createNewConversation = async (projectId?: number) => {
    try {
      if (!user) {
        setAuthError("Sesión expirada. Por favor, inicia sesión nuevamente.")
        router.push("/login")
        return
      }

      const newConversation = await chatService.createConversation({
        title: "Nueva conversación",
        project_id: projectId || null,
      })

      const transformedConversation = {
        id: newConversation.id,
        session_id: newConversation.session_id,
        title: newConversation.title || "Nueva conversación",
        lastMessage: "Sin mensajes",
        messageCount: 0,
        projectId: newConversation.project_id,
      }

      setConversations((prev) => [transformedConversation, ...prev])

      const projectName = projectId ? projects.find((p) => p.id === projectId)?.name || null : null
      onConversationSelect(newConversation.session_id, projectId || null, projectName)
      setSidebarOpen(false)
      setNetworkError(null)
    } catch (error) {
      console.error("Error creating conversation:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      if (errorMessage.includes("autenticado") || errorMessage.includes("token")) {
        setAuthError("Sesión expirada. Por favor, inicia sesión nuevamente.")
        logout()
        router.push("/login")
      } else {
        setNetworkError("Error al crear conversación. Intenta de nuevo.")
      }
    }
  }

  const createNewProject = async () => {
    const projectName = prompt("Nombre del proyecto:")
    if (!projectName?.trim()) return

    try {
      if (!user) {
        setAuthError("Sesión expirada. Por favor, inicia sesión nuevamente.")
        router.push("/login")
        return
      }

      const newProject = await projectService.createProject({
        name: projectName.trim(),
        description: "",
      })

      setProjects((prev) => [
        {
          id: newProject.id,
          name: newProject.name,
          description: newProject.description,
          conversationCount: newProject.conversation_count,
        },
        ...prev,
      ])
      setNetworkError(null)
    } catch (error) {
      console.error("Error creating project:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      if (errorMessage.includes("autenticado") || errorMessage.includes("token")) {
        setAuthError("Sesión expirada. Por favor, inicia sesión nuevamente.")
        logout()
        router.push("/login")
      } else {
        alert("Error al crear proyecto. Intenta de nuevo.")
      }
    }
  }

  const deleteConversation = async (conversationId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta conversación?")) return

    try {
      if (!user) {
        setAuthError("Sesión expirada. Por favor, inicia sesión nuevamente.")
        router.push("/login")
        return
      }

      const conv = conversations.find((c) => c.id === conversationId)
      if (!conv) return

      await chatService.deleteConversation(conv.session_id)

      setConversations((prev) => prev.filter((conv) => conv.id !== conversationId))

      const deletedConv = conversations.find((c) => c.id === conversationId)
      if (activeConversationId === deletedConv?.session_id) {
        onConversationSelect("", null, null)
      }
      setOpenMenuId(null)
      setNetworkError(null)
    } catch (error) {
      console.error("Error deleting conversation:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      if (errorMessage.includes("autenticado") || errorMessage.includes("token")) {
        setAuthError("Sesión expirada. Por favor, inicia sesión nuevamente.")
        logout()
        router.push("/login")
      } else {
        alert("Error al eliminar conversación. Intenta de nuevo.")
      }
    }
  }

  const renameConversation = (conversationId: number, currentTitle: string) => {
    setEditingConversationId(conversationId)
    setEditingTitle(currentTitle)
    setOpenMenuId(null)
  }

  const saveConversationTitle = async (conversationId: number) => {
    if (!editingTitle.trim() || editingTitle === conversations.find((c) => c.id === conversationId)?.title) {
      setEditingConversationId(null)
      return
    }

    try {
      if (!user) {
        setAuthError("Sesión expirada. Por favor, inicia sesión nuevamente.")
        router.push("/login")
        return
      }

      const conv = conversations.find((c) => c.id === conversationId)
      if (!conv) return

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/conversations/${conv.session_id}/title?user_id=${user.id}&new_title=${encodeURIComponent(editingTitle.trim())}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error("Error al actualizar título")
      }

      setConversations((prev) =>
        prev.map((conv) => (conv.id === conversationId ? { ...conv, title: editingTitle.trim() } : conv)),
      )
      setEditingConversationId(null)
      setNetworkError(null)
    } catch (error) {
      console.error("Error renaming conversation:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      if (errorMessage.includes("autenticado") || errorMessage.includes("token")) {
        setAuthError("Sesión expirada. Por favor, inicia sesión nuevamente.")
        logout()
        router.push("/login")
      } else {
        alert("Error al renombrar conversación. Intenta de nuevo.")
      }
      setEditingConversationId(null)
    }
  }

  const cancelEditing = () => {
    setEditingConversationId(null)
    setEditingTitle("")
  }

  const deleteProject = async (projectId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este proyecto? Las conversaciones no se eliminarán.")) return

    try {
      if (!user) {
        setAuthError("Sesión expirada. Por favor, inicia sesión nuevamente.")
        router.push("/login")
        return
      }

      await projectService.deleteProject(projectId)

      setProjects((prev) => prev.filter((proj) => proj.id !== projectId))
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null)
      }
      setOpenMenuId(null)
      setNetworkError(null)
    } catch (error) {
      console.error("Error deleting project:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      if (errorMessage.includes("autenticado") || errorMessage.includes("token")) {
        setAuthError("Sesión expirada. Por favor, inicia sesión nuevamente.")
        logout()
        router.push("/login")
      } else {
        alert("Error al eliminar proyecto. Intenta de nuevo.")
      }
    }
  }

  if (!isClient || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <div className="text-red-500 mb-2">Error de Autenticación</div>
          <div className="text-sm text-muted-foreground mb-4">{authError}</div>
          <Button onClick={() => router.push("/login")} variant="outline" size="sm">
            Ir a Login
          </Button>
        </div>
      </div>
    )
  }

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProject = selectedProjectId === null || conv.projectId === selectedProjectId
    return matchesSearch && matchesProject
  })

  const SidebarContent = () => (
    <div className="flex flex-col h-full relative" style={{ backgroundColor: "#F5F5F5" }}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-12 bg-blue-600 rounded-r-lg items-center justify-center hover:bg-blue-700 transition-colors shadow-md"
      >
        {isCollapsed ? (
          <ChevronRight className="h-5 w-5 text-white" />
        ) : (
          <ChevronRight className="h-5 w-5 text-white rotate-180" />
        )}
      </button>

      {/* Header con Logo */}
      <div className="px-4 py-6 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-grey rounded-lg flex items-center justify-center flex-shrink-0">
            <img src="icons/logo_clara_azul.svg" alt="logo clara azul" />
          </div>
          <div>
            <h2 className="font-bold text-[#0A2FF1] text-sm">CLARA</h2>
            <p className="text-xs text-[#0A2FF1]">IA de estrategia de marca</p>
          </div>
        </div>

        {/* Botones principales */}
        <div className="space-y-2">
          <Button
            onClick={() => createNewConversation(selectedProjectId || undefined)}
            variant="ghost"
            className="w-full justify-start text-sm font-normal h-9 hover:bg-gray-50"
          >
            <img src="/icons/lapiz_cuadro.svg" alt="Nuevo chat" className="h-4 w-4 mr-3" />
            <span className="text-gray-700">Nuevo chat</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-sm font-normal h-9 hover:bg-gray-50"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <img src="/icons/lupita.svg" alt="Buscar chat" className="h-4 w-4 mr-3" />
            <span className="text-gray-700">Buscar chat</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      {isSearchOpen && (
        <div className="px-4 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md h-9 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>
      )}

      {networkError && (
        <div className="mx-4 mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-xs text-yellow-700">{networkError}</p>
        </div>
      )}

      <ScrollArea className="flex-1 overflow-auto">
        <div className="px-4 py-4 space-y-6">
          {/* Sección Proyectos */}
          <div>
            <button
              onClick={() => setProjectsExpanded(!projectsExpanded)}
              className="flex items-center justify-between w-full py-2 hover:bg-gray-100 rounded-md px-2 -mx-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-blue-600">Proyectos</span>
              </div>
              {projectsExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
              )}
            </button>

            {projectsExpanded && (
              <div className="mt-2 space-y-1">
                {isLoadingProjects ? (
                  <div className="text-center text-muted-foreground py-4 text-xs">Cargando proyectos...</div>
                ) : (
                  <>
                    {projects.length === 0 ? (
                      <div className="text-center text-muted-foreground py-4 text-xs">
                        <button
                          onClick={() => createNewProject()}
                          className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors text-gray-700 hover:bg-white"
                        >
                          <img src="icons/agregar_carpeta.svg" alt="agregar carpeta" className="h-4 w-4" />

                          <span>Nuevo proyecto</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => createNewProject()}
                          className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors text-gray-700 hover:bg-white"
                        >
                          <img src="icons/agregar_carpeta.svg" alt="agregar carpeta" className="h-4 w-4" />
                          <span>Nuevo proyecto</span>
                        </button>

                        {projects.map((project) => (
                          <div
                            key={project.id}
                            className={cn(
                              "group relative flex items-center justify-between px-2 py-1.5 rounded-md transition-colors",
                              selectedProjectId === project.id
                                ? "bg-white text-gray-900"
                                : "text-gray-700 hover:bg-white",
                            )}
                          >
                            <button
                              onClick={() => setSelectedProjectId(project.id)}
                              className="flex items-center gap-2 flex-1 min-w-0 text-left"
                            >
                              <img src="/icons/carpeta.svg" alt="icono carpeta" className="h-4 w-4 flex-shrink-0" />
                              <span className="text-sm text-gray-700 truncate">{project.name}</span>
                            </button>

                            <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-gray-200"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setOpenMenuId(openMenuId === `project-${project.id}` ? null : `project-${project.id}`)
                                }}
                              >
                                <MoreHorizontal className="h-3.5 w-3.5 text-gray-600" />
                              </Button>

                              {openMenuId === `project-${project.id}` && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                  <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                                    <button
                                      className="flex w-full items-center rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        deleteProject(project.id)
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Eliminar
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Sección Chats */}
          <div>
            <button
              onClick={() => setChatsExpanded(!chatsExpanded)}
              className="flex items-center justify-between w-full py-2 hover:bg-gray-100 rounded-md px-2 -mx-2"
            >
              <span className="text-sm font-bold text-blue-600 ">
                {selectedProjectId ? "Chats del proyecto" : "Chats"}
              </span>
              {chatsExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
              )}
            </button>

            {chatsExpanded && (
              <div className="mt-2 space-y-1">
                {isLoading ? (
                  <div className="text-center text-muted-foreground py-8 text-xs">Cargando conversaciones...</div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8 text-xs">
                    {searchTerm ? "No se encontraron conversaciones" : "No hay conversaciones aún"}
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={cn(
                        "group relative flex items-start justify-between px-2 py-2 rounded-md transition-colors cursor-pointer",
                        activeConversationId === conversation.session_id ? "bg-[#EBEEFF]" : "hover:bg-[#EBEEFF]",
                      )}
                      onClick={() => {
                        if (editingConversationId === conversation.id) return
                        const projectName = conversation.projectId
                          ? projects.find((p) => p.id === conversation.projectId)?.name || null
                          : null
                        onConversationSelect(conversation.session_id, conversation.projectId || null, projectName)
                        setSidebarOpen(false)
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        {editingConversationId === conversation.id ? (
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                saveConversationTitle(conversation.id)
                              } else if (e.key === "Escape") {
                                cancelEditing()
                              }
                            }}
                            onBlur={() => saveConversationTitle(conversation.id)}
                            className="h-6 text-sm px-2 py-0"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <>
                            <h3
                              className={cn(
                                "text-sm font-medium truncate mb-0.5",
                                activeConversationId === conversation.session_id ? "text-blue-700" : "text-gray-900",
                              )}
                            >
                              {conversation.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "text-xs",
                                  activeConversationId === conversation.session_id ? "text-blue-600" : "text-gray-500",
                                )}
                              >
                                {conversation.messageCount} mensajes
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
                                  activeConversationId === conversation.session_id
                                    ? "hover:bg-blue-200 text-blue-700"
                                    : "hover:bg-blue-200 text-gray-600",
                                )}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setOpenMenuId(
                                    openMenuId === `conv-${conversation.id}` ? null : `conv-${conversation.id}`,
                                  )
                                }}
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>

                      {editingConversationId !== conversation.id && openMenuId === `conv-${conversation.id}` && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                            <button
                              className="flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={(e) => {
                                e.stopPropagation()
                                alert("Función de compartir próximamente")
                                setOpenMenuId(null)
                              }}
                            >
                              <img src="/icons/descarga.svg" alt="icono compartir" className="h-4 w-4 mr-2" />
                              Compartir
                            </button>
                            <button
                              className="flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={(e) => {
                                e.stopPropagation()
                                renameConversation(conversation.id, conversation.title)
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Renombrar
                            </button>
                            <button
                              className="flex w-full items-center rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteConversation(conversation.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* User Info Footer */}
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <img src="/icons/user_circulo.svg" alt="user icon" className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name || user?.username}</p>
              <p className="text-xs text-gray-500 truncate">{user?.company?.name}</p>
            </div>
            <img src="/icons/logout.svg" alt="log out" className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex md:flex-col border-r border-gray-100 transition-all duration-300 relative",
          isCollapsed ? "md:w-16" : "md:w-64",
        )}
      >
        {isCollapsed ? (
          <div className="flex flex-col h-full relative" style={{ backgroundColor: "#F5F5F5" }}>
            <button
              onClick={() => setIsCollapsed(false)}
              className="absolute -right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-12 bg-blue-600 rounded-r-lg flex items-center justify-center hover:bg-blue-700 transition-colors shadow-md"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>

            {/* Logo colapsado */}
            <div className="px-4 py-6 border-b border-gray-200 flex justify-center">
              <div className="w-8 h-8 bg-grey rounded-lg flex items-center justify-center">
                <img src="icons/logo_clara_azul.svg" alt="logo clara azul" />
              </div>
            </div>

            {/* Iconos de acciones */}
            <div className="flex flex-col items-center gap-48 pt-8 px-4">
              <div className="flex flex-col items-center gap-6">
                <Button
                  onClick={() => createNewConversation(selectedProjectId || undefined)}
                  variant="ghost"
                  size="sm"
                  className="w-4 h-4 p-0 hover:bg-gray-100 rounded-lg"
                  title="Nuevo chat"
                >
                  <img src="/icons/lapiz_cuadro.svg" alt="Nuevo chat" className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-4 h-4 p-0 hover:bg-gray-100 rounded-lg"
                  title="Buscar chat"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                >
                  <img src="/icons/lupita.svg" alt="Buscar chat" className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-4 h-4 p-0 hover:bg-gray-100 rounded-lg"
                  title="Ver proyectos"
                  onClick={() => setProjectsExpanded(!projectsExpanded)}
                >
                  <img src="/icons/carpeta.svg" alt="Ver proyectos" className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => createNewProject()}
                  variant="ghost"
                  size="sm"
                  className="w-4 h-4 p-0 hover:bg-gray-100 rounded-lg"
                  title="Crear proyecto"
                >
                  <img src="/icons/agregar_carpeta.svg" alt="Crear proyecto" className="w-4 h-4" />
                </Button>
              </div>

              <Button
                onClick={() => setChatsExpanded(!chatsExpanded)}
                variant="ghost"
                size="sm"
                className="w-4 h-4 p-0 hover:bg-gray-100 rounded-lg"
                title="Ver chats"
              >
                <img src="/icons/viñeta.svg" alt="Ver chats" className="w-4 h-4" />
              </Button>
            </div>

            {/* User icon en el footer */}
            <div className="mt-auto px-4 py-6 border-t border-gray-200 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0 rounded-full flex items-center justify-center"
                title="Usuario"
              >
                <img src="/icons/user_circulo.svg" alt="Usuario" className="w-6 h-6" />
              </Button>
            </div>
          </div>
        ) : (
          <SidebarContent />
        )}
      </div>
    </>
  )
}