import { getUser } from "./auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface Project {
  id: number
  name: string
  description: string | null
  user_id: number
  company_id: number
  is_active: boolean
  created_at: string
  updated_at: string
  conversation_count?: number
}

export interface ProjectCreate {
  name: string
  description?: string
}

export interface ProjectUpdate {
  name?: string
  description?: string
  is_active?: boolean
}

export interface ConversationShare {
  shared_with_user_id: number
  can_edit: boolean
  can_view: boolean
}

export interface ConversationShareResponse {
  id: number
  conversation_id: number
  shared_by_user_id: number
  shared_with_user_id: number
  can_edit: boolean
  can_view: boolean
  shared_at: string
}

class ProjectService {
  private getAuthHeaders() {
    const token = localStorage.getItem("access_token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async getProjects(): Promise<Project[]> {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/projects?user_id=${user.id}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to get projects")
    }

    return response.json()
  }

  async getProject(projectId: number): Promise<Project> {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}?user_id=${user.id}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to get project")
    }

    return response.json()
  }

  async createProject(data: ProjectCreate): Promise<Project> {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/projects?user_id=${user.id}`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to create project")
    }

    return response.json()
  }

  async updateProject(projectId: number, data: ProjectUpdate): Promise<Project> {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}?user_id=${user.id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to update project")
    }

    return response.json()
  }

  async deleteProject(projectId: number): Promise<void> {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}?user_id=${user.id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to delete project")
    }
  }

  async shareConversation(conversationId: string, shareData: ConversationShare): Promise<ConversationShareResponse> {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/projects/conversations/${conversationId}/share?user_id=${user.id}`,
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

  async getConversationShares(conversationId: string): Promise<ConversationShareResponse[]> {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/projects/conversations/${conversationId}/shares?user_id=${user.id}`,
      {
        headers: this.getAuthHeaders(),
      },
    )

    if (!response.ok) {
      throw new Error("Failed to get conversation shares")
    }

    return response.json()
  }

  async removeConversationShare(conversationId: string, userIdToUnshare: number): Promise<void> {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/projects/conversations/${conversationId}/share/${userIdToUnshare}?user_id=${user.id}`,
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

export const projectService = new ProjectService()
