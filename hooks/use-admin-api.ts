"use client"

import { useState } from "react"
import { getAuthToken } from "@/lib/auth"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface Dashboard {
  overview: {
    total_companies: number
    total_users: number
    total_conversations: number
    total_messages: number
    new_users_week: number
    new_conversations_week: number
  }
  top_companies: {
    name: string
    industry: string
    user_count: number
  }[]
  company_activity: {
    company_name: string
    message_count: number
  }[]
  usage_stats: {
    popular_features: any[]
    document_uploads: number
  }
  recent_companies?: Company[]
}

export interface Company {
  id: string
  name: string
  description?: string
  industry: string
  sector: string
  is_active: boolean
  user_count?: number
  created_at: string
}

export interface Document {
  id: string
  filename: string
  description?: string
  category: string
  priority: number
  file_size?: number
  processing_status?: string
  is_active: boolean
  uploaded_at: string
}

export const useAdminApi = () => {
  const [loadingCount, setLoadingCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const loading = loadingCount > 0

  const handleApiCall = async <T>(apiCall: () => Promise<Response>): Promise<T | null> => {
    try {
      setLoadingCount(prev => prev + 1)
      setError(null)
      const token = getAuthToken()

      // Inject token into headers if apiCall is a direct fetch, 
      // but since we pass a lambda that calls fetch, we can't easily intercept it here
      // unless we change the pattern or assume the lambda adds headers.
      // Better approach: Helper for fetch that adds headers.

      const response = await apiCall()

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API Error Details:", error)
      let errorMessage = error instanceof Error ? error.message : "Error desconocido"

      // Improve timeout error message
      if (errorMessage.includes("Timeout") || errorMessage.includes("aborted")) {
        errorMessage = "La solicitud tardó demasiado tiempo (30s). El servidor podría estar lento o no responder."
      } else if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
        errorMessage = `No se pudo conectar al servidor en ${API_BASE}. Verifique que el backend esté ejecutándose.`
      }

      setError(errorMessage)
      return null
    } finally {
      setLoadingCount(prev => Math.max(0, prev - 1))
    }
  }

  const loadDashboard = async (): Promise<Dashboard | null> => {
    return handleApiCall(() => fetchWithAuth(`${API_BASE}/api/v1/admin/dashboard`))
  }

  const loadCompanies = async (): Promise<Company[] | null> => {
    return handleApiCall(() => fetchWithAuth(`${API_BASE}/api/v1/admin/companies`))
  }

  const loadCompanyDetails = async (companyId: string): Promise<Company | null> => {
    return handleApiCall(() => fetchWithAuth(`${API_BASE}/api/v1/admin/companies/${companyId}`))
  }

  const loadCompanyDocuments = async (companyId: string, category?: string): Promise<Document[] | null> => {
    let url = `${API_BASE}/api/v1/admin/companies/${companyId}/documents`
    if (category) {
      url += `?category=${category}`
    }

    const result = await handleApiCall<any>(() => fetchWithAuth(url))
    if (result) {
      const docs = result.documents_by_category
        ? Object.values(result.documents_by_category).flat()
        : result
      return (docs as any) as Document[]
    }
    return null
  }

  const uploadDocuments = async (
    companyId: string,
    files: File[],
    category: string,
    description: string,
    priority: number,
  ): Promise<any> => {
    const formData = new FormData()
    files.forEach((file) => formData.append("files", file))
    formData.append("category", category)
    formData.append("description", description)
    formData.append("priority", priority.toString())
    formData.append("vectorize", "true")

    return handleApiCall(() =>
      fetchWithAuth(`${API_BASE}/api/v1/admin/companies/${companyId}/documents`, {
        method: "POST",
        body: formData,
      }),
    )
  }

  const updateDocument = async (companyId: string, documentId: string, data: Partial<Document>): Promise<any> => {
    return handleApiCall(() =>
      fetchWithAuth(`${API_BASE}/api/v1/admin/companies/${companyId}/documents/${documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    )
  }

  const deleteDocument = async (companyId: string, documentId: string): Promise<any> => {
    return handleApiCall(() =>
      fetchWithAuth(`${API_BASE}/api/v1/admin/companies/${companyId}/documents/${documentId}`, {
        method: "DELETE",
      }),
    )
  }

  const linkProtocolToCompany = async (
    companyId: string,
    protocolId: number,
    category: string,
    description: string,
    priority: number,
  ): Promise<any> => {
    const formData = new FormData()
    formData.append("category", category)
    formData.append("description", description)
    formData.append("priority", priority.toString())
    formData.append("use_protocol", "true")
    formData.append("protocol_id", protocolId.toString())
    formData.append("filename", `Protocol_${protocolId}`)

    return handleApiCall(() =>
      fetchWithAuth(`${API_BASE}/api/v1/admin/companies/${companyId}/documents`, {
        method: "POST",
        body: formData,
      }),
    )
  }

  const createCompany = async (companyData: {
    name: string
    industry: string
    sector: string
    description: string
  }): Promise<Company | null> => {
    return handleApiCall(() =>
      fetchWithAuth(`${API_BASE}/api/v1/admin/companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(companyData),
      }),
    )
  }

  // Helper to add auth headers automatically
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken()
    const headers = {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    } as HeadersInit

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort("Timeout after 30s"), 30000) // 30s timeout

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  const fetchProtocols = async (): Promise<any> => {
    return handleApiCall(() => fetchWithAuth(`${API_BASE}/api/v1/admin/protocols/`)) || []
  }

  const createProtocol = async (protocolData: any): Promise<any> => {
    return handleApiCall(() =>
      fetchWithAuth(`${API_BASE}/api/v1/admin/protocols/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(protocolData),
      }),
    )
  }

  const updateCompany = async (companyId: string, companyData: any): Promise<any> => {
    return handleApiCall(() =>
      fetchWithAuth(`${API_BASE}/api/v1/admin/companies/${companyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(companyData),
      })
    )
  }

  const deleteCompany = async (companyId: string): Promise<any> => {
    return handleApiCall(() =>
      fetchWithAuth(`${API_BASE}/api/v1/admin/companies/${companyId}`, {
        method: "DELETE",
      })
    )
  }

  const updateProtocol = async (protocolId: number, protocolData: any): Promise<any> => {
    return handleApiCall(() =>
      fetchWithAuth(`${API_BASE}/api/v1/admin/protocols/${protocolId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(protocolData),
      })
    )
  }

  const deleteProtocol = async (protocolId: number, force: boolean = false): Promise<any> => {
    let url = `${API_BASE}/api/v1/admin/protocols/${protocolId}`
    if (force) {
      url += "?force=true"
    }
    return handleApiCall(() =>
      fetchWithAuth(url, {
        method: "DELETE",
      })
    )
  }

  return {
    loading,
    error,
    setError,
    loadDashboard,
    loadCompanies,
    loadCompanyDetails,
    loadCompanyDocuments,
    uploadDocuments,
    updateDocument,
    deleteDocument,
    linkProtocolToCompany,
    createCompany,
    fetchProtocols,
    createProtocol,
    updateCompany,
    deleteCompany,
    updateProtocol,
    deleteProtocol,
  }
}