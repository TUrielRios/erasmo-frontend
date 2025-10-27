"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, Eye, EyeOff } from "lucide-react"
import { authAPI } from "@/lib/api"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("[LOGIN] Attempting login with email:", email)
      
      const data = await authAPI.login({ email, password })
      console.log("[LOGIN] Login response received:", data)

      // Verificar que tengamos la información del usuario
      if (!data.user) {
        console.error("[LOGIN] No user data in response!")
        throw new Error("No se recibió información del usuario")
      }

      // Verificar que el usuario esté activo
      if (!data.user.is_active) {
        throw new Error("Usuario inactivo. Contacta al administrador.")
      }

      console.log("[LOGIN] User data structure:")
      console.log("- ID:", data.user.id)
      console.log("- Email:", data.user.email) 
      console.log("- Username:", data.user.username)
      console.log("- Full Name:", data.user.full_name)
      console.log("- Role:", data.user.role)
      console.log("- Company:", data.user.company?.name)
      console.log("- Is Active:", data.user.is_active)

      // Guardar la información del usuario
      localStorage.setItem("user", JSON.stringify(data.user))
      console.log("[LOGIN] User data saved to localStorage")

      // Verificar que se guardó correctamente
      const savedUser = localStorage.getItem("user")
      console.log("[LOGIN] Verification - User in localStorage:", !!savedUser)

      if (!savedUser) {
        throw new Error("Error al guardar la información del usuario")
      }

      console.log("[LOGIN] Login successful, redirecting...")

      // Redirect based on user role
      if (data.user.role === "admin") {
        console.log("[LOGIN] Redirecting admin to admin panel")
        router.push("/admin")
      } else {
        console.log("[LOGIN] Redirecting client to chat")
        router.push("/chat")
      }

    } catch (err: any) {
      console.error("[LOGIN] Login error:", err)
      setError(err.message || "Error al iniciar sesión")
      
      // Limpiar localStorage en caso de error
      localStorage.removeItem("user")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <Brain className="h-12 w-12 text-primary mr-3" />
          <h1 className="text-3xl font-bold text-foreground">Clara</h1>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription>Accede a tu cuenta para comenzar a usar Clara</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                ¿No tienes una cuenta?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Regístrate aquí
                </Link>
              </p>
            </div>

            {/* Debug panel - solo en desarrollo */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <div className="text-xs font-medium mb-2">Debug Info:</div>
                <div className="text-xs space-y-1 font-mono">
                  <div>User: {typeof window !== 'undefined' && localStorage.getItem("user") ? "✓ Presente" : "✗ Ausente"}</div>
                  <div>Server: http://localhost:8000</div>
                  <div>Mode: Sin Token (User-based Auth)</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}