const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface FileUploadResponse {
  success: boolean
  filename: string
  file_type: "image" | "document"
  file_format: string
  analysis?: string
  content?: string
  summary?: string
  message: string
  tokens_used?: number
}

export interface SupportedFormats {
  images: string[]
  documents: string[]
  max_file_size_mb: number
  capabilities: Record<string, string>
}

class FileService {
  private getAuthHeaders() {
    const token = localStorage.getItem("access_token")
    return {
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async uploadFile(file: File, userId: number): Promise<FileUploadResponse> {
    const formData = new FormData()
    formData.append("file", file)
    if (userId) {
      formData.append("user_id", userId.toString())
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/files/upload`, {
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

  async analyzeFileWithMessage(
    file: File,
    message: string,
    userId: number,
    sessionId: string,
  ): Promise<{
    success: boolean
    filename: string
    file_type: string
    file_context: string
    message: string
    next_step: string
  }> {
    const formData = new FormData()
    formData.append("file", file)
    if (userId) {
      formData.append("user_id", userId.toString())
    }
    formData.append("session_id", sessionId)
    formData.append("message", message)

    const response = await fetch(`${API_BASE_URL}/api/v1/files/analyze-with-message`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to analyze file")
    }

    return response.json()
  }

  async getSupportedFormats(): Promise<SupportedFormats> {
    const response = await fetch(`${API_BASE_URL}/api/v1/files/supported-formats`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to get supported formats")
    }

    return response.json()
  }

  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSizeMB = 20
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    const validImageTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"]
    const validDocumentTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ]

    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`,
      }
    }

    const isValidType = [...validImageTypes, ...validDocumentTypes].includes(file.type)
    if (!isValidType) {
      return {
        valid: false,
        error: "File type not supported",
      }
    }

    return { valid: true }
  }
}

export const fileService = new FileService()
