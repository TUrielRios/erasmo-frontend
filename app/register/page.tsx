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
import { Eye, EyeOff, User } from "lucide-react"
import { authAPI } from "@/lib/api"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    company_name: "",
    industry: "",
    sector: "",
    work_area: "",
    full_name: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    try {
      const data = await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        company_name: formData.company_name,
        industry: formData.industry,
        sector: formData.sector,
        work_area: formData.work_area,
        full_name: formData.full_name,
      })

      if (data.access_token) {
        localStorage.setItem("token", data.access_token)
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user))
      }

      router.push("/chat")
    } catch (err: any) {
      setError(err.message || "Error al registrarse")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: "#0000FF" }}>
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center mb-8 gap-2">
          <div className="bg-white rounded-full p-2">
            <User className="h-6 w-6 text-[#0000FF]" />
          </div>
          <h1 className="text-3xl font-bold text-white">CLARA</h1>
        </div>

        <Card className="bg-white border-0 shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-semibold" style={{ color: "#0000FF" }}>
              Crear Cuenta
            </CardTitle>
            <CardDescription className="text-gray-600">Únete a Clara y potencia tu estrategia de marca</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium" style={{ color: "#0000FF" }}>
                    Nombre de Usuario
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Tu nombre de usuario"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus:border-[#0000FF] focus:ring-[#0000FF]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-sm font-medium" style={{ color: "#0000FF" }}>
                    Nombre Completo (Opcional)
                  </Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="Tu nombre completo"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="border-gray-300 focus:border-[#0000FF] focus:ring-[#0000FF]"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email" className="text-sm font-medium" style={{ color: "#0000FF" }}>
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Ingrese su correo.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus:border-[#0000FF] focus:ring-[#0000FF]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_name" className="text-sm font-medium" style={{ color: "#0000FF" }}>
                    Nombre de la Empresa
                  </Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    type="text"
                    placeholder="Nombre de tu empresa"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus:border-[#0000FF] focus:ring-[#0000FF]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-sm font-medium" style={{ color: "#0000FF" }}>
                    Industria
                  </Label>
                  <Input
                    id="industry"
                    name="industry"
                    type="text"
                    placeholder="Ej: Tecnología, Retail, Salud"
                    value={formData.industry}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus:border-[#0000FF] focus:ring-[#0000FF]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sector" className="text-sm font-medium" style={{ color: "#0000FF" }}>
                    Sector
                  </Label>
                  <Input
                    id="sector"
                    name="sector"
                    type="text"
                    placeholder="Ej: Privado, Público, ONG"
                    value={formData.sector}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus:border-[#0000FF] focus:ring-[#0000FF]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="work_area" className="text-sm font-medium" style={{ color: "#0000FF" }}>
                    Área de Desempeño
                  </Label>
                  <Input
                    id="work_area"
                    name="work_area"
                    type="text"
                    placeholder="Ej: Marketing, Ventas, Dirección"
                    value={formData.work_area}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus:border-[#0000FF] focus:ring-[#0000FF]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium" style={{ color: "#0000FF" }}>
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingrese su contraseña"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="border-gray-300 focus:border-[#0000FF] focus:ring-[#0000FF] pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium" style={{ color: "#0000FF" }}>
                    Confirmar Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Ingrese su contraseña"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="border-gray-300 focus:border-[#0000FF] focus:ring-[#0000FF] pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full text-white font-medium mt-6"
                style={{ backgroundColor: "#0000FF" }}
                disabled={isLoading}
              >
                {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="hover:underline" style={{ color: "#0000FF" }}>
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
