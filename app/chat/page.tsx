"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { getUser, isAuthenticated } from "@/lib/auth"

export default function ChatPage() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null)
  const [activeProjectName, setActiveProjectName] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    const user = getUser()
    if (user?.role === "admin") {
      router.push("/admin")
      return
    }
  }, [router])

  const handleConversationSelect = (sessionId: string, projectId: number | null, projectName: string | null) => {
    setActiveConversationId(sessionId)
    setActiveProjectId(projectId)
    setActiveProjectName(projectName)
  }

  const handleConversationCreated = (sessionId: string) => {
    console.log("[PAGE] New conversation created:", sessionId)
    setActiveConversationId(sessionId)
    // Forzar recarga de la sidebar
    window.dispatchEvent(new Event("conversationCreated"))
  }

  return (
    <div className="h-screen bg-background flex">
      {/* Sidebar */}
      <ChatSidebar
        activeConversationId={activeConversationId}
        onConversationSelect={handleConversationSelect}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatInterface
          conversationId={activeConversationId}
          projectId={activeProjectId}
          projectName={activeProjectName}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onConversationCreated={handleConversationCreated}
        />
      </div>
    </div>
  )
}
