"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  PenSquare,
  Search,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  MessageSquare,
  MoreHorizontal,
  Plus,
  X,
  ChevronLeft,
} from "lucide-react"
import { chatAPI, projectsAPI, type Conversation, type Project } from "@/lib/api"
import { getUser } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ChatSidebarProps {
  activeConversationId?: string | null
  onConversationSelect?: (sessionId: string, projectId: number | null, projectName: string | null) => void
  sidebarOpen: boolean
  setSidebarOpen?: (open: boolean) => void
  selectedConversationId?: string
  onSelectConversation?: (id: string) => void
  onNewConversation?: () => void
}

export function ChatSidebar({
  activeConversationId,
  onConversationSelect,
  sidebarOpen,
  setSidebarOpen,
}: ChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [projectsExpanded, setProjectsExpanded] = useState(true)
  const [chatsExpanded, setChatsExpanded] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const user = getUser()

  useEffect(() => {
    loadConversations()
    loadProjects()

    // Listen for new conversations
    const handleConversationCreated = () => {
      loadConversations()
    }
    window.addEventListener("conversationCreated", handleConversationCreated)
    return () => window.removeEventListener("conversationCreated", handleConversationCreated)
  }, [])

  const loadConversations = async () => {
    try {
      const data = await chatAPI.getConversations()
      setConversations(data)
    } catch (error) {
      console.error("Error loading conversations:", error)
    }
  }

  const loadProjects = async () => {
    try {
      const data = await projectsAPI.getProjects()
      setProjects(data)
    } catch (error) {
      console.error("Error loading projects:", error)
    }
  }

  const handleNewChat = async () => {
    try {
      const { session_id } = await chatAPI.createConversation()
      onConversationSelect?.(session_id, null, null)
      loadConversations()
    } catch (error) {
      console.error("Error creating conversation:", error)
    }
  }

  const handleNewProject = async () => {
    const name = prompt("Nombre del proyecto:")
    if (!name) return
    try {
      await projectsAPI.createProject(name)
      loadProjects()
    } catch (error) {
      console.error("Error creating project:", error)
    }
  }

  const handleDeleteConversation = async (sessionId: string) => {
    if (!confirm("¿Eliminar esta conversación?")) return
    try {
      await chatAPI.deleteConversation(sessionId)
      loadConversations()
      if (activeConversationId === sessionId) {
        onConversationSelect?.("", null, null)
      }
    } catch (error) {
      console.error("Error deleting conversation:", error)
    }
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Collapsed sidebar (icon-only)
  if (isCollapsed) {
    return (
      <div className="w-16 h-screen bg-[#f5f5f5] border-r border-border flex flex-col items-center py-4 gap-4 relative">
        <button
          onClick={() => setIsCollapsed(false)}
          className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0000FF] text-white flex items-center justify-center shadow-lg hover:bg-[#0000FF]/90 transition-colors z-10"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <div className="w-3 h-3 rounded-full bg-white" />
        </Button>

        <Button variant="ghost" size="icon" onClick={handleNewChat}>
          <PenSquare className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon">
          <Search className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon">
          <FolderOpen className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon">
          <MessageSquare className="h-5 w-5" />
        </Button>
      </div>
    )
  }

  // Expanded sidebar
  return (
    <div className="w-64 h-screen bg-[#f5f5f5] border-r border-border flex flex-col relative">
      <button
        onClick={() => setIsCollapsed(true)}
        className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0000FF] text-white flex items-center justify-center shadow-lg hover:bg-[#0000FF]/90 transition-colors z-10"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Header */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0000FF] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#0000FF]">CLARA</h1>
              <p className="text-[10px] text-muted-foreground">IA de estrategia de marca</p>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <Button variant="ghost" className="w-full justify-start gap-2 text-sm mt-6" onClick={handleNewChat}>
          <PenSquare className="h-4 w-4" />
          Nuevo chat
        </Button>

        {/* Search */}
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Projects Section */}
          <div>
            <button
              onClick={() => setProjectsExpanded(!projectsExpanded)}
              className="flex items-center justify-between w-full text-sm font-medium text-[#0000FF] hover:underline mb-2"
            >
              <span>Proyectos</span>
              {projectsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>

            {projectsExpanded && (
              <div className="space-y-1 ml-2">
                <Button variant="ghost" className="w-full justify-start gap-2 text-sm h-8" onClick={handleNewProject}>
                  <Plus className="h-4 w-4" />
                  Nuevo proyecto
                </Button>
                {projects.map((project) => (
                  <Button
                    key={project.id}
                    variant="ghost"
                    className="w-full justify-start gap-2 text-sm h-8"
                    onClick={() => onConversationSelect?.("", project.id, project.name)}
                  >
                    <FolderOpen className="h-4 w-4" />
                    {project.name}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Chats Section */}
          <div>
            <button
              onClick={() => setChatsExpanded(!chatsExpanded)}
              className="flex items-center justify-between w-full text-sm font-medium text-[#0000FF] hover:underline mb-2"
            >
              <span>Chats</span>
              {chatsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>

            {chatsExpanded && (
              <div className="space-y-1">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.session_id}
                    className={cn(
                      "group flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-secondary cursor-pointer",
                      activeConversationId === conv.session_id && "bg-secondary",
                    )}
                    onClick={() => onConversationSelect?.(conv.session_id, conv.project_id, conv.project_name)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{conv.title}</p>
                      <p className="text-xs text-muted-foreground">{conv.message_count} mensajes</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDeleteConversation(conv.session_id)}>
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* User Info */}
      <div className="p-4 border-t border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
            {user?.full_name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.full_name || "Usuario"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.company?.name || "Sin empresa"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
