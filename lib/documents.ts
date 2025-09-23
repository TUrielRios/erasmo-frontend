export interface DocumentMetadata {
  filename: string
  file_type: string
  file_size: number
  upload_date: string
  document_id: string
}

export interface IngestResponse {
  message: string
  documents_processed: number
  documents_metadata: DocumentMetadata[]
  processing_time: number
}

export interface PersonalityConfig {
  personality_type: string
  description: string
  documents_count: number
  last_updated: string
}

export interface IngestionStatus {
  total_documents: number
  total_chunks: number
  last_ingestion: string
  storage_size_mb: number
  document_types: Record<string, number>
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

class DocumentService {
  private getAuthHeaders() {
    const token = localStorage.getItem("access_token")
    return {
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async ingestDocuments(files: File[]): Promise<IngestResponse> {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append("files", file)
    })

    const response = await fetch(`${API_BASE_URL}/api/v1/ingest`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to ingest documents")
    }

    return response.json()
  }

  async ingestPersonalityDocuments(files: File[], personalityType: string): Promise<IngestResponse> {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append("files", file)
    })
    formData.append("personality_type", personalityType)

    const response = await fetch(`${API_BASE_URL}/api/v1/ingest/personality`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to ingest personality documents")
    }

    return response.json()
  }

  async getPersonalityConfig(): Promise<PersonalityConfig> {
    const response = await fetch(`${API_BASE_URL}/api/v1/ingest/personality`, {
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to get personality config")
    }

    return response.json()
  }

  async clearPersonalityConfig(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/ingest/personality`, {
      method: "DELETE",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to clear personality config")
    }
  }

  async getIngestionStatus(): Promise<IngestionStatus> {
    const response = await fetch(`${API_BASE_URL}/api/v1/ingest/status`, {
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to get ingestion status")
    }

    return response.json()
  }

  async clearKnowledgeBase(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/ingest/clear`, {
      method: "DELETE",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to clear knowledge base")
    }
  }
}

export const documentService = new DocumentService()
