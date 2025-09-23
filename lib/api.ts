import { getAuthHeaders, getUser } from "./auth"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const config: RequestInit = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  }
  
  console.log("[API] Making request to:", `${BASE_URL}${endpoint}`)
  console.log("[API] Headers:", config.headers)
  
  const response = await fetch(`${BASE_URL}${endpoint}`, config)
  
  if (!response.ok) {
    const error = await response.text()
    console.error("[API] Error response:", response.status, error)
    
    // Si es error 401/403, el usuario no está autorizado
    if (response.status === 401 || response.status === 403) {
      console.log("[API] Authentication error, cleaning user data")
      localStorage.removeItem("user")
      window.location.href = "/login"
      return
    }
    
    throw new Error(error || `HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

export const authAPI = {
  register: async (userData: {
    username: string
    email: string
    password: string
    company_name: string
    industry: string
    sector: string
    work_area: string
    full_name?: string
  }) => {
    return apiCall("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  login: async (credentials: { email: string; password: string }) => {
    // Para login no necesitamos headers de usuario (obviamente)
    const config: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    }
    
    const response = await fetch(`${BASE_URL}/api/v1/auth/login`, config)
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || `HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  },

  logout: async () => {
    // Si tu backend tiene un endpoint de logout, usarlo
    try {
      return apiCall("/api/v1/auth/logout", {
        method: "POST",
      })
    } catch (error) {
      // Si no existe el endpoint o falla, solo limpiar el frontend
      console.log("[AUTH] Logout endpoint failed, cleaning frontend only")
      return Promise.resolve()
    }
  },
}

export const chatAPI = {
  getConversations: async () => {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }
    
    return apiCall(`/api/v1/chat/conversations?user_id=${user.id}`)
  },

  createConversation: async (title: string) => {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }
    
    return apiCall(`/api/v1/chat/conversations?user_id=${user.id}`, {
      method: "POST",
      body: JSON.stringify({ 
        title,
        user_id: user.id 
      }),
    })
  },

  deleteConversation: async (conversationId: string) => {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }
    
    return apiCall(`/api/v1/chat/conversations/${conversationId}?user_id=${user.id}`, {
      method: "DELETE",
    })
  },

  // Nuevas funciones para mensajes
  getMessages: async (conversationId: string) => {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }
    
    return apiCall(`/api/v1/chat/conversations/${conversationId}/messages?user_id=${user.id}`)
  },

  sendMessage: async (conversationId: string, content: string) => {
    const user = getUser()
    if (!user) {
      throw new Error("Usuario no autenticado")
    }
    
    return apiCall(`/api/v1/chat/messages?user_id=${user.id}`, {
      method: "POST",
      body: JSON.stringify({
        conversation_id: conversationId,
        content: content,
        user_id: user.id
      }),
    })
  },
}