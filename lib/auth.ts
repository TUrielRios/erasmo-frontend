export interface User {
  id: number
  username: string
  email: string
  full_name: string
  work_area: string
  role: "client" | "admin"
  is_active: boolean
  created_at: string
  company: {
    id: number
    name: string
    industry: string
    sector: string
    description: string
    is_active: boolean
    created_at: string
    user_count: number
  }
}

const BASE_URL = "http://localhost:8000"

export const getAuthToken = (): string | null => {
  // Verificar que estamos en el cliente
  if (typeof window === "undefined") return null
  
  try {
    // Si hay usuario logueado, crear un "token" ficticio para compatibilidad
    const userStr = localStorage.getItem("user")
    if (userStr && userStr !== "undefined") {
      const user = JSON.parse(userStr)
      if (user && user.id && user.email && user.is_active) {
        return `user_${user.id}_${user.email}` // Token ficticio basado en el usuario
      }
    }
  } catch (error) {
    console.error("Error getting auth token:", error)
  }
  
  return null
}

export const getUser = (): User | null => {
  // Verificar que estamos en el cliente
  if (typeof window === "undefined") return null
  
  try {
    const userStr = localStorage.getItem("user")
    if (!userStr || userStr === "undefined") return null
    
    const user = JSON.parse(userStr)
    // Verificar que el usuario tenga la estructura correcta
    if (user && user.id && user.email && user.is_active) {
      return user
    }
  } catch (error) {
    console.error("Error parsing user data:", error)
    // Limpiar datos inválidos
    try {
      localStorage.removeItem("user")
    } catch (cleanupError) {
      console.error("Error cleaning up invalid user data:", cleanupError)
    }
  }
  
  return null
}

export const logout = () => {
  console.log("[AUTH] Logging out user...")
  
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
      // Redirigir solo si estamos en el cliente
      window.location.href = "/login"
    }
  } catch (error) {
    console.error("Error during logout:", error)
    // Si hay error, intentar redirección de todas formas
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  }
}

export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false
  
  try {
    const user = getUser()
    return !!(user && user.is_active)
  } catch (error) {
    console.error("Error checking authentication:", error)
    return false
  }
}

export const isAdmin = (): boolean => {
  const user = getUser()
  return user?.role === "admin"
}

export const isClient = (): boolean => {
  const user = getUser()
  return user?.role === "client"
}

// Función para obtener headers de autorización (usando email del usuario)
export const getAuthHeaders = (): HeadersInit => {
  const user = getUser()
  if (user) {
    return {
      "Content-Type": "application/json",
      "X-User-Email": user.email, // Usar email como identificador
      "X-User-ID": user.id.toString(),
    }
  }
  
  return {
    "Content-Type": "application/json",
  }
}