export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: string
  session_id: string
}

export interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
  message_count: number
}

export interface ConversationWithMessages {
  id: string
  title: string
  created_at: string
  updated_at: string
  messages: Message[]
}

export interface QueryRequest {
  message: string
  session_id?: string
  response_level?: "conceptual" | "accional"
}

export interface QueryResponse {
  response: string
  session_id: string
  response_level: string
  clarification_questions?: string[]
  sources?: any[]
}

export interface ChatStats {
  total_conversations: number
  total_messages: number
  avg_messages_per_conversation: number
  most_active_day: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

class ChatService {
  private getAuthHeaders() {
    const token = localStorage.getItem("access_token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async sendQuery(request: QueryRequest): Promise<QueryResponse> {
    console.log("[v0] Sending query request:", request)
    console.log("[v0] Request headers:", this.getAuthHeaders())

    const response = await fetch(`${API_BASE_URL}/api/v1/query`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    })

    console.log("[v0] Query response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] Query error response:", errorText)

      try {
        const error = JSON.parse(errorText)
        throw new Error(error.detail || "Failed to send query")
      } catch (parseError) {
        throw new Error(`Server error: ${response.status} - ${errorText}`)
      }
    }

    const responseData = await response.json()
    console.log("[v0] Query response data:", responseData)
    return responseData
  }

  async createConversation(title: string): Promise<Conversation> {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/conversations`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ title }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to create conversation")
    }

    return response.json()
  }

  async getConversations(): Promise<Conversation[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/conversations`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to get conversations")
    }

    return response.json()
  }

  async getConversationWithMessages(sessionId: string): Promise<ConversationWithMessages> {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/conversations/${sessionId}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to get conversation")
    }

    return response.json()
  }

  async deleteConversation(sessionId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/conversations/${sessionId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to delete conversation")
    }
  }

  async updateConversationTitle(sessionId: string, title: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/conversations/${sessionId}/title`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ title }),
    })

    if (!response.ok) {
      throw new Error("Failed to update conversation title")
    }
  }

  async searchConversations(query: string): Promise<Conversation[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/search?q=${encodeURIComponent(query)}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to search conversations")
    }

    return response.json()
  }

  async getRecentConversations(): Promise<Conversation[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/recent`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to get recent conversations")
    }

    return response.json()
  }

  async getChatStats(): Promise<ChatStats> {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/stats`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to get chat stats")
    }

    return response.json()
  }

  async exportConversation(sessionId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/export/${sessionId}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to export conversation")
    }

    return response.blob()
  }
}

export const chatService = new ChatService()
