"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
    <div className="min-h-screen bg-[#0A2FF1] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md flex flex-col">
        <div className="flex items-center justify-center mb-8 gap-2">
          <div className="w-10 h-10 flex items-center justify-center">
            <img src="/icons/logo_clara.svg" alt="Erasmo Logo" className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white">CLARA</h1>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-[#0A2FF1] text-center mb-6">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[#0A2FF1]">
                Correo electrónico
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Ingrese su@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl border-[#0A2FF1] focus:outline-none focus-visible:ring-0 placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-[#0A2FF1]">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl border-[#0A2FF1] focus:outline-none focus-visible:ring-0 placeholder:text-gray-400 pr-12"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0A2FF1] hover:text-[#0A2FF1]/80"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <img src="/icons/ojo.svg" alt="Toggle Password Visibility" className="w-5 h-5" />
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#0A2FF1] hover:bg-[#0A2FF1]/90 text-white rounded-xl font-medium text-base mt-6"
              disabled={isLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </div>

        <div className="mt-8 flex items-center justify-center gap-8 text-sm">
          <Link href="/register" className="text-white hover:text-white/80">
            Crear una cuenta
          </Link>
          <Link href="/forgot-password" className="text-white hover:text-white/80">
            He olvidado la contraseña
          </Link>
        </div>
      </div>
    </div>
  )
}
