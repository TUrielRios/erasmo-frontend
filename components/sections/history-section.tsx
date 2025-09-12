"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { History, Search, MessageSquare, Clock, Download, Trash2, Filter, RefreshCw } from "lucide-react"

interface Conversation {
  id: string
  title: string
  message_count: number
  created_at: string
  updated_at: string
  last_message_preview: string
  status: "active" | "archived"
}

export default function HistorySection() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sortBy, setSortBy] = useState("updated_at")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    loadAllConversations()
    loadRecentConversations()
  }, [])

  const loadAllConversations = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch("http://localhost:8000/api/v1/chat/conversations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.log("[v0] Failed to load conversations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadRecentConversations = async () => {
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch("http://localhost:8000/api/v1/chat/recent", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setRecentConversations(data.conversations || [])
      }
    } catch (error) {
      console.log("[v0] Failed to load recent conversations:", error)
    }
  }

  const searchConversations = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`http://localhost:8000/api/v1/chat/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.conversations || [])
      }
    } catch (error) {
      console.log("[v0] Failed to search conversations:", error)
    } finally {
      setIsLoading(false)
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
        loadAllConversations()
        loadRecentConversations()
      }
    } catch (error) {
      console.log("[v0] Failed to delete conversation:", error)
    }
  }

  const filteredAndSortedConversations = conversations
    .filter((conv) => {
      if (filterStatus === "all") return true
      return conv.status === filterStatus
    })
    .sort((a, b) => {
      if (sortBy === "updated_at") {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      }
      if (sortBy === "created_at") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      if (sortBy === "message_count") {
        return b.message_count - a.message_count
      }
      return 0
    })

  const ConversationCard = ({ conversation }: { conversation: Conversation }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{conversation.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {conversation.last_message_preview || "Sin mensajes"}
            </p>
          </div>
          <Badge variant={conversation.status === "active" ? "default" : "secondary"}>
            {conversation.status === "active" ? "Activa" : "Archivada"}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <MessageSquare className="h-3 w-3 mr-1" />
              {conversation.message_count} mensajes
            </span>
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(conversation.updated_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => exportConversation(conversation.id)}>
            <Download className="h-3 w-3 mr-1" />
            Exportar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => deleteConversation(conversation.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Historial de Conversaciones</h2>
        <p className="text-muted-foreground">Explora y gestiona todas tus conversaciones con Erasmo</p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>Todas</span>
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Recientes</span>
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Buscar</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Todas las Conversaciones</CardTitle>
                  <CardDescription>{filteredAndSortedConversations.length} conversaciones encontradas</CardDescription>
                </div>
                <Button variant="outline" onClick={loadAllConversations} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Actualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="updated_at">Última actualización</SelectItem>
                      <SelectItem value="created_at">Fecha de creación</SelectItem>
                      <SelectItem value="message_count">Número de mensajes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="active">Activas</SelectItem>
                    <SelectItem value="archived">Archivadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAndSortedConversations.map((conversation) => (
                  <ConversationCard key={conversation.id} conversation={conversation} />
                ))}
              </div>

              {filteredAndSortedConversations.length === 0 && (
                <div className="text-center py-12">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No se encontraron conversaciones</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversaciones Recientes</CardTitle>
              <CardDescription>Tus conversaciones más recientes con Erasmo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentConversations.map((conversation) => (
                  <ConversationCard key={conversation.id} conversation={conversation} />
                ))}
              </div>

              {recentConversations.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay conversaciones recientes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Conversaciones</CardTitle>
              <CardDescription>Encuentra conversaciones específicas por contenido o título</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Buscar en conversaciones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && searchConversations()}
                  className="flex-1"
                />
                <Button onClick={searchConversations} disabled={isLoading}>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map((conversation) => (
                    <ConversationCard key={conversation.id} conversation={conversation} />
                  ))}
                </div>
              )}

              {searchQuery && searchResults.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No se encontraron resultados para "{searchQuery}"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
