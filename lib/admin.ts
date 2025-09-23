export interface AdminDashboard {
  total_users: number
  total_companies: number
  total_conversations: number
  total_messages: number
  active_users_today: number
  new_users_this_week: number
  top_companies: Array<{
    name: string
    user_count: number
    message_count: number
  }>
  usage_stats: {
    daily_messages: Array<{
      date: string
      count: number
    }>
    popular_features: Array<{
      feature: string
      usage_count: number
    }>
  }
}

export interface Company {
  id: string
  name: string
  industry: string
  sector: string
  description: string
  is_active: boolean
  user_count: number
  created_at: string
  updated_at: string
}

export interface CompanyDetails extends Company {
  users: Array<{
    id: string
    username: string
    email: string
    full_name: string
    work_area: string
    is_active: boolean
    created_at: string
  }>
  ai_configuration?: AIConfiguration
}

export interface AIConfiguration {
  id: string
  company_id: string
  model_name: string
  temperature: number
  max_tokens: number
  system_prompt: string
  response_format: string
  enable_memory: boolean
  memory_window: number
  custom_instructions: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AIConfigurationCreate {
  model_name: string
  temperature: number
  max_tokens: number
  system_prompt: string
  response_format?: string
  enable_memory?: boolean
  memory_window?: number
  custom_instructions?: string
}

export interface AIConfigurationUpdate extends Partial<AIConfigurationCreate> {}

export interface CompanyDocument {
  id: string
  filename: string
  file_size: number
  uploaded_at: string
  is_active: boolean
}

export interface CompanyDocumentsResponse {
  company_id: string
  company_name: string
  documents: CompanyDocument[]
}

export interface DocumentUploadResponse {
  message: string
  uploaded_files: Array<{
    id: string
    filename: string
    size: number
  }>
  failed_files: Array<{
    filename: string
    error: string
  }>
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

class AdminService {
  private getAuthHeaders() {
    const token = localStorage.getItem("access_token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async getDashboard(): Promise<AdminDashboard> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/dashboard`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to get admin dashboard")
    }

    return response.json()
  }

  async getCompanies(): Promise<Company[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/companies`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to get companies")
    }

    return response.json()
  }

  async getCompanyDetails(companyId: string): Promise<CompanyDetails> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/companies/${companyId}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to get company details")
    }

    return response.json()
  }

  async createAIConfiguration(companyId: string, config: AIConfigurationCreate): Promise<AIConfiguration> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/companies/${companyId}/ai-configuration`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(config),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to create AI configuration")
    }

    return response.json()
  }

  async updateAIConfiguration(companyId: string, config: AIConfigurationUpdate): Promise<AIConfiguration> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/companies/${companyId}/ai-configuration`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(config),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to update AI configuration")
    }

    return response.json()
  }

  async getAIConfiguration(companyId: string): Promise<AIConfiguration> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/companies/${companyId}/ai-configuration`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to get AI configuration")
    }

    return response.json()
  }

  async quickUpdateAIConfiguration(companyId: string, updates: Partial<AIConfiguration>): Promise<AIConfiguration> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/companies/${companyId}/ai-configuration/quick-update`, {
      method: "PATCH",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to quick update AI configuration")
    }

    return response.json()
  }

  async updateCompanyStatus(companyId: string, isActive: boolean): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/companies/${companyId}/status`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ is_active: isActive }),
    })

    if (!response.ok) {
      throw new Error("Failed to update company status")
    }
  }

  async uploadCompanyDocuments(companyId: string, files: FileList): Promise<DocumentUploadResponse> {
    const formData = new FormData()

    // Validar que solo sean archivos .txt
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.name.endsWith(".txt")) {
        throw new Error(`Solo se permiten archivos .txt. ${file.name} no es válido.`)
      }
      formData.append("files", file)
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/admin/companies/${companyId}/documents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Failed to upload documents")
    }

    return response.json()
  }

  async getCompanyDocuments(companyId: string): Promise<CompanyDocumentsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/companies/${companyId}/documents`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to get company documents")
    }

    return response.json()
  }

  async deleteCompanyDocument(companyId: string, documentId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/companies/${companyId}/documents/${documentId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to delete document")
    }
  }
}

export const adminService = new AdminService()
