"use client"

import { ChatInterface } from "@/components/chat/chat-interface"
import { useParams } from "next/navigation"

export default function ChatPage() {
  const params = useParams()
  const id = params.id as string

  return (
    <div className="h-screen w-full bg-background">
      <ChatInterface
        conversationId={id}
        projectId={null}
        projectName={null}
        onToggleSidebar={() => {
          console.log("Toggle sidebar")
        }}
      />
    </div>
  )
}
