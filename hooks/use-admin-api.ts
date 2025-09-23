"use client"

import { useState } from "react"

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApiCall = async <T>(apiCall: () => Promise<Response>): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiCall()

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API Error:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
      return null
    } finally {
      setLoading(false)
    }
  }

  const loadDashboard = async (): Promise<Dashboard | null> => {
    return handleApiCall(() => fetch(`${API_BASE}/api/v1/admin/dashboard`))
  }

  const loadCompanies = async (): Promise<Company[] | null> => {
    return handleApiCall(() => fetch(`${API_BASE}/api/v1/admin/companies`))
  }

  const loadCompanyDetails = async (companyId: string): Promise<Company | null> => {
    return handleApiCall(() => fetch(`${API_BASE}/api/v1/admin/companies/${companyId}`))
  }

  const loadCompanyDocuments = async (companyId: string, category?: string): Promise<Document[] | null> => {
    let url = `${API_BASE}/api/v1/admin/companies/${companyId}/documents`
    if (category) {
      url += `?category=${category}`
    }

    const result = await handleApiCall<any>(() => fetch(url))
    if (result) {
      return result.documents_by_category ? Object.values(result.documents_by_category).flat() : result
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
      fetch(`${API_BASE}/api/v1/admin/companies/${companyId}/documents`, {
        method: "POST",
        body: formData,
      }),
    )
  }

  const updateDocument = async (companyId: string, documentId: string, data: Partial<Document>): Promise<any> => {
    return handleApiCall(() =>
      fetch(`${API_BASE}/api/v1/admin/companies/${companyId}/documents/${documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    )
  }

  const deleteDocument = async (companyId: string, documentId: string): Promise<any> => {
    return handleApiCall(() =>
      fetch(`${API_BASE}/api/v1/admin/companies/${companyId}/documents/${documentId}`, {
        method: "DELETE",
      }),
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
  }
}