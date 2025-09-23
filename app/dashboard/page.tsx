"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { ChatSidebar } from "@/components/chat/chat-sidebar"

import { LogOut, Settings, BarChart3, FileText, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string>()
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleNewConversation = () => {
    setSelectedConversationId(undefined)
  }

  const handleConversationCreated = (conversationId: string) => {
    setSelectedConversationId(conversationId)
  }

  const handleLogout = async () => {
    await logout()
    router.push("/auth")
  }

  // Check if user is admin (you might want to add an is_admin field to your User interface)
  const isAdmin = user?.username === "admin" || user?.work_area === "Administración"

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Chat con IA</h1>
            <p className="text-sm text-muted-foreground">Bienvenido, {user?.full_name}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/documents")}>
              <FileText className="h-4 w-4 mr-2" />
              Documentos
            </Button>
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => router.push("/admin")}>
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </Button>
            )}
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Estadísticas
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ChatSidebar
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
          onNewConversation={handleNewConversation}
        />

      </div>
    </div>
  )
}
