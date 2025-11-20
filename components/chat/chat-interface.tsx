"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Menu, Loader2, Upload, Folder } from "lucide-react"
import { getUser } from "@/lib/auth"
import { projectFileService } from "@/lib/project-files"
import { chatService } from "@/lib/chat"
import { ShareConversationDialog } from "./share-conversation-dialog"
import { MessageItem } from "./chat-interface-components/MessageItem"
import { FileManager } from "./chat-interface-components/FileManager"
import { WelcomeScreen } from "./chat-interface-components/WelcomeScreen"
import { ChatInput } from "./chat-interface-components/ChatInput"
import { FileAttachmentArea } from "./FileAttachmentArea"
import { uploadAttachmentsToBackend, formatAttachmentsForBackend } from "@/lib/attachment-utils"
import type { Attachment } from "@/lib/attachment-utils"

// (I am pasting the user's code here, but since I can't copy-paste the whole thing from the prompt efficiently without bloating,
// I will assume the user wants me to WRITE the file with the content they provided.
// I will write the full content of the provided file here.)

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
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({})
  const [showFileManager, setShowFileManager] = useState(false)
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<any[]>([])
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [selectedCategory, setSelectedCategory] = useState<"instructions" | "knowledge_base" | "reference" | "general">(
    "knowledge_base",
  )
  const [requireAnalysis, setRequireAnalysis] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [conversationTitle, setConversationTitle] = useState("Nueva conversación")
  const [currentAssistantMessageId, setCurrentAssistantMessageId] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [showAttachmentArea, setShowAttachmentArea] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const toggleDropdown = (messageId: string, type: string) => {
    const key = `${messageId}-${type}`
    setOpenDropdowns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

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

  const handleStartEdit = (messageId: string, currentContent: string) => {
    setEditingMessageId(messageId)
    setEditingContent(currentContent)
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditingContent("")
  }

  const handleSaveEdit = async (messageId: string) => {
    const numericMessageId = Number(messageId)
    if (isNaN(numericMessageId) || messageId.startsWith("temp-")) {
      console.error("[EDIT MESSAGE] Invalid message ID for editing:", messageId)
      alert("No se puede editar un mensaje temporal. Espera a que se complete el envío.")
      handleCancelEdit()
      return
    }

    if (!editingContent.trim() || editingContent === messages.find((m) => m.id === messageId)?.content) {
      handleCancelEdit()
      return
    }

    try {
      const updatedMessage = await chatService.updateMessage(numericMessageId, {
        content: editingContent.trim(),
      })

      const editedMessageIndex = messages.findIndex((msg) => msg.id === messageId)

      const messagesToDelete = messages.slice(editedMessageIndex + 1)
      for (const msg of messagesToDelete) {
        const msgNumericId = Number(msg.id)
        if (!isNaN(msgNumericId) && !msg.id.startsWith("temp-")) {
          try {
            await chatService.deleteMessage(msgNumericId)
          } catch (error) {
            console.error("Error deleting message:", error)
          }
        }
      }

      const updatedMessages = messages.slice(0, editedMessageIndex).concat({
        ...messages[editedMessageIndex],
        content: updatedMessage.content,
        timestamp: updatedMessage.timestamp,
      })

      setMessages(updatedMessages)
      handleCancelEdit()

      setIsLoading(true)

      const assistantMessageId = (Date.now() + 1).toString()
      const assistantMessage: Message = {
        id: assistantMessageId,
        content: "",
        role: "assistant",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      const requestBody = {
        message: updatedMessage.content,
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

                if (parsed.type === "assistant_message_id" && !currentAssistantMessageId) {
                  setCurrentAssistantMessageId(parsed.message_id.toString())
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id ? { ...msg, id: currentAssistantMessageId } : msg,
                    ),
                  )
                }

                const targetMessageId = currentAssistantMessageId || assistantMessage.id
                if (parsed.content) {
                  accumulatedContent += parsed.content

                  setMessages((prev) =>
                    prev.map((msg) => (msg.id === targetMessageId ? { ...msg, content: accumulatedContent } : msg)),
                  )
                }
              } catch (e) {
                console.debug("[STREAM] Skipping incomplete chunk")
              }
            }
          }
        }
      }

      if (!accumulatedContent) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === currentAssistantMessageId
              ? { ...msg, content: "Lo siento, no pude generar una respuesta." }
              : msg,
          ),
        )
      }
    } catch (error) {
      console.error("Error updating message:", error)
      alert("Error al actualizar el mensaje. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
      setCurrentAssistantMessageId(null)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este mensaje?")) return

    const numericMessageId = Number(messageId)
    if (isNaN(numericMessageId) || messageId.startsWith("temp-")) {
      console.error("[DELETE MESSAGE] Invalid message ID for deletion:", messageId)
      alert("No se puede eliminar un mensaje temporal.")
      return
    }

    try {
      await chatService.deleteMessage(numericMessageId)

      setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
    } catch (error) {
      console.error("Error deleting message:", error)
      alert("Error al eliminar el mensaje. Intenta de nuevo.")
    }
  }

  const handleAttachFile = (files: FileList) => {
    const newAttachments: Attachment[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const isImage = file.type.startsWith("image/")

      const attachment: Attachment = {
        file,
        id: `${Date.now()}-${i}`,
        type: isImage ? "image" : "document",
        filename: file.name,
      }

      // Generate preview for images
      if (isImage) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setAttachments((prev) =>
            prev.map((att) => (att.id === attachment.id ? { ...att, preview: e.target?.result as string } : att)),
          )
        }
        reader.readAsDataURL(file)
      }

      newAttachments.push(attachment)
    }

    setAttachments((prev) => [...prev, ...newAttachments])
    setShowAttachmentArea(true)
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
    if (attachments.length - 1 === 0) {
      setShowAttachmentArea(false)
    }
  }

  const handleAttachmentsChange = (updatedAttachments: Attachment[]) => {
    setAttachments(updatedAttachments)
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
    if ((!inputValue.trim() && attachments.length === 0) || !conversationId || isLoading || !user) return

    const tempUserMessageId = `temp-user-${Date.now()}`
    let userMessageContent = inputValue.trim()
    if (attachments.length > 0) {
      const attachmentNames = attachments.map((a) => a.filename).join(", ")
      userMessageContent = userMessageContent
        ? `${userMessageContent}\n\n[Archivos adjuntos: ${attachmentNames}]`
        : `[Archivos adjuntos: ${attachmentNames}]`
    }

    const userMessage: Message = {
      id: tempUserMessageId,
      content: userMessageContent,
      role: "user",
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    const messageContent = inputValue.trim()
    setInputValue("")
    const currentAttachments = [...attachments]
    setAttachments([])
    setShowAttachmentArea(false)
    setIsLoading(true)

    const tempAssistantMessageId = `temp-assistant-${Date.now() + 1}`
    const assistantMessage: Message = {
      id: tempAssistantMessageId,
      content: "",
      role: "assistant",
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, assistantMessage])
    setCurrentAssistantMessageId(tempAssistantMessageId)

    try {
      let uploadedAttachments: Attachment[] = []
      if (currentAttachments.length > 0) {
        console.log("[CHAT] Uploading attachments...", currentAttachments.length)
        uploadedAttachments = await uploadAttachmentsToBackend(currentAttachments, user.id, API_URL)
        console.log("[CHAT] Attachments uploaded:", uploadedAttachments.length)
      }

      const attachmentsForBackend =
        uploadedAttachments.length > 0 ? formatAttachmentsForBackend(uploadedAttachments) : undefined

      const requestBody = {
        message: messageContent,
        session_id: conversationId,
        user_id: user.id,
        require_analysis: requireAnalysis,
        ...(projectId && { project_id: projectId }),
        ...(attachmentsForBackend && { attachments: attachmentsForBackend }),
      }

      console.log("[CHAT] Sending message with attachments:", requestBody.attachments?.length || 0)

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
      let realAssistantMessageId: string | null = null

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

                if (parsed.type === "assistant_message_id" && !realAssistantMessageId) {
                  realAssistantMessageId = parsed.message_id.toString()
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === tempAssistantMessageId ? { ...msg, id: realAssistantMessageId } : msg,
                    ),
                  )
                }

                const targetMessageId = realAssistantMessageId || tempAssistantMessageId
                if (parsed.content) {
                  accumulatedContent += parsed.content

                  setMessages((prev) =>
                    prev.map((msg) => (msg.id === targetMessageId ? { ...msg, content: accumulatedContent } : msg)),
                  )
                }
              } catch (e) {
                console.debug("[STREAM] Skipping incomplete chunk")
              }
            }
          }
        }
      }

      if (!accumulatedContent) {
        const targetMessageId = realAssistantMessageId || tempAssistantMessageId
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === targetMessageId ? { ...msg, content: "Lo siento, no pude generar una respuesta." } : msg,
          ),
        )
      }

      if (messages.length === 0) {
        try {
          const words = messageContent.split(" ").slice(0, 6).join(" ")
          const newTitle = words.length < messageContent.length ? words + "..." : words

          await fetch(
            `${API_URL}/api/v1/chat/conversations/${conversationId}/title?user_id=${user.id}&new_title=${encodeURIComponent(newTitle)}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
            },
          )

          setConversationTitle(newTitle)
        } catch (error) {
          console.error("[CHAT] Error updating conversation title:", error)
        }
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

      const targetMessageId = tempAssistantMessageId
      setMessages((prev) => prev.map((msg) => (msg.id === targetMessageId ? { ...msg, content: errorContent } : msg)))
    } finally {
      setIsLoading(false)
      setCurrentAssistantMessageId(null)
    }
  }

  const createNewConversation = async () => {
    try {
      if (!user?.id) {
        console.error("[CREATE CONVERSATION] No user ID available")
        alert("Error: No se pudo obtener la información del usuario")
        return
      }

      const requestBody = {
        title: "Nueva conversación",
        project_id: projectId || null,
      }

      const response = await fetch(`${API_URL}/api/v1/chat/conversations?user_id=${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error("Error al crear conversación")
      }

      const newConversation = await response.json()

      if (onConversationCreated) {
        onConversationCreated(newConversation.session_id)
      }
    } catch (error) {
      console.error("[CREATE CONVERSATION] Error:", error)
      alert("Error al crear conversación. Intenta de nuevo.")
    }
  }

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
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-6 bg-white">
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

          <div className="flex items-center space-x-3">
            {conversationId && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowShareDialog(true)}
                className="flex items-center space-x-2 bg-primary hover:bg-primary/90"
              >
                <img src="/icons/descarga.svg" alt="compartir icono" className="h-4 w-4 brightness-0 invert" />
                <span className="hidden sm:inline">Compartir</span>
              </Button>
            )}
            {projectId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFileManager(!showFileManager)}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Añadir archivos</span>
              </Button>
            )}
            <span className="text-sm font-medium text-primary px-4 py-1.5 rounded-full bg-[#EBEEFF]">
              {user?.company?.name}
            </span>
          </div>
        </div>
      </div>

      {/* File Manager Panel */}
      {showFileManager && projectId && (
        <FileManager
          projectId={projectId}
          projectFiles={projectFiles}
          isLoadingFiles={isLoadingFiles}
          uploadingFiles={uploadingFiles}
          pendingFiles={pendingFiles}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onFileSelect={handleFileSelect}
          onRemovePendingFile={handleRemovePendingFile}
          onConfirmUpload={handleConfirmUpload}
          onDeleteFile={handleDeleteFile}
          onClose={() => setShowFileManager(false)}
        />
      )}

      {showAttachmentArea && (
        <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <FileAttachmentArea
              attachments={attachments}
              onRemove={removeAttachment}
              onAttachmentsChange={handleAttachmentsChange}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {/* Messages Area */}
      {!conversationId ? (
        <WelcomeScreen userName={user?.full_name || user?.username} />
      ) : (
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 overflow-auto bg-white">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8"></div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  editingMessageId={editingMessageId}
                  editingContent={editingContent}
                  openDropdowns={openDropdowns}
                  onStartEdit={handleStartEdit}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                  onDeleteMessage={handleDeleteMessage}
                  onEditingContentChange={setEditingContent}
                  onToggleDropdown={toggleDropdown}
                />
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg px-4 py-3 mr-12">
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

      {/* Input */}
      {conversationId ? (
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={sendMessage}
          isLoading={isLoading}
          requireAnalysis={requireAnalysis}
          onRequireAnalysisChange={setRequireAnalysis}
          hasConversation={true}
          onAttachFile={handleAttachFile}
          attachmentCount={attachments.length}
        />
      ) : (
        <div className="border-border py-4 bg-white">
          <div className="max-w-4xl mx-auto px-8">
            <ChatInput
              value={inputValue}
              onChange={setInputValue}
              onSubmit={(e) => {
                e.preventDefault()
                if (inputValue.trim()) {
                  createNewConversation()
                }
              }}
              isLoading={isLoading}
              requireAnalysis={requireAnalysis}
              onRequireAnalysisChange={setRequireAnalysis}
              hasConversation={false}
              onAttachFile={handleAttachFile}
              attachmentCount={attachments.length}
            />
          </div>
        </div>
      )}

      {conversationId && (
        <ShareConversationDialog
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          conversationId={conversationId}
          conversationTitle={conversationTitle}
        />
      )}
    </div>
  )
}
