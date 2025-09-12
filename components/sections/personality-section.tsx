"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Upload, FileText, Trash2, RefreshCw, CheckCircle, AlertCircle, User, Settings } from "lucide-react"

interface PersonalityConfig {
  personality_type: string
  traits: string[]
  communication_style: string
  expertise_areas: string[]
  response_tone: string
  custom_instructions: string
  last_updated: string
}

export default function PersonalitySection() {
  const [personalityFiles, setPersonalityFiles] = useState<FileList | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>("")
  const [personalityConfig, setPersonalityConfig] = useState<PersonalityConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Form states for personality configuration
  const [personalityType, setPersonalityType] = useState("")
  const [traits, setTraits] = useState("")
  const [communicationStyle, setCommunicationStyle] = useState("")
  const [expertiseAreas, setExpertiseAreas] = useState("")
  const [responseTone, setResponseTone] = useState("")
  const [customInstructions, setCustomInstructions] = useState("")

  useEffect(() => {
    loadPersonalityConfig()
  }, [])

  const loadPersonalityConfig = async () => {
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch("http://localhost:8000/api/v1/ingest/personality", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setPersonalityConfig(data)

        // Populate form fields
        if (data) {
          setPersonalityType(data.personality_type || "")
          setTraits(data.traits?.join(", ") || "")
          setCommunicationStyle(data.communication_style || "")
          setExpertiseAreas(data.expertise_areas?.join(", ") || "")
          setResponseTone(data.response_tone || "")
          setCustomInstructions(data.custom_instructions || "")
        }
      }
    } catch (error) {
      console.log("[v0] Failed to load personality config:", error)
    }
  }

  const handlePersonalityFileUpload = async () => {
    if (!personalityFiles || personalityFiles.length === 0) return

    setIsUploading(true)
    setUploadStatus("Subiendo documentos de personalidad...")

    try {
      const token = localStorage.getItem("access_token")
      const formData = new FormData()

      for (let i = 0; i < personalityFiles.length; i++) {
        formData.append("files", personalityFiles[i])
      }

      const response = await fetch("http://localhost:8000/api/v1/ingest/personality", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        setUploadStatus("Documentos de personalidad subidos exitosamente")
        setPersonalityFiles(null)
        loadPersonalityConfig()
      } else {
        setUploadStatus("Error al subir documentos de personalidad")
      }
    } catch (error) {
      console.log("[v0] Failed to upload personality documents:", error)
      setUploadStatus("Error de conexión")
    } finally {
      setIsUploading(false)
    }
  }

  const savePersonalityConfig = async () => {
    setIsLoading(true)

    try {
      const token = localStorage.getItem("access_token")
      const config = {
        personality_type: personalityType,
        traits: traits
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
        communication_style: communicationStyle,
        expertise_areas: expertiseAreas
          .split(",")
          .map((e) => e.trim())
          .filter((e) => e),
        response_tone: responseTone,
        custom_instructions: customInstructions,
      }

      const response = await fetch("http://localhost:8000/api/v1/ingest/personality", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        setUploadStatus("Configuración de personalidad guardada exitosamente")
        loadPersonalityConfig()
      } else {
        setUploadStatus("Error al guardar configuración")
      }
    } catch (error) {
      console.log("[v0] Failed to save personality config:", error)
      setUploadStatus("Error de conexión")
    } finally {
      setIsLoading(false)
    }
  }

  const clearPersonalityConfig = async () => {
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch("http://localhost:8000/api/v1/ingest/personality", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setUploadStatus("Configuración de personalidad eliminada")
        setPersonalityConfig(null)
        // Clear form fields
        setPersonalityType("")
        setTraits("")
        setCommunicationStyle("")
        setExpertiseAreas("")
        setResponseTone("")
        setCustomInstructions("")
      }
    } catch (error) {
      console.log("[v0] Failed to clear personality config:", error)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Configuración de Personalidad</h2>
        <p className="text-muted-foreground">
          Define la personalidad y estilo de comunicación de Erasmo para que se adapte a tu marca
        </p>
      </div>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="config" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Configuración Manual</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Subir Documentos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personalidad de Erasmo</span>
                </CardTitle>
                <CardDescription>Define cómo debe comportarse y comunicarse Erasmo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="personality-type">Tipo de Personalidad</Label>
                  <Input
                    id="personality-type"
                    placeholder="Ej: Consultor estratégico, Mentor de marca, Analista experto"
                    value={personalityType}
                    onChange={(e) => setPersonalityType(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="traits">Rasgos de Personalidad (separados por comas)</Label>
                  <Input
                    id="traits"
                    placeholder="Ej: Analítico, Creativo, Directo, Empático"
                    value={traits}
                    onChange={(e) => setTraits(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="communication-style">Estilo de Comunicación</Label>
                  <Input
                    id="communication-style"
                    placeholder="Ej: Profesional pero cercano, Técnico y detallado"
                    value={communicationStyle}
                    onChange={(e) => setCommunicationStyle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expertise-areas">Áreas de Expertise (separadas por comas)</Label>
                  <Input
                    id="expertise-areas"
                    placeholder="Ej: Branding, Marketing digital, Estrategia empresarial"
                    value={expertiseAreas}
                    onChange={(e) => setExpertiseAreas(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="response-tone">Tono de Respuesta</Label>
                  <Input
                    id="response-tone"
                    placeholder="Ej: Motivador, Analítico, Consultivo"
                    value={responseTone}
                    onChange={(e) => setResponseTone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-instructions">Instrucciones Personalizadas</Label>
                  <Textarea
                    id="custom-instructions"
                    placeholder="Instrucciones específicas sobre cómo debe comportarse Erasmo..."
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button onClick={savePersonalityConfig} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Guardar Configuración
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Current Configuration Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>Configuración Actual</span>
                </CardTitle>
                <CardDescription>Estado actual de la personalidad de Erasmo</CardDescription>
              </CardHeader>
              <CardContent>
                {personalityConfig ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Tipo de Personalidad</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {personalityConfig.personality_type || "No configurado"}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Rasgos</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {personalityConfig.traits?.map((trait, index) => (
                          <Badge key={index} variant="secondary">
                            {trait}
                          </Badge>
                        )) || <span className="text-sm text-muted-foreground">No configurado</span>}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Estilo de Comunicación</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {personalityConfig.communication_style || "No configurado"}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Áreas de Expertise</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {personalityConfig.expertise_areas?.map((area, index) => (
                          <Badge key={index} variant="outline">
                            {area}
                          </Badge>
                        )) || <span className="text-sm text-muted-foreground">No configurado</span>}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Tono de Respuesta</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {personalityConfig.response_tone || "No configurado"}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Última Actualización</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(personalityConfig.last_updated).toLocaleString()}
                      </p>
                    </div>

                    <Button variant="destructive" onClick={clearPersonalityConfig} className="w-full">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Limpiar Configuración
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay configuración de personalidad</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Subir Documentos de Personalidad</span>
              </CardTitle>
              <CardDescription>
                Sube documentos que definan la personalidad y estilo de tu marca para entrenar a Erasmo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="personality-files">Seleccionar archivos de personalidad</Label>
                <Input
                  id="personality-files"
                  type="file"
                  multiple
                  accept=".pdf,.txt,.docx,.doc"
                  onChange={(e) => setPersonalityFiles(e.target.files)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Sube guías de marca, manuales de estilo, ejemplos de comunicación, etc.
                </p>
              </div>

              {personalityFiles && personalityFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{personalityFiles.length} archivo(s) seleccionado(s):</p>
                  {Array.from(personalityFiles).map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <FileText className="h-4 w-4" />
                      <span>{file.name}</span>
                      <Badge variant="secondary">{(file.size / 1024).toFixed(1)} KB</Badge>
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={handlePersonalityFileUpload}
                disabled={!personalityFiles || personalityFiles.length === 0 || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Documentos de Personalidad
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {uploadStatus && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div
              className={`flex items-center space-x-2 text-sm ${
                uploadStatus.includes("Error") ? "text-destructive" : "text-green-600"
              }`}
            >
              {uploadStatus.includes("Error") ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <span>{uploadStatus}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
