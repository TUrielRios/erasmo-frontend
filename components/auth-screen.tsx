"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, Mail, Lock, User, Building2, Briefcase } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [fullName, setFullName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [industry, setIndustry] = useState("")
  const [sector, setSector] = useState("")
  const [jobArea, setJobArea] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const { login, register } = useAuth()

  const industries = [
    "Tecnología",
    "Retail",
    "Salud",
    "Finanzas",
    "Educación",
    "Manufactura",
    "Servicios",
    "Entretenimiento",
    "Inmobiliario",
    "Alimentación",
    "Turismo",
    "Transporte",
    "Energía",
    "Consultoría",
    "Otro",
  ]

  const sectors = [
    "Software",
    "E-commerce",
    "Farmacéutico",
    "Banca",
    "Seguros",
    "Educación Superior",
    "Automotriz",
    "Textil",
    "Marketing Digital",
    "Medios de Comunicación",
    "Hotelería",
    "Logística",
    "Renovables",
    "Estrategia Empresarial",
    "Otro",
  ]

  const jobAreas = [
    "Marketing",
    "Ventas",
    "Estrategia",
    "Operaciones",
    "Recursos Humanos",
    "Finanzas",
    "Tecnología",
    "Producto",
    "Dirección General",
    "Consultoría",
    "Desarrollo de Negocio",
    "Comunicaciones",
    "Otro",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    console.log("[v0] AuthScreen: Starting", isLogin ? "login" : "registration", "process")
    console.log("[v0] AuthScreen: Email:", email)
    console.log("[v0] AuthScreen: Username:", username)

    try {
      let success = false
      if (isLogin) {
        console.log("[v0] AuthScreen: Calling login function...")
        success = await login(email, password)
        console.log("[v0] AuthScreen: Login result:", success)
      } else {
        console.log("[v0] AuthScreen: Calling register function...")
        success = await register(email, password, username, {
          full_name: fullName,
          company_name: companyName,
          industry,
          sector,
          job_area: jobArea,
        })
        console.log("[v0] AuthScreen: Register result:", success)
      }

      if (success) {
        console.log("[v0] AuthScreen: Authentication successful!")
        // Check if tokens were saved
        const savedToken = localStorage.getItem("access_token")
        const savedRefreshToken = localStorage.getItem("refresh_token")
        console.log("[v0] AuthScreen: Post-auth token check:", {
          access: savedToken ? "Present" : "Missing",
          refresh: savedRefreshToken ? "Present" : "Missing",
        })
      } else {
        console.log("[v0] AuthScreen: Authentication failed")
        setError(
          isLogin
            ? "Credenciales inválidas. Verifica tu email y contraseña."
            : "Error al crear la cuenta. El email podría estar en uso.",
        )
      }
    } catch (error) {
      console.log("[v0] AuthScreen: Authentication error:", error)
      setError("Error de conexión. Verifica tu conexión a internet e intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setUsername("")
    setFullName("")
    setCompanyName("")
    setIndustry("")
    setSector("")
    setJobArea("")
    setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Brain className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Erasmo AI</h1>
          <p className="text-muted-foreground">Tu Agente Estratégico de Marca</p>
        </div>

        {/* Auth Card */}
        <Card className="bg-card border-border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-card-foreground">
              {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isLogin ? "Accede a tu asistente estratégico personal" : "Únete y comienza a potenciar tu marca"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-card-foreground">
                      Nombre completo
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Tu nombre completo"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10 bg-input border-border"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-card-foreground">
                      Nombre de usuario
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Tu nombre de usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10 bg-input border-border"
                        required
                        minLength={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-card-foreground">
                      Nombre de la empresa
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="companyName"
                        type="text"
                        placeholder="Nombre de tu empresa"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="pl-10 bg-input border-border"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="industry" className="text-card-foreground">
                        Industria
                      </Label>
                      <Select value={industry} onValueChange={setIndustry} required>
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map((ind) => (
                            <SelectItem key={ind} value={ind}>
                              {ind}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sector" className="text-card-foreground">
                        Sector
                      </Label>
                      <Select value={sector} onValueChange={setSector} required>
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          {sectors.map((sec) => (
                            <SelectItem key={sec} value={sec}>
                              {sec}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobArea" className="text-card-foreground">
                      Área de trabajo
                    </Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Select value={jobArea} onValueChange={setJobArea} required>
                        <SelectTrigger className="pl-10 bg-input border-border">
                          <SelectValue placeholder="Tu área de trabajo" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobAreas.map((area) => (
                            <SelectItem key={area} value={area}>
                              {area}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              {isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-card-foreground">
                    Nombre de usuario
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Tu nombre de usuario"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 bg-input border-border"
                      required
                      minLength={3}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-card-foreground">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-input border-border"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-card-foreground">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-input border-border"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Procesando..." : isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
                <Button
                  variant="link"
                  className="p-0 ml-1 text-primary hover:text-primary/80"
                  onClick={() => {
                    console.log("[v0] AuthScreen: Switching to", isLogin ? "register" : "login", "mode")
                    setIsLogin(!isLogin)
                    resetForm()
                  }}
                >
                  {isLogin ? "Regístrate aquí" : "Inicia sesión"}
                </Button>
              </p>
            </div>

            {process.env.NODE_ENV === "development" && (
              <div className="mt-4 p-3 bg-muted/50 rounded-md text-xs text-muted-foreground">
                <p>
                  <strong>Debug Info:</strong>
                </p>
                <p>• Backend: http://localhost:8000</p>
                <p>• Tokens se guardan en localStorage</p>
                <p>• Revisa la consola para logs detallados</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">¿Qué puedes hacer con Erasmo?</p>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="bg-card/50 rounded-lg p-3 border border-border/50">
              <Brain className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-card-foreground font-medium">Estrategia</p>
            </div>
            <div className="bg-card/50 rounded-lg p-3 border border-border/50">
              <Mail className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-card-foreground font-medium">Análisis</p>
            </div>
            <div className="bg-card/50 rounded-lg p-3 border border-border/50">
              <User className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-card-foreground font-medium">Gestión</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
