"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Menu,
  Send,
  Brain,
  Loader2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  Clock,
  Folder,
  Upload,
  File,
  Trash2,
  CheckCircle,
  AlertCircle,
  Plus,
} from "lucide-react"
import { getUser } from "@/lib/auth"
import { projectFileService } from "@/lib/project-files"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: string
}

interface ChatInterfaceProps {
  conversationId: string | null
  projectId: number | null
  projectName: string | null
  onToggleSidebar: () => void
  onConversationCreated?: (sessionId: string) => void
}

interface ProjectFile {
  id: number
  project_id: number
  filename: string
  original_filename: string
  file_size: number
  file_type: string
  category: "instructions" | "knowledge_base" | "reference" | "general"
  priority: number
  is_active: boolean
  created_at: string
}

// Get API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export function ChatInterface({
  conversationId,
  projectId,
  projectName,
  onToggleSidebar,
  onConversationCreated,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [lastLoadedConversationId, setLastLoadedConversationId] = useState<string | null>(null)
  const [openDropdowns, setOpenDropdowns] = useState({})
  const [showFileManager, setShowFileManager] = useState(false)
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState([])
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [selectedCategory, setSelectedCategory] = useState<"instructions" | "knowledge_base" | "reference" | "general">(
    "knowledge_base",
  )
  const [requireAnalysis, setRequireAnalysis] = useState(false)
  const [user, setUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load user on mount
  useEffect(() => {
    const currentUser = getUser()
    console.log("[CHAT INTERFACE] User loaded:", currentUser)
    setUser(currentUser)
  }, [])

  const categories = [
    {
      value: "instructions" as const,
      label: "Instrucciones",
      description: "Guías y reglas específicas",
      icon: "📋",
    },
    {
      value: "knowledge_base" as const,
      label: "Conocimiento",
      description: "Información general",
      icon: "📚",
    },
    {
      value: "reference" as const,
      label: "Referencia",
      description: "Documentos de consulta",
      icon: "🔖",
    },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const toggleDropdown = (messageId, type) => {
    const key = `${messageId}-${type}`
    setOpenDropdowns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  // Load project files when projectId changes
  useEffect(() => {
    if (projectId && showFileManager) {
      loadProjectFiles()
    }
  }, [projectId, showFileManager])

  const loadProjectFiles = async () => {
    if (!projectId) return

    setIsLoadingFiles(true)
    try {
      const files = await projectFileService.getProjectFiles(projectId)
      setProjectFiles(files.filter((f) => f && typeof f === "object"))
    } catch (error) {
      console.error("Error loading project files:", error)
    } finally {
      setIsLoadingFiles(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    setPendingFiles((prev) => [...prev, ...selectedFiles])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemovePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleConfirmUpload = async () => {
    if (pendingFiles.length === 0 || !projectId) return

    const filesToUpload = [...pendingFiles]
    setPendingFiles([])

    const newUploadingFiles = filesToUpload.map((file) => ({
      file,
      id: Date.now() + Math.random(),
      progress: 0,
      status: "uploading" as const,
    }))

    setUploadingFiles((prev) => [...prev, ...newUploadingFiles])

    for (const uploadingFile of newUploadingFiles) {
      try {
        const result = await projectFileService.uploadFile(projectId, uploadingFile.file, selectedCategory, 1)

        setUploadingFiles((prev) =>
          prev.map((f) => (f.id === uploadingFile.id ? { ...f, status: "success" as const, progress: 100 } : f)),
        )

        if (result?.file && typeof result.file === "object") {
          setProjectFiles((prev) => [...prev, result.file])
        }

        setTimeout(() => {
          setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadingFile.id))
        }, 2000)
      } catch (err) {
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === uploadingFile.id ? { ...f, status: "error" as const, error: (err as Error).message } : f,
          ),
        )
      }
    }
  }

  const handleDeleteFile = async (fileId: number) => {
    if (!confirm("¿Estás seguro de eliminar este archivo?") || !projectId) return

    try {
      await projectFileService.deleteProjectFile(projectId, fileId)
      setProjectFiles((prev) => prev.filter((f) => f.id !== fileId))
    } catch (err) {
      console.error("Error al eliminar el archivo:", err)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!conversationId || !user?.id) {
      setMessages([])
      setLastLoadedConversationId(null)
      return
    }

    if (lastLoadedConversationId === conversationId) {
      return
    }

    let isCancelled = false

    const fetchMessages = async () => {
      if (isCancelled) return

      setIsLoadingMessages(true)

      try {
        const response = await fetch(
          `${API_URL}/api/v1/chat/conversations/${conversationId}?user_id=${user.id}&message_limit=100`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        )

        if (isCancelled) return

        if (response.ok) {
          const data = await response.json()

          const transformedMessages = (data.messages || []).map((msg: any, index: number) => ({
            id: msg.id?.toString() || `msg-${Date.now()}-${index}`,
            content: msg.content || msg.message || msg.text || "",
            role: msg.role === "user" || msg.sender === "user" ? "user" : "assistant",
            timestamp: msg.timestamp || msg.created_at || msg.date || new Date().toISOString(),
          }))

          if (!isCancelled) {
            setMessages(transformedMessages)
            setLastLoadedConversationId(conversationId)
          }
        } else if (response.status === 404) {
          if (!isCancelled) {
            setMessages([])
            setLastLoadedConversationId(conversationId)
          }
        } else {
          if (!isCancelled) {
            setMessages([])
            setLastLoadedConversationId(conversationId)
          }
        }
      } catch (error) {
        console.error("[CHAT] Network error fetching conversation:", error)
        if (!isCancelled) {
          setMessages([])
          setLastLoadedConversationId(conversationId)
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingMessages(false)
        }
      }
    }

    const timeoutId = setTimeout(() => {
      if (!isCancelled) {
        fetchMessages()
      }
    }, 100)

    return () => {
      isCancelled = true
      clearTimeout(timeoutId)
    }
  }, [conversationId, user?.id, lastLoadedConversationId])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !conversationId || isLoading || !user) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: "user",
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      content: "",
      role: "assistant",
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, assistantMessage])

    try {
      const requestBody = {
        message: userMessage.content,
        session_id: conversationId,
        user_id: user.id,
        require_analysis: requireAnalysis,
        ...(projectId && { project_id: projectId }),
      }

      const queryParams = new URLSearchParams({
        user_id: user.id.toString(),
      })

      const response = await fetch(`${API_URL}/api/v1/query/stream?${queryParams}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()

          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim()

              if (data === "[DONE]") {
                continue
              }

              try {
                const parsed = JSON.parse(data)

                if (parsed.content) {
                  accumulatedContent += parsed.content

                  setMessages((prev) =>
                    prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, content: accumulatedContent } : msg)),
                  )
                }
              } catch (e) {
                // Ignore JSON parse errors for incomplete chunks
                console.debug("[STREAM] Skipping incomplete chunk")
              }
            }
          }
        }
      }

      if (!accumulatedContent) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: "Lo siento, no pude generar una respuesta." } : msg,
          ),
        )
      }
    } catch (error) {
      console.error("[CHAT] Error sending message:", error)

      let errorContent = "Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente."

      if (error instanceof Error) {
        if (error.message.includes("401") || error.message.includes("403")) {
          errorContent = "Error de autenticación. Por favor, inicia sesión nuevamente."
        } else if (error.message.includes("404")) {
          errorContent = "Error: Sesión no encontrada. Por favor, crea una nueva conversación."
        } else if (error.message.includes("500")) {
          errorContent = "Error interno del servidor. Por favor, intenta nuevamente."
        }
      }

      setMessages((prev) =>
        prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, content: errorContent } : msg)),
      )
    } finally {
      setIsLoading(false)
    }
  }

  const createNewConversation = async () => {
    try {
      console.log("[CREATE CONVERSATION] User:", user)

      if (!user?.id) {
        console.error("[CREATE CONVERSATION] No user ID available")
        alert("Error: No se pudo obtener la información del usuario")
        return
      }

      const requestBody = {
        title: "Nueva conversación",
        project_id: projectId || null,
      }

      console.log("[CREATE CONVERSATION] Request:", {
        url: `${API_URL}/api/v1/chat/conversations?user_id=${user.id}`,
        body: requestBody,
      })

      const response = await fetch(`${API_URL}/api/v1/chat/conversations?user_id=${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("[CREATE CONVERSATION] Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[CREATE CONVERSATION] Error response:", errorText)
        throw new Error("Error al crear conversación")
      }

      const newConversation = await response.json()
      console.log("[CREATE CONVERSATION] New conversation:", newConversation)

      // Usar el callback en lugar de window.location.href
      if (onConversationCreated) {
        onConversationCreated(newConversation.session_id)
      }
    } catch (error) {
      console.error("[CREATE CONVERSATION] Error:", error)
      alert("Error al crear conversación. Intenta de nuevo.")
    }
  }

  const WelcomeScreen = () => (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <Brain className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">¡Hola, {user?.full_name || user?.username}!</h2>
          <p className="text-muted-foreground mb-6">
            Soy Erasmo, tu asistente de IA especializado en estrategia de marca y marketing. ¿En qué puedo ayudarte hoy?
          </p>
          <Button onClick={createNewConversation} size="lg" className="w-full max-w-xs">
            <Plus className="h-5 w-5 mr-2" />
            Iniciar nuevo chat
          </Button>
        </div>
      </div>
    </div>
  )

  const filesByCategory = categories.map((cat) => ({
    ...cat,
    files: projectFiles.filter((f) => f && typeof f === "object" && f.category === cat.value),
  }))

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-border p-4 bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="md:hidden" onClick={onToggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>

            {projectId && projectName ? (
              <div className="flex items-center space-x-3">
                <Folder className="h-5 w-5 text-primary" />
                <div>
                  <h1 className="font-semibold text-foreground">{projectName}</h1>
                  <p className="text-xs text-muted-foreground">Proyecto</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2"></div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {projectId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFileManager(!showFileManager)}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Añadir archivos</span>
              </Button>
            )}
            <Badge variant="primary" className="text-xs">
              {user?.company?.name}
            </Badge>
          </div>
        </div>
      </div>

      {/* File Manager Panel */}
      {showFileManager && projectId && (
        <div className="border-b border-border bg-muted/30">
          <div className="p-4 max-w-4xl mx-auto">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Categoría del archivo</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={cn(
                        "p-2 rounded-lg border-2 transition-all text-left",
                        selectedCategory === category.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{category.icon}</span>
                        <span className="font-medium text-xs">{category.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div
                className="p-6 border-2 border-dashed border-border rounded-lg text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground mb-1">Haz clic para subir archivos</p>
                <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, TXT, MD (Max 10MB)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.md,.csv,.xlsx"
                />
              </div>

              {pendingFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground">
                      Archivos seleccionados ({pendingFiles.length})
                    </h4>
                    <Button onClick={handleConfirmUpload} size="sm" className="flex items-center space-x-2">
                      <Upload className="h-4 w-4" />
                      <span>Subir archivos</span>
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {pendingFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-2 bg-background rounded-lg border border-border"
                      >
                        <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                          onClick={() => handleRemovePendingFile(index)}
                          className="p-1 hover:bg-destructive/10 rounded transition-all"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadingFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Subiendo archivos...</h4>
                  {uploadingFiles.map((uploadFile) => (
                    <div
                      key={uploadFile.id}
                      className="flex items-center space-x-3 p-2 bg-background rounded-lg border border-border"
                    >
                      <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                      </div>
                      {uploadFile.status === "uploading" && (
                        <Loader2 className="h-4 w-4 text-primary animate-spin flex-shrink-0" />
                      )}
                      {uploadFile.status === "success" && (
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      )}
                      {uploadFile.status === "error" && <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              )}

              {isLoadingFiles ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : projectFiles.length > 0 ? (
                <div className="space-y-3">
                  {filesByCategory.map(
                    (category) =>
                      category.files.length > 0 && (
                        <div key={category.value}>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm">{category.icon}</span>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                              {category.label} ({category.files.length})
                            </h4>
                          </div>
                          <div className="space-y-1">
                            {category.files.map((file) => (
                              <div
                                key={file.id}
                                className="flex items-center justify-between p-2 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors group"
                              >
                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                  <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">{file.original_filename}</p>
                                    <p className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteFile(file.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-all"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ),
                  )}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-4">No hay archivos en este proyecto</p>
              )}

              <Button variant="ghost" size="sm" onClick={() => setShowFileManager(false)} className="w-full">
                Cerrar gestor de archivos
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      {!conversationId ? (
        <WelcomeScreen />
      ) : (
        <ScrollArea className="flex-1 p-4 overflow-auto">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Comienza una conversación escribiendo un mensaje abajo
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex w-full", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-3",
                      message.role === "user" ? "bg-primary text-primary-foreground ml-12" : "bg-transparent mr-12",
                    )}
                  >
                    <div className="text-sm leading-relaxed">
                      {message.role === "assistant"
                        ? (() => {
                            let responseData = null
                            try {
                              if (typeof message.content === "object") {
                                responseData = message.content
                              } else if (
                                typeof message.content === "string" &&
                                (message.content.includes("conceptual") || message.content.includes("accional"))
                              ) {
                                responseData = JSON.parse(message.content)
                              }
                            } catch (e) {
                              responseData = null
                            }

                            if (
                              responseData &&
                              responseData.response_type !== "normal" &&
                              (responseData.conceptual || responseData.accional)
                            ) {
                              const hasConceptual = responseData.conceptual && responseData.conceptual.content
                              const hasAccional = responseData.accional && responseData.accional.content

                              return (
                                <div className="space-y-2 min-w-[400px]">
                                  {hasConceptual && (
                                    <Card className="mb-3 border border-border hover:shadow-md transition-all duration-200">
                                      <button
                                        onClick={() => toggleDropdown(message.id, "conceptual")}
                                        className="w-full p-4 text-left flex items-center justify-between hover:bg-accent/50 transition-colors rounded-t-lg"
                                      >
                                        <div className="flex items-center space-x-3">
                                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                            <Lightbulb className="h-5 w-5" />
                                          </div>
                                          <h3 className="font-semibold text-foreground">Análisis Conceptual</h3>
                                        </div>
                                        {openDropdowns[`${message.id}-conceptual`] ? (
                                          <ChevronUp className="h-5 w-5" />
                                        ) : (
                                          <ChevronDown className="h-5 w-5" />
                                        )}
                                      </button>

                                      {openDropdowns[`${message.id}-conceptual`] && (
                                        <div className="px-4 pb-4 border-t border-border bg-muted/20">
                                          <div className="pt-4 prose prose-sm max-w-none dark:prose-invert">
                                            {responseData.conceptual.content.split("\n").map((line, index) => {
                                              if (line.startsWith("### "))
                                                return (
                                                  <h3
                                                    key={index}
                                                    className="text-sm font-semibold mt-2 mb-1 text-foreground"
                                                  >
                                                    {line.substring(4)}
                                                  </h3>
                                                )
                                              if (line.includes("**")) {
                                                const parts = line.split(/(\*\*.*?\*\*)/g)
                                                return (
                                                  <p key={index} className="mb-2 text-foreground">
                                                    {parts.map((part, partIndex) =>
                                                      part.startsWith("**") && part.endsWith("**") ? (
                                                        <strong key={partIndex}>{part.slice(2, -2)}</strong>
                                                      ) : (
                                                        part
                                                      ),
                                                    )}
                                                  </p>
                                                )
                                              }
                                              if (/^\d+\.\s/.test(line))
                                                return (
                                                  <div key={index} className="ml-4 mb-1 text-foreground">
                                                    {line}
                                                  </div>
                                                )
                                              if (line.startsWith("- "))
                                                return (
                                                  <div key={index} className="ml-4 mb-1 text-foreground">
                                                    • {line.substring(2)}
                                                  </div>
                                                )
                                              if (line.trim() === "") return <br key={index} />
                                              return (
                                                <p key={index} className="mb-2 text-foreground">
                                                  {line}
                                                </p>
                                              )
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </Card>
                                  )}

                                  {hasAccional && (
                                    <Card className="mb-3 border border-border hover:shadow-md transition-all duration-200">
                                      <button
                                        onClick={() => toggleDropdown(message.id, "accional")}
                                        className="w-full p-4 text-left flex items-center justify-between hover:bg-accent/50 transition-colors rounded-t-lg"
                                      >
                                        <div className="flex items-center space-x-3">
                                          <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                                            <Target className="h-5 w-5" />
                                          </div>
                                          <div>
                                            <h3 className="font-semibold text-foreground">Plan de Acción</h3>
                                            <div className="flex items-center space-x-2 mt-1">
                                              {responseData.accional.priority && (
                                                <Badge variant="outline" className="text-xs">
                                                  {responseData.accional.priority}
                                                </Badge>
                                              )}
                                              {responseData.accional.timeline && (
                                                <Badge
                                                  variant="secondary"
                                                  className="text-xs flex items-center space-x-1"
                                                >
                                                  <Clock className="h-3 w-3" />
                                                  <span>{responseData.accional.timeline}</span>
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        {openDropdowns[`${message.id}-accional`] ? (
                                          <ChevronUp className="h-5 w-5" />
                                        ) : (
                                          <ChevronDown className="h-5 w-5" />
                                        )}
                                      </button>

                                      {openDropdowns[`${message.id}-accional`] && (
                                        <div className="px-4 pb-4 border-t border-border bg-muted/20">
                                          <div className="pt-4 prose prose-sm max-w-none dark:prose-invert">
                                            {responseData.accional.content.split("\n").map((line, index) => {
                                              if (line.startsWith("### "))
                                                return (
                                                  <h3
                                                    key={index}
                                                    className="text-sm font-semibold mt-2 mb-1 text-foreground"
                                                  >
                                                    {line.substring(4)}
                                                  </h3>
                                                )
                                              if (line.includes("**")) {
                                                const parts = line.split(/(\*\*.*?\*\*)/g)
                                                return (
                                                  <p key={index} className="mb-2 text-foreground">
                                                    {parts.map((part, partIndex) =>
                                                      part.startsWith("**") && part.endsWith("**") ? (
                                                        <strong key={partIndex}>{part.slice(2, -2)}</strong>
                                                      ) : (
                                                        part
                                                      ),
                                                    )}
                                                  </p>
                                                )
                                              }
                                              if (/^\d+\.\s/.test(line))
                                                return (
                                                  <div key={index} className="ml-4 mb-1 text-foreground">
                                                    {line}
                                                  </div>
                                                )
                                              if (line.startsWith("   - "))
                                                return (
                                                  <div key={index} className="ml-8 mb-1 text-foreground">
                                                    • {line.substring(5)}
                                                  </div>
                                                )
                                              if (line.startsWith("- "))
                                                return (
                                                  <div key={index} className="ml-4 mb-1 text-foreground">
                                                    • {line.substring(2)}
                                                  </div>
                                                )
                                              if (line.trim() === "") return <br key={index} />
                                              return (
                                                <p key={index} className="mb-2 text-foreground">
                                                  {line}
                                                </p>
                                              )
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </Card>
                                  )}
                                  <p className="text-xs opacity-70 mt-2">
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                  </p>
                                </div>
                              )
                            }

                            const content =
                              typeof message.content === "object"
                                ? message.content.conceptual?.content ||
                                  message.content.accional?.content ||
                                  JSON.stringify(message.content)
                                : message.content

                            return (
                              <div className="prose prose-sm max-w-none dark:prose-invert">
                                {content.split("\n").map((line, index) => {
                                  if (line.startsWith("# ")) {
                                    return (
                                      <h1 key={index} className="text-lg font-bold mt-4 mb-2">
                                        {line.substring(2)}
                                      </h1>
                                    )
                                  }
                                  if (line.startsWith("## ")) {
                                    return (
                                      <h2 key={index} className="text-base font-semibold mt-3 mb-2">
                                        {line.substring(3)}
                                      </h2>
                                    )
                                  }
                                  if (line.startsWith("### ")) {
                                    return (
                                      <h3 key={index} className="text-sm font-semibold mt-2 mb-1">
                                        {line.substring(4)}
                                      </h3>
                                    )
                                  }
                                  if (line === "---") {
                                    return <hr key={index} className="my-4 border-border" />
                                  }
                                  if (line.includes("**")) {
                                    const parts = line.split(/(\*\*.*?\*\*)/g)
                                    return (
                                      <p key={index} className="mb-2">
                                        {parts.map((part, partIndex) =>
                                          part.startsWith("**") && part.endsWith("**") ? (
                                            <strong key={partIndex}>{part.slice(2, -2)}</strong>
                                          ) : (
                                            part
                                          ),
                                        )}
                                      </p>
                                    )
                                  }
                                  if (/^\d+\.\s/.test(line)) {
                                    return (
                                      <div key={index} className="ml-4 mb-1">
                                        {line}
                                      </div>
                                    )
                                  }
                                  if (line.startsWith("   - ")) {
                                    return (
                                      <div key={index} className="ml-8 mb-1">
                                        • {line.substring(5)}
                                      </div>
                                    )
                                  }
                                  if (line.startsWith("- ")) {
                                    return (
                                      <div key={index} className="ml-4 mb-1">
                                        • {line.substring(2)}
                                      </div>
                                    )
                                  }
                                  if (line.trim() === "") {
                                    return <br key={index} />
                                  }
                                  return (
                                    <p key={index} className="mb-2">
                                      {line}
                                    </p>
                                  )
                                })}
                              </div>
                            )
                          })()
                        : message.content}
                    </div>
                    {!(
                      typeof message.content === "object" &&
                      (message.content.conceptual || message.content.accional)
                    ) && <p className="text-xs opacity-70 mt-2">{new Date(message.timestamp).toLocaleTimeString()}</p>}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80] rounded-lg px-4 py-3 mr-12">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      )}

      {/* Input Area */}
      {conversationId && (
        <div className="border-border p-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-2 mb-3">
              <Switch id="require-analysis" checked={requireAnalysis} onCheckedChange={setRequireAnalysis} />
              <Label htmlFor="require-analysis" className="text-sm text-muted-foreground cursor-pointer">
                Generar análisis conceptual y plan de acción estructurado
              </Label>
            </div>

            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe tu mensaje sobre branding o marketing..."
                disabled={isLoading}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage(e)
                  }
                }}
              />
              <Button onClick={sendMessage} disabled={isLoading || !inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
