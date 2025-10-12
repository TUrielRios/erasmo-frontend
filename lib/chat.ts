import { getUser } from "./auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface Message {
  id: number
  conversation_id: number
  content: string
  role: "user" | "assistant"
  timestamp: string
}

export interface Conversation {
  id: number
  session_id: string
  user_id: number
  project_id: number | null
  title: string
  is_active: boolean
  created_at: string
  message_count?: number
}

export interface ConversationCreate {
  title: string
  project_id?: number | null
}

export interface ConversationUpdate {
  title?: string
}

export interface MessageCreate {
  conversation_id: number
  content: string
}

export interface MessageUpdate {
  content: string
}

export interface ConversationShare {
  shared_with_user_id: number
  can_edit: boolean
}

export interface ConversationShareResponse {
  id: number
  conversation_id: number
  shared_by_user_id: number
  shared_with_user_id: number
  can_edit: boolean
  created_at: string
}

class ChatService {
  private getAuthHeaders() {
    const token = localStorage.getItem("access_token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  // Conversations
  async createConversation(data: ConversationCreate): Promise<Conversation> {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/chat/conversations?user_id=${user.id}`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to create conversation")
    }

    return response.json()
  }

  async getConversations(projectId?: number): Promise<Conversation[]> {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    let url = `${API_BASE_URL}/api/v1/chat/conversations?user_id=${user.id}`
    if (projectId !== undefined) {
      url += `&project_id=${projectId}`
    }

    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to get conversations")
    }

    return response.json()
  }

  async getConversation(conversationId: number): Promise<Conversation> {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/chat/conversations/${conversationId}?user_id=${user.id}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to get conversation")
    }

    return response.json()
  }

  async updateConversation(conversationId: number, data: ConversationUpdate): Promise<Conversation> {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/chat/conversations/${conversationId}?user_id=${user.id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to update conversation")
    }

    return response.json()
  }

  async deleteConversation(conversationId: number): Promise<void> {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/chat/conversations/${conversationId}?user_id=${user.id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to delete conversation")
    }
  }

  // Messages
  async getMessages(conversationId: number): Promise<Message[]> {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/chat/conversations/${conversationId}/messages?user_id=${user.id}`,
      {
        headers: this.getAuthHeaders(),
      },
    )

    if (!response.ok) {
      throw new Error("Failed to get messages")
    }

    return response.json()
  }

  async createMessage(data: MessageCreate): Promise<Message> {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/chat/messages?user_id=${user.id}`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to create message")
    }

    return response.json()
  }

  async updateMessage(messageId: number, data: MessageUpdate): Promise<Message> {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/chat/messages/${messageId}?user_id=${user.id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to update message")
    }

    return response.json()
  }

  async deleteMessage(messageId: number): Promise<void> {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/chat/messages/${messageId}?user_id=${user.id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to delete message")
    }
  }

  // Sharing
  async shareConversation(conversationId: number, shareData: ConversationShare): Promise<ConversationShareResponse> {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/chat/conversations/${conversationId}/share?user_id=${user.id}`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(shareData),
      },
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to share conversation")
    }

    return response.json()
  }

  async getConversationShares(conversationId: number): Promise<ConversationShareResponse[]> {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/chat/conversations/${conversationId}/shares?user_id=${user.id}`,
      {
        headers: this.getAuthHeaders(),
      },
    )

    if (!response.ok) {
      throw new Error("Failed to get conversation shares")
    }

    return response.json()
  }

  async removeConversationShare(conversationId: number, shareId: number): Promise<void> {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/chat/conversations/${conversationId}/shares/${shareId}?user_id=${user.id}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      },
    )

    if (!response.ok) {
      throw new Error("Failed to remove conversation share")
    }
  }
}

export const chatService = new ChatService()
