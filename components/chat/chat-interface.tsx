"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Menu, Send, Brain, User, Loader2, ChevronDown, ChevronUp, Lightbulb, Target, Clock } from "lucide-react"
import { getUser } from "@/lib/auth"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: string
}

interface ChatInterfaceProps {
  conversationId: string | null
  onToggleSidebar: () => void
}

export function ChatInterface({ conversationId, onToggleSidebar }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [lastLoadedConversationId, setLastLoadedConversationId] = useState<string | null>(null)
  const [openDropdowns, setOpenDropdowns] = useState({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const user = getUser()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const toggleDropdown = (messageId, type) => {
    const key = `${messageId}-${type}`;
    setOpenDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Efecto para resetear lastLoadedConversationId cuando cambia la conversación
  useEffect(() => {
    console.log("[CHAT] Conversation ID changed:", { 
      old: lastLoadedConversationId, 
      new: conversationId 
    })
  }, [conversationId, lastLoadedConversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!conversationId || !user?.id) {
      setMessages([])
      setLastLoadedConversationId(null)
      return
    }

    // Si ya cargamos esta conversación, no volver a cargarla EXCEPTO si cambiamos explícitamente
    if (lastLoadedConversationId === conversationId) {
      console.log("[CHAT] Conversation already loaded, skipping:", conversationId)
      return
    }

    // Prevenir múltiples llamadas con la misma conversationId
    let isCancelled = false

    const fetchMessages = async () => {
      if (isCancelled) return
      
      console.log("[CHAT] Starting to fetch conversation:", conversationId)
      setIsLoadingMessages(true)
      
      try {
        const response = await fetch(`http://localhost:8000/api/v1/chat/conversations/${conversationId}?user_id=${user.id}&message_limit=100`, {
          headers: {
            "Content-Type": "application/json",
          },
        })

        console.log("[CHAT] Conversation response status:", response.status)

        if (isCancelled) return // Cancelar si el componente se desmontó o cambió

        if (response.ok) {
          const data = await response.json()
          console.log("[CHAT] Conversation data received:")
          console.log("- Session ID:", data.session_id)
          console.log("- Title:", data.title)
          console.log("- Message count:", data.message_count)
          console.log("- Messages array length:", data.messages?.length || 0)
          console.log("- Raw messages:", data.messages)
          
          // Transformar los mensajes del formato del backend al formato del frontend
          const transformedMessages = (data.messages || []).map((msg: any, index: number) => {
            console.log(`[CHAT] Processing message ${index}:`, msg)
            return {
              id: msg.id?.toString() || `msg-${Date.now()}-${index}`,
              content: msg.content || msg.message || msg.text || "",
              role: (msg.role === "user" || msg.sender === "user") ? "user" : "assistant",
              timestamp: msg.timestamp || msg.created_at || msg.date || new Date().toISOString(),
            }
          })
          
          console.log("[CHAT] Transformed messages:", transformedMessages)
          
          if (!isCancelled) {
            setMessages(transformedMessages)
            setLastLoadedConversationId(conversationId)
            console.log(`[CHAT] Successfully loaded ${transformedMessages.length} messages for conversation:`, conversationId)
          }
        } else if (response.status === 404) {
          console.log("[CHAT] Conversation not found, setting empty messages")
          if (!isCancelled) {
            setMessages([])
            setLastLoadedConversationId(conversationId)
          }
        } else {
          const errorText = await response.text()
          console.error("[CHAT] Error fetching conversation:", response.status, errorText)
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
          console.log("[CHAT] Finished loading conversation:", conversationId)
        }
      }
    }

    // Pequeño delay para evitar llamadas muy rápidas
    const timeoutId = setTimeout(() => {
      if (!isCancelled) {
        fetchMessages()
      }
    }, 100)

    // Cleanup function para cancelar la petición si el efecto se ejecuta de nuevo
    return () => {
      isCancelled = true
      clearTimeout(timeoutId)
    }
  }, [conversationId, user?.id, lastLoadedConversationId]) // Agregar lastLoadedConversationId a las dependencias

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

    try {
      console.log("[CHAT] Sending message:", userMessage.content)
      console.log("[CHAT] Using session_id (conversationId):", conversationId)
      console.log("[CHAT] User ID:", user.id)
      
      const requestBody = {
        message: userMessage.content, // Cambiar de 'query' a 'message'
        session_id: conversationId,
        user_id: user.id,
      }
      
      console.log("[CHAT] Request body:", JSON.stringify(requestBody, null, 2))
      
      // Usar el endpoint de query con session_id (que es el conversationId)
      const response = await fetch(`http://localhost:8000/api/v1/query?user_id=${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("[CHAT] Query response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[CHAT] AI response received:", data)
        
        // Guardar la respuesta completa como objeto para poder detectar estructura
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data, // Guardar toda la respuesta como objeto
          role: "assistant",
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, assistantMessage])
        
        console.log("[CHAT] Response saved as object")
        // No necesitamos recargar ya que acabamos de agregar el mensaje
      } else {
        const errorText = await response.text()
        console.error("[CHAT] Error sending message:", response.status, errorText)
        console.error("[CHAT] Request that failed:", JSON.stringify(requestBody, null, 2))
        
        let errorContent = "Lo siento, hubo un error al procesar tu mensaje."
        
        if (response.status === 422) {
          errorContent = "Error de validación. Verifica que todos los datos sean correctos."
          // Mostrar el error específico si está disponible
          try {
            const errorData = JSON.parse(errorText)
            console.error("[CHAT] Validation error details:", errorData)
            if (errorData.detail && Array.isArray(errorData.detail)) {
              const errorMessages = errorData.detail.map((err: any) => `${err.loc?.join('.')}: ${err.msg}`).join(', ')
              errorContent += ` Detalles: ${errorMessages}`
            }
          } catch (e) {
            console.error("[CHAT] Could not parse error response:", e)
          }
        } else if (response.status === 404) {
          errorContent = "Error: Sesión no encontrada. Por favor, crea una nueva conversación."
        } else if (response.status === 401) {
          errorContent = "Error de autenticación. Por favor, inicia sesión nuevamente."
        } else if (response.status === 500) {
          errorContent = "Error interno del servidor. Por favor, intenta nuevamente."
        }
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: errorContent,
          role: "assistant",
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      console.error("[CHAT] Network error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.",
        role: "assistant",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const WelcomeScreen = () => (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <Brain className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">¡Hola, {user?.full_name || user?.username}!</h2>
          <p className="text-muted-foreground">
            Soy Erasmo, tu asistente de IA especializado en estrategia de marca y marketing. ¿En qué puedo ayudarte hoy?
          </p>
        </div>

        <div className="space-y-3">
          <Card className="p-4 text-left hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="font-medium text-sm mb-1">Estrategia de Marca</h3>
            <p className="text-xs text-muted-foreground">Desarrolla una identidad de marca sólida y coherente</p>
          </Card>

          <Card className="p-4 text-left hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="font-medium text-sm mb-1">Campañas de Marketing</h3>
            <p className="text-xs text-muted-foreground">Crea campañas efectivas para tu público objetivo</p>
          </Card>

          <Card className="p-4 text-left hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="font-medium text-sm mb-1">Análisis Competitivo</h3>
            <p className="text-xs text-muted-foreground">Analiza tu posición en el mercado y la competencia</p>
          </Card>
        </div>
      </div>
    </div>
  )

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <p>No hay usuario logueado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-4 bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="md:hidden" onClick={onToggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-primary" />
              <div>
                <h1 className="font-semibold text-foreground">Erasmo</h1>
                <p className="text-xs text-muted-foreground">IA de estrategia de marca</p>
              </div>
            </div>
          </div>
          <Badge variant="primary" className="text-xs">
            {user?.company?.name}
          </Badge>
        </div>
      </div>

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
            <div className="space-y-4 max-w-4xl mx-auto -auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 bg-primary">
                      <AvatarFallback>
                        <Brain className="h-4 w-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2",
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.role === "assistant" ? (
                        // Intentar detectar si es respuesta estructurada
                        (() => {
                          let responseData = null;
                          try {
                            if (typeof message.content === 'object') {
                              responseData = message.content;
                            } else if (typeof message.content === 'string' && (message.content.includes('conceptual') || message.content.includes('accional'))) {
                              responseData = JSON.parse(message.content);
                            }
                          } catch (e) {
                            responseData = null;
                          }

                          // Si es respuesta estructurada, usar dropdowns
                          if (responseData && (responseData.conceptual || responseData.accional)) {
                            const hasConceptual = responseData.conceptual && responseData.conceptual.content;
                            const hasAccional = responseData.accional && responseData.accional.content;

                            return (
                              <div className="space-y-2 min-w-[400px] -mx-4 -my-2">
                                {hasConceptual && (
                                  <Card className="mb-3 border border-border hover:shadow-md transition-all duration-200">
                                    <button
                                      onClick={() => toggleDropdown(message.id, 'conceptual')}
                                      className="w-full p-4 text-left flex items-center justify-between hover:bg-accent/50 transition-colors rounded-t-lg"
                                    >
                                      <div className="flex items-center space-x-3">
                                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                          <Lightbulb className="h-5 w-5" />
                                        </div>
                                        <h3 className="font-semibold text-foreground">Análisis Conceptual</h3>
                                      </div>
                                      {openDropdowns[`${message.id}-conceptual`] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                    </button>
                                    
                                    {openDropdowns[`${message.id}-conceptual`] && (
                                      <div className="px-4 pb-4 border-t border-border bg-muted/20">
                                        <div className="pt-4 prose prose-sm max-w-none dark:prose-invert">
                                          {responseData.conceptual.content.split('\n').map((line, index) => {
                                            if (line.startsWith('### ')) return <h3 key={index} className="text-sm font-semibold mt-2 mb-1 text-foreground">{line.substring(4)}</h3>
                                            if (line.includes('**')) {
                                              const parts = line.split(/(\*\*.*?\*\*)/g)
                                              return <p key={index} className="mb-2 text-foreground">{parts.map((part, partIndex) => part.startsWith('**') && part.endsWith('**') ? <strong key={partIndex}>{part.slice(2, -2)}</strong> : part)}</p>
                                            }
                                            if (/^\d+\.\s/.test(line)) return <div key={index} className="ml-4 mb-1 text-foreground">{line}</div>
                                            if (line.startsWith('- ')) return <div key={index} className="ml-4 mb-1 text-foreground">• {line.substring(2)}</div>
                                            if (line.trim() === '') return <br key={index} />
                                            return <p key={index} className="mb-2 text-foreground">{line}</p>
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </Card>
                                )}
                                
                                {hasAccional && (
                                  <Card className="mb-3 border border-border hover:shadow-md transition-all duration-200">
                                    <button
                                      onClick={() => toggleDropdown(message.id, 'accional')}
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
                                              <Badge variant="secondary" className="text-xs flex items-center space-x-1">
                                                <Clock className="h-3 w-3" />
                                                <span>{responseData.accional.timeline}</span>
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      {openDropdowns[`${message.id}-accional`] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                    </button>
                                    
                                    {openDropdowns[`${message.id}-accional`] && (
                                      <div className="px-4 pb-4 border-t border-border bg-muted/20">
                                        <div className="pt-4 prose prose-sm max-w-none dark:prose-invert">
                                          {responseData.accional.content.split('\n').map((line, index) => {
                                            if (line.startsWith('### ')) return <h3 key={index} className="text-sm font-semibold mt-2 mb-1 text-foreground">{line.substring(4)}</h3>
                                            if (line.includes('**')) {
                                              const parts = line.split(/(\*\*.*?\*\*)/g)
                                              return <p key={index} className="mb-2 text-foreground">{parts.map((part, partIndex) => part.startsWith('**') && part.endsWith('**') ? <strong key={partIndex}>{part.slice(2, -2)}</strong> : part)}</p>
                                            }
                                            if (/^\d+\.\s/.test(line)) return <div key={index} className="ml-4 mb-1 text-foreground">{line}</div>
                                            if (line.startsWith('   - ')) return <div key={index} className="ml-8 mb-1 text-foreground">• {line.substring(5)}</div>
                                            if (line.startsWith('- ')) return <div key={index} className="ml-4 mb-1 text-foreground">• {line.substring(2)}</div>
                                            if (line.trim() === '') return <br key={index} />
                                            return <p key={index} className="mb-2 text-foreground">{line}</p>
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </Card>
                                )}
                                <p className="text-xs opacity-70 mt-2 px-4">{new Date(message.timestamp).toLocaleTimeString()}</p>
                              </div>
                            );
                          }

                          // Si no es respuesta estructurada, usar el renderizado original
                          const content = typeof message.content === 'object' ? 
                            (message.content.conceptual?.content || message.content.accional?.content || JSON.stringify(message.content)) : 
                            message.content;

                          return (
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              {content.split('\n').map((line, index) => {
                                // Títulos con #
                                if (line.startsWith('# ')) {
                                  return <h1 key={index} className="text-lg font-bold mt-4 mb-2">{line.substring(2)}</h1>
                                }
                                if (line.startsWith('## ')) {
                                  return <h2 key={index} className="text-base font-semibold mt-3 mb-2">{line.substring(3)}</h2>
                                }
                                if (line.startsWith('### ')) {
                                  return <h3 key={index} className="text-sm font-semibold mt-2 mb-1">{line.substring(4)}</h3>
                                }
                                // Línea separadora
                                if (line === '---') {
                                  return <hr key={index} className="my-4 border-border" />
                                }
                                // Texto en negrita **texto**
                                if (line.includes('**')) {
                                  const parts = line.split(/(\*\*.*?\*\*)/g)
                                  return (
                                    <p key={index} className="mb-2">
                                      {parts.map((part, partIndex) => 
                                        part.startsWith('**') && part.endsWith('**') ? 
                                          <strong key={partIndex}>{part.slice(2, -2)}</strong> : 
                                          part
                                      )}
                                    </p>
                                  )
                                }
                                // Lista con números
                                if (/^\d+\.\s/.test(line)) {
                                  return <div key={index} className="ml-4 mb-1">{line}</div>
                                }
                                // Lista con guiones
                                if (line.startsWith('   - ')) {
                                  return <div key={index} className="ml-8 mb-1">• {line.substring(5)}</div>
                                }
                                if (line.startsWith('- ')) {
                                  return <div key={index} className="ml-4 mb-1">• {line.substring(2)}</div>
                                }
                                // Líneas vacías
                                if (line.trim() === '') {
                                  return <br key={index} />
                                }
                                // Texto normal
                                return <p key={index} className="mb-2">{line}</p>
                              })}
                            </div>
                          );
                        })()
                      ) : (
                        // Para mensajes del usuario, renderizado simple
                        message.content
                      )}
                    </div>
                    {!(typeof message.content === 'object' && (message.content.conceptual || message.content.accional)) && (
                      <p className="text-xs opacity-70 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
                    )}
                  </div>

                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 bg-secondary">
                      <AvatarFallback>
                        <User className="h-4 w-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 bg-primary">
                    <AvatarFallback>
                      <Brain className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Erasmo está pensando...</span>
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
        <div className="border-t border-border p-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe tu mensaje sobre branding o marketing..."
                disabled={isLoading}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
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