"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  Plus,
  Search,
  MessageSquare,
  MoreHorizontal,
  Trash2,
  Edit,
  LogOut,
  Folder,
  FolderPlus,
  Share2,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react"
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
  const [isCollapsed, setIsCollapsed] = useState(false)
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
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header */}
      <div className="p-4 border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-primary" />
              <div>
                <h2 className="font-semibold text-sidebar-foreground">Clara</h2>
                <p className="text-xs text-muted-foreground">IA de estrategia</p>
              </div>
            </div>
          )}
          {isCollapsed && <Brain className="h-6 w-6 text-primary mx-auto" />}
        </div>

        {!isCollapsed ? (
          <Button onClick={() => createNewConversation(selectedProjectId || undefined)} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo chat
          </Button>
        ) : (
          <Button onClick={() => createNewConversation(selectedProjectId || undefined)} className="w-full" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
        </div>
      )}

      {networkError && !isCollapsed && (
        <div className="mx-4 mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
          <p className="text-xs text-yellow-600 dark:text-yellow-400">{networkError}</p>
        </div>
      )}

      <ScrollArea className="flex-1 overflow-auto">
        <div className="p-2">
          {!isCollapsed && (
            <div className="mb-4">
              <div className="flex items-center justify-between px-2 py-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase">Proyectos</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={createNewProject}
                  className="h-6 w-6 p-0 cursor-pointer bg-transparent hover:bg-transparent"
                >
                  <FolderPlus className="h-4 w-4 cursor-pointer" />
                </Button>
              </div>

              {isLoadingProjects ? (
                <div className="text-center text-muted-foreground py-4 text-sm">Cargando proyectos...</div>
              ) : projects.length === 0 ? (
                <div className="text-center text-muted-foreground py-4 text-sm">No hay proyectos</div>
              ) : (
                <div className="space-y-1">
                  <div
                    className={cn(
                      "flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors",
                      selectedProjectId === null
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "hover:bg-sidebar-accent/50",
                    )}
                    onClick={() => setSelectedProjectId(null)}
                  >
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Todos los chats</span>
                  </div>

                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className={cn(
                        "group flex items-center justify-between p-2 rounded-lg transition-colors relative",
                        selectedProjectId === project.id
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "hover:bg-sidebar-accent/50",
                      )}
                    >
                      <div
                        className="flex items-center space-x-2 flex-1 min-w-0 cursor-pointer"
                        onClick={() => setSelectedProjectId(project.id)}
                      >
                        <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate">{project.name}</span>
                      </div>

                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-transparent cursor-pointer transition-opacity h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenMenuId(openMenuId === `project-${project.id}` ? null : `project-${project.id}`)
                          }}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>

                        {openMenuId === `project-${project.id}` && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                            <div className="absolute right-0 top-8 z-20 w-48 rounded-md border bg-popover p-1 shadow-md">
                              <button
                                className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground text-destructive"
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
                </div>
              )}
            </div>
          )}

          <div>
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-muted-foreground uppercase px-2 py-2">
                {selectedProjectId ? "Chats del proyecto" : "Chats"}
              </h3>
            )}

            {isLoading ? (
              !isCollapsed && <div className="text-center text-muted-foreground py-8">Cargando conversaciones...</div>
            ) : filteredConversations.length === 0 ? (
              !isCollapsed && (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  {searchTerm ? "No se encontraron conversaciones" : "No hay conversaciones aún"}
                </div>
              )
            ) : (
              <div className="space-y-1">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={cn(
                      "group flex items-center justify-between p-3 rounded-lg transition-colors relative",
                      activeConversationId === conversation.session_id
                        ? "bg-primary text-sidebar-accent"
                        : "hover:bg-sidebar-accent/50",
                    )}
                  >
                    {isCollapsed ? (
                      <div
                        className="flex items-center justify-center w-full cursor-pointer"
                        onClick={() => {
                          const projectName = conversation.projectId
                            ? projects.find((p) => p.id === conversation.projectId)?.name || null
                            : null
                          onConversationSelect(conversation.session_id, conversation.projectId || null, projectName)
                          setSidebarOpen(false)
                        }}
                        title={conversation.title}
                      >
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ) : (
                      <>
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => {
                            if (editingConversationId === conversation.id) return
                            const projectName = conversation.projectId
                              ? projects.find((p) => p.id === conversation.projectId)?.name || null
                              : null
                            onConversationSelect(conversation.session_id, conversation.projectId || null, projectName)
                            setSidebarOpen(false)
                          }}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
                              <h3 className="font-medium text-sm truncate">{conversation.title}</h3>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="primary" className="text-xs">
                              {conversation.messageCount}
                            </Badge>
                          </div>
                        </div>

                        {editingConversationId !== conversation.id && (
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="transition-opacity bg-transparent cursor-pointer hover:bg-transparent"
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenMenuId(
                                  openMenuId === `conv-${conversation.id}` ? null : `conv-${conversation.id}`,
                                )
                              }}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>

                            {openMenuId === `conv-${conversation.id}` && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                <div className="absolute right-0 top-8 z-20 w-48 rounded-md bg-background p-1 shadow-md">
                                  <button
                                    className="flex w-full text-accent-foreground items-center rounded-sm px-2 py-1.5 text-sm hover:bg-ring hover:text-accent-foreground"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      alert("Función de compartir próximamente")
                                      setOpenMenuId(null)
                                    }}
                                  >
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Compartir
                                  </button>
                                  <button
                                    className="flex w-full text-accent-foreground items-center rounded-sm px-2 py-1.5 text-sm hover:bg-ring hover:text-accent-foreground"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      renameConversation(conversation.id, conversation.title)
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Cambiar el nombre
                                  </button>
                                  <button
                                    className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-ring text-destructive"
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
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* User Info */}
      <div className="p-4 border-t border-sidebar-border">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.full_name || user?.username}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.company?.name}</p>
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
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => {
              logout()
              router.push("/login")
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
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
          "hidden md:flex md:flex-col relative transition-all duration-300 ease-in-out",
          isCollapsed ? "md:w-16" : "md:w-64",
        )}
      >
        <SidebarContent />

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute -right-3 top-4 h-6 w-6 rounded-full border bg-background p-0 shadow-md hover:bg-accent z-50"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </>
  )
}