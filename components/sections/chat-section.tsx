"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import {
  Brain,
  Send,
  Mic,
  Paperclip,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Download,
  MessageSquare,
  Clock,
  Lightbulb,
  Target,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  conceptual?: string
  accional?: string
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  created_at: Date
  updated_at: Date
  message_count: number
}

export default function ChatSection() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [message, setMessage] = useState("")
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const searchConversations = () => {
    console.log("[v0] Searching conversations for:", searchQuery)
    // Implement search logic here
  }

  useEffect(() => {
    if (isAuthenticated) {
      console.log("[v0] User authenticated, loading conversations...")
      loadConversations()
      loadRecentConversations()
    }
  }, [isAuthenticated])

  useEffect(() => {
    const handleAuthSuccess = () => {
      console.log("[v0] Auth success event received, reloading conversations...")
      setTimeout(() => {
        loadConversations()
        loadRecentConversations()
      }, 500)
    }

    window.addEventListener("auth-success", handleAuthSuccess)
    return () => window.removeEventListener("auth-success", handleAuthSuccess)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (currentConversation) {
      loadConversationMessages(currentConversation)
    }
  }, [currentConversation])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadConversations = async () => {
    if (!isAuthenticated) {
      console.log("[v0] Not authenticated, skipping conversation load")
      return
    }

    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        console.log("[v0] No token available for loading conversations")
        return
      }

      console.log("[v0] Loading conversations with token...")
      const response = await fetch("http://localhost:8000/api/v1/chat/conversations", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("[v0] Conversations response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Conversations data received:", data)

        if (Array.isArray(data)) {
          console.log("[v0] Number of conversations:", data.length)
          setConversations(data)
          console.log("[v0] Conversations state updated with", data.length, "items")
        } else if (data.conversations && Array.isArray(data.conversations)) {
          console.log("[v0] Number of conversations:", data.conversations.length)
          setConversations(data.conversations)
          console.log("[v0] Conversations state updated with", data.conversations.length, "items")
        } else {
          console.log("[v0] No conversations array in response, data type:", typeof data)
          setConversations([])
        }
      } else {
        const errorText = await response.text()
        console.log("[v0] Failed to load conversations:", response.status, errorText)
      }
    } catch (error) {
      console.log("[v0] Failed to load conversations:", error)
    }
  }

  const loadRecentConversations = async () => {
    if (!isAuthenticated) {
      console.log("[v0] Not authenticated, skipping recent conversations load")
      return
    }

    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        console.log("[v0] No token available for loading recent conversations")
        return
      }

      console.log("[v0] Loading recent conversations...")
      const response = await fetch("http://localhost:8000/api/v1/chat/recent", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("[v0] Recent conversations response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Recent conversations data:", data)

        let recentConversations = []
        if (Array.isArray(data)) {
          recentConversations = data
        } else if (data.conversations && Array.isArray(data.conversations)) {
          recentConversations = data.conversations
        }

        if (recentConversations.length > 0 && !currentConversation) {
          console.log("[v0] Setting current conversation to most recent:", recentConversations[0].id)
          setCurrentConversation(recentConversations[0].id)
        }
      } else {
        const errorText = await response.text()
        console.log("[v0] Failed to load recent conversations:", response.status, errorText)
      }
    } catch (error) {
      console.log("[v0] Failed to load recent conversations:", error)
    }
  }

  const loadConversationMessages = async (conversationId: string) => {
    if (!isAuthenticated) {
      console.log("[v0] Not authenticated, skipping message load")
      return
    }

    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        console.log("[v0] No token available for loading messages")
        return
      }

      console.log("[v0] Loading messages for conversation:", conversationId)
      const response = await fetch(`http://localhost:8000/api/v1/chat/conversations/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("[v0] Messages response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Messages data received:", data)
        console.log("[v0] Number of messages:", data.messages?.length || 0)
        setMessages(data.messages || [])
      } else {
        const errorText = await response.text()
        console.log("[v0] Failed to load conversation messages:", response.status, errorText)
      }
    } catch (error) {
      console.log("[v0] Failed to load conversation messages:", error)
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return // Prevent double sending

    if (!isAuthenticated) {
      console.log("[v0] User not authenticated, cannot send message")
      return
    }

    const userMessage = message.trim()
    const newMessage: Message = {
      id: Date.now().toString(),
      content: userMessage,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    setMessage("")
    setIsLoading(true)

    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        console.log("[v0] No auth token available")
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "Error: No estás autenticado. Por favor inicia sesión para continuar.",
          role: "assistant",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
        setIsLoading(false)
        return
      }

      console.log("[v0] Sending message:", userMessage)
      console.log("[v0] Current conversation ID:", currentConversation)

      const response = await fetch("http://localhost:8000/api/v1/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          session_id: currentConversation,
        }),
      })

      console.log("[v0] Query response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Query response:", data)

        let aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "Lo siento, no pude procesar tu consulta.",
          role: "assistant",
          timestamp: new Date(),
        }

        if (data.conceptual && data.accional) {
          aiMessage = {
            ...aiMessage,
            content: `${data.conceptual.content}\n\n${data.accional.content}`,
            conceptual: data.conceptual.content,
            accional: data.accional.content,
          }
        } else if (data.clarification && data.clarification.length > 0) {
          aiMessage.content =
            "Necesito más información:\n\n" + data.clarification.map((q: any) => `• ${q.question}`).join("\n")
        } else if (data.response || data.content) {
          const fullContent = data.response || data.content || ""

          const conceptualMatch = fullContent.match(
            /(?:Análisis Conceptual|ANÁLISIS CONCEPTUAL)[:\s]*\n\n?([\s\S]*?)(?=\n\n?(?:Plan de Acción|PLAN DE ACCIÓN)|$)/i,
          )
          const actionMatch = fullContent.match(
            /(?:Plan de Acción|PLAN DE ACCIÓN)[:\s]*\n\n?([\s\S]*?)(?=\n\n?(?:Siguiente Paso|SIGUIENTE PASO)|$)/i,
          )

          if (conceptualMatch && actionMatch) {
            aiMessage = {
              ...aiMessage,
              content: fullContent,
              conceptual: conceptualMatch[1].trim(),
              accional: actionMatch[1].trim(),
            }
          } else {
            aiMessage.content = fullContent
          }
        }

        setMessages((prev) => [...prev, aiMessage])

        if (data.session_id) {
          if (!currentConversation) {
            console.log("[v0] Setting current conversation to:", data.session_id)
            setCurrentConversation(data.session_id)
          }
        }

        setTimeout(() => {
          loadConversations()
        }, 1000)
      } else {
        const errorText = await response.text()
        console.log("[v0] Error response:", response.status, errorText)

        let errorMessage = "Lo siento, hubo un error al procesar tu mensaje."
        if (response.status === 401) {
          errorMessage = "Error de autenticación. Por favor inicia sesión nuevamente."
        } else if (response.status === 422) {
          errorMessage = "Error en el formato del mensaje. Por favor intenta de nuevo."
        }

        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          content: errorMessage,
          role: "assistant",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMsg])
      }
    } catch (error) {
      console.log("[v0] Failed to send message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Error de conexión. Por favor verifica tu conexión a internet e intenta de nuevo.",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const createNewConversation = async () => {
    if (!isAuthenticated) {
      console.log("[v0] Not authenticated, cannot create conversation")
      return
    }

    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        console.log("[v0] No token available for creating conversation")
        return
      }

      console.log("[v0] Creating new conversation...")

      const response = await fetch("http://localhost:8000/api/v1/chat/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: "Nueva conversación",
        }),
      })

      console.log("[v0] Create conversation response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] New conversation created:", data)

        const newConversationId = data.session_id || data.id
        console.log("[v0] Setting current conversation to:", newConversationId)

        setCurrentConversation(newConversationId)
        setMessages([])

        const newConversation: Conversation = {
          id: newConversationId,
          title: data.title || "Nueva conversación",
          messages: [],
          created_at: new Date(),
          updated_at: new Date(),
          message_count: 0,
        }

        setConversations((prev) => [newConversation, ...prev])

        setTimeout(() => {
          loadConversations()
        }, 1000)

        console.log("[v0] New conversation set as current:", newConversationId)
      } else {
        const errorText = await response.text()
        console.log("[v0] Failed to create conversation:", response.status, errorText)
      }
    } catch (error) {
      console.log("[v0] Failed to create conversation:", error)
    }
  }

  const updateConversationTitle = async (conversationId: string, title: string) => {
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`http://localhost:8000/api/v1/chat/conversations/${conversationId}/title`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      })

      if (response.ok) {
        loadConversations()
        setIsEditingTitle(false)
        setNewTitle("")
      }
    } catch (error) {
      console.log("[v0] Failed to update conversation title:", error)
    }
  }

  const deleteConversation = async (conversationId: string) => {
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`http://localhost:8000/api/v1/chat/conversations/${conversationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        if (currentConversation === conversationId) {
          setCurrentConversation(null)
          setMessages([])
        }
        loadConversations()
        setDeleteDialogOpen(false)
        setConversationToDelete(null)
      }
    } catch (error) {
      console.log("[v0] Failed to delete conversation:", error)
    }
  }

  const exportConversation = async (conversationId: string) => {
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`http://localhost:8000/api/v1/chat/export/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `conversation-${conversationId}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.log("[v0] Failed to export conversation:", error)
    }
  }

  const clearSession = async (conversationId: string) => {
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`http://localhost:8000/api/v1/query/sessions/${conversationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setMessages([])
        loadConversations()
      }
    } catch (error) {
      console.log("[v0] Failed to clear session:", error)
    }
  }

  const features = [
    {
      title: "Estrategia de Marca",
      description: "Desarrolla estrategias de marca personalizadas y efectivas",
      icon: Brain,
    },
    {
      title: "Análisis de Mercado",
      description: "Obtén insights profundos sobre tu mercado objetivo",
      icon: Brain,
    },
    {
      title: "Gestión de Conocimiento",
      description: "Organiza y aprovecha toda tu información de marca",
      icon: Brain,
    },
  ]

  const currentConv = conversations.find((c) => c.id === currentConversation)

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">¡Bienvenido a Erasmo AI!</h2>
          <p className="text-muted-foreground mb-6">
            Para comenzar a usar el chat y que Erasmo recuerde nuestras conversaciones, necesitas iniciar sesión.
          </p>
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Una vez que inicies sesión, todas tus conversaciones se guardarán automáticamente
              y Erasmo recordará el contexto de cada chat.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-border bg-muted/30">
        <div className="p-4 border-b border-border space-y-3">
          <Button onClick={createNewConversation} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Conversación
          </Button>

          <div className="flex space-x-2">
            <Input
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchConversations()}
              className="flex-1"
            />
            <Button variant="outline" size="icon" onClick={searchConversations}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Conversaciones {searchQuery ? "Encontradas" : "Recientes"}
          </h3>
          <div className="space-y-2 h-136 overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group relative rounded-lg border p-3 cursor-pointer transition-colors ${
                  currentConversation === conv.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card hover:bg-muted border-border"
                }`}
                onClick={() => setCurrentConversation(conv.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{conv.title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {conv.message_count || 0}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(conv.updated_at || conv.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsEditingTitle(true)
                          setNewTitle(conv.title)
                        }}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Editar título
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          exportConversation(conv.id)
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          clearSession(conv.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Limpiar mensajes
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          setConversationToDelete(conv.id)
                          setDeleteDialogOpen(true)
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConv && (
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              {isEditingTitle ? (
                <div className="flex items-center space-x-2 flex-1">
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        updateConversationTitle(currentConv.id, newTitle)
                      }
                      if (e.key === "Escape") {
                        setIsEditingTitle(false)
                        setNewTitle("")
                      }
                    }}
                    className="flex-1"
                    autoFocus
                  />
                  <Button size="sm" onClick={() => updateConversationTitle(currentConv.id, newTitle)}>
                    Guardar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditingTitle(false)
                      setNewTitle("")
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="font-semibold text-foreground">{currentConv.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentConv.message_count || 0} mensajes • Actualizado{" "}
                      {new Date(currentConv.updated_at || currentConv.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingTitle(true)
                      setNewTitle(currentConv.title)
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 p-6 overflow-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              {/* AI Orb */}
              <div className="relative mb-8">
                <div className="ai-orb w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
                  <Brain className="h-16 w-16 text-primary-foreground" />
                </div>
              </div>

              {/* Welcome Message */}
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">Hola, soy Erasmo</h2>
                <p className="text-xl text-muted-foreground text-balance">
                  ¿Cómo puedo ayudarte con tu estrategia de marca hoy?
                </p>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl">
                {features.map((feature, index) => (
                  <Card key={index} className="bg-card border-border hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-card-foreground mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-6xl mx-auto">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "user" ? (
                    <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-primary text-primary-foreground">
                      <MarkdownRenderer content={msg.content} className="text-primary-foreground" />
                      <p className="text-xs opacity-70 mt-2">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                    </div>
                  ) : (
                    <div className="w-full max-w-5xl">
                      {msg.conceptual && msg.accional ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Análisis Conceptual */}
                          <Card className="bg-card border-border">
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center text-lg">
                                <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                                Análisis Conceptual
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <MarkdownRenderer content={msg.conceptual} className="text-card-foreground" />
                            </CardContent>
                          </Card>

                          {/* Plan de Acción */}
                          <Card className="bg-card border-border">
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center text-lg">
                                <Target className="h-5 w-5 mr-2 text-primary" />
                                Plan de Acción
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <MarkdownRenderer content={msg.accional} className="text-card-foreground" />
                            </CardContent>
                          </Card>
                        </div>
                      ) : (
                        <div className="bg-card text-card-foreground border border-border px-6 py-4 rounded-lg">
                          <MarkdownRenderer content={msg.content} className="text-card-foreground" />
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2 ml-2">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-card text-card-foreground border border-border px-4 py-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span>Erasmo está analizando tu consulta...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-2 bg-input border border-border rounded-lg p-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Paperclip className="h-4 w-4" />
              </Button>

              <Input
                placeholder="Pregúntame cualquier cosa sobre estrategia de marca..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                className="flex-1 border-0 bg-transparent focus-visible:ring-0"
                disabled={isLoading} // Disable input while loading
              />

              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Mic className="h-4 w-4" />
              </Button>

              <Button
                onClick={sendMessage}
                disabled={!message.trim() || isLoading} // Better disabled state
                className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Conversación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar esta conversación? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => conversationToDelete && deleteConversation(conversationToDelete)}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditingTitle} onOpenChange={setIsEditingTitle}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Título de Conversación</DialogTitle>
            <DialogDescription>Cambia el título de esta conversación para organizarla mejor.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Nuevo título..."
              onKeyPress={(e) => {
                if (e.key === "Enter" && currentConversation) {
                  updateConversationTitle(currentConversation, newTitle)
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingTitle(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => currentConversation && updateConversationTitle(currentConversation, newTitle)}
              disabled={!newTitle.trim()}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
