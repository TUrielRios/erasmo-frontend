import { getUser } from "./auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface ProjectFile {
  id: number
  project_id: number
  filename: string
  original_filename: string
  file_path: string
  file_size: number
  file_type: string
  category: "instructions" | "knowledge_base" | "reference" | "general"
  priority: number
  is_active: boolean
  uploaded_by_user_id: number
  created_at: string
  updated_at: string
}

export interface ProjectFileUploadResponse {
  message: string
  file: ProjectFile
}

export interface ProjectFileUpdate {
  category?: "instructions" | "knowledge_base" | "reference" | "general"
  priority?: number
  is_active?: boolean
}

class ProjectFileService {
  private getAuthHeaders() {
    const token = localStorage.getItem("access_token")
    return {
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async uploadFile(
    projectId: number,
    file: File,
    category: "instructions" | "knowledge_base" | "reference" | "general",
    priority = 1,
  ): Promise<ProjectFileUploadResponse> {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("category", category)
    formData.append("priority", priority.toString())

    const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/files?user_id=${user.id}`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to upload file")
    }

    return response.json()
  }

  async getProjectFiles(projectId: number): Promise<ProjectFile[]> {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/files?user_id=${user.id}`, {
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to get project files")
    }

    return response.json()
  }

  async getProjectFilesByCategory(
    projectId: number,
    category: "instructions" | "knowledge_base" | "reference" | "general",
  ): Promise<ProjectFile[]> {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/projects/${projectId}/files/category/${category}?user_id=${user.id}`,
      {
        headers: {
          ...this.getAuthHeaders(),
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error("Failed to get project files by category")
    }

    return response.json()
  }

  async updateProjectFile(projectId: number, fileId: number, data: ProjectFileUpdate): Promise<ProjectFile> {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/files/${fileId}?user_id=${user.id}`, {
      method: "PUT",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to update file")
    }

    return response.json()
  }

  async deleteProjectFile(projectId: number, fileId: number): Promise<void> {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/files/${fileId}?user_id=${user.id}`, {
      method: "DELETE",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to delete file")
    }
  }
}

export const projectFileService = new ProjectFileService()
