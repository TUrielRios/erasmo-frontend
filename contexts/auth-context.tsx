"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"

interface User {
  id: string
  email: string
  username: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, username: string) => Promise<boolean>
  logout: () => void
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Get API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const isCheckingAuth = useRef(false)

  const checkAuth = async () => {
    if (isCheckingAuth.current) {
      console.log("[v0] checkAuth already in progress, skipping...")
      return
    }

    isCheckingAuth.current = true

    try {
      const token = localStorage.getItem("access_token")
      const refreshToken = localStorage.getItem("refresh_token")

      console.log("[v0] === CHECKAUTH CALLED ===")
      console.log("[v0] Using API URL:", API_URL)
      console.log("[v0] Checking auth with token:", token ? `Token exists (${token.substring(0, 20)}...)` : "No token")
      console.log(
        "[v0] Refresh token:",
        refreshToken ? `Refresh token exists (${refreshToken.substring(0, 20)}...)` : "No refresh token",
      )
      console.log("[v0] LocalStorage keys:", Object.keys(localStorage))
      console.log("[v0] Current auth state - isAuthenticated:", isAuthenticated, "user:", user ? "Present" : "None")

      if (!token) {
        console.log("[v0] No access token found, setting loading to false")
        setUser(null)
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      console.log("[v0] Making auth check request...")
      const response = await fetch(`${API_URL}/api/v1/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("[v0] Auth check response status:", response.status)

      if (response.ok) {
        const userData = await response.json()
        console.log("[v0] User data received:", userData)
        console.log("[v0] Setting user and isAuthenticated to true...")
        setUser(userData)
        setIsAuthenticated(true)
        console.log("[v0] State update calls made - user set, isAuthenticated set to true")

        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("auth-verified"))
        }, 100)
      } else {
        console.log("[v0] Auth check failed, removing tokens")
        console.log("[v0] About to remove tokens due to failed auth check")
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        console.log("[v0] Tokens removed, localStorage keys now:", Object.keys(localStorage))
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.log("[v0] Auth check error:", error)
      console.log("[v0] About to remove tokens due to auth check error")
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      console.log("[v0] Tokens removed due to error, localStorage keys now:", Object.keys(localStorage))
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
      isCheckingAuth.current = false
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("[v0] Attempting login for:", email)
      console.log("[v0] Using API URL:", API_URL)

      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      console.log("[v0] Login response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Login successful, full response:", data)

        if (data.access_token && data.refresh_token && data.user) {
          console.log("[v0] Saving tokens to localStorage...")
          console.log("[v0] Access token preview:", data.access_token.substring(0, 20) + "...")
          console.log("[v0] Refresh token preview:", data.refresh_token.substring(0, 20) + "...")

          localStorage.setItem("access_token", data.access_token)
          localStorage.setItem("refresh_token", data.refresh_token)

          const savedAccessToken = localStorage.getItem("access_token")
          const savedRefreshToken = localStorage.getItem("refresh_token")
          console.log("[v0] Verification - tokens saved:", {
            access: savedAccessToken ? "✓" : "✗",
            refresh: savedRefreshToken ? "✓" : "✗",
          })

          setUser(data.user)
          setIsAuthenticated(true)
          setIsLoading(false)

          console.log("[v0] Login complete - tokens saved, state updated")

          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("auth-success"))
          }, 100)

          return true
        } else {
          console.log("[v0] Login response missing required data:", {
            access_token: data.access_token ? "Present" : "Missing",
            refresh_token: data.refresh_token ? "Present" : "Missing",
            user: data.user ? "Present" : "Missing",
          })
          return false
        }
      } else {
        const errorData = await response.text()
        console.log("[v0] Login failed with error:", errorData)
      }
      return false
    } catch (error) {
      console.log("[v0] Login error:", error)
      return false
    }
  }

  const register = async (email: string, password: string, username: string): Promise<boolean> => {
    try {
      console.log("[v0] Attempting registration for:", email, username)
      console.log("[v0] Using API URL:", API_URL)

      const response = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, username }),
      })

      console.log("[v0] Register response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Registration successful, received data:", {
          user: data.user ? "Present" : "Missing",
          access_token: data.access_token ? "Present" : "Missing",
          refresh_token: data.refresh_token ? "Present" : "Missing",
        })

        if (data.access_token && data.refresh_token && data.user) {
          console.log("[v0] Access token preview:", data.access_token.substring(0, 20) + "...")
          console.log("[v0] Refresh token preview:", data.refresh_token.substring(0, 20) + "...")

          localStorage.setItem("access_token", data.access_token)
          localStorage.setItem("refresh_token", data.refresh_token)

          const savedAccessToken = localStorage.getItem("access_token")
          const savedRefreshToken = localStorage.getItem("refresh_token")
          console.log("[v0] Verification - tokens saved:", {
            access: savedAccessToken ? "✓" : "✗",
            refresh: savedRefreshToken ? "✗" : "✗",
          })

          setUser(data.user)
          setIsAuthenticated(true)
          setIsLoading(false)

          console.log("[v0] Registration complete - tokens saved, state updated")

          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("auth-success"))
          }, 100)

          return true
        } else {
          console.log("[v0] Registration response missing required data")
          return false
        }
      } else {
        const errorData = await response.text()
        console.log("[v0] Registration failed with error:", errorData)
      }
      return false
    } catch (error) {
      console.log("[v0] Registration error:", error)
      return false
    }
  }

  const logout = () => {
    console.log("[v0] Logging out user")
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    setUser(null)
    setIsAuthenticated(false)
  }

  useEffect(() => {
    console.log("[v0] AUTH STATE CHANGED - isAuthenticated:", isAuthenticated, "user:", user ? "Present" : "None")
  }, [isAuthenticated, user])

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}