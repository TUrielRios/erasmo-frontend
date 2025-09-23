"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { getUser, isAuthenticated } from "@/lib/auth"

export default function ChatPage() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
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

  return (
    <div className="h-screen bg-background flex">
      {/* Sidebar */}
      <ChatSidebar
        activeConversationId={activeConversationId}
        onConversationSelect={setActiveConversationId}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatInterface conversationId={activeConversationId} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      </div>
    </div>
  )
}
