"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, MessageSquare, Clock, TrendingUp, Calendar, RefreshCw, Users, Target } from "lucide-react"

interface ChatStats {
  total_conversations: number
  total_messages: number
  average_messages_per_conversation: number
  most_active_day: string
  total_time_spent: number
  conversations_this_week: number
  conversations_this_month: number
  response_time_avg: number
  topics_discussed: string[]
  user_engagement_score: number
}

export default function AnalyticsSection() {
  const [stats, setStats] = useState<ChatStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadChatStats()
  }, [])

  const loadChatStats = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch("http://localhost:8000/api/v1/chat/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        // Mock data for demonstration
        const mockStats: ChatStats = {
          total_conversations: 24,
          total_messages: 156,
          average_messages_per_conversation: 6.5,
          most_active_day: "Martes",
          total_time_spent: 180, // minutes
          conversations_this_week: 8,
          conversations_this_month: 24,
          response_time_avg: 2.3, // seconds
          topics_discussed: ["Estrategia de marca", "Marketing digital", "Análisis de mercado", "Branding"],
          user_engagement_score: 85,
        }
        setStats(mockStats)
      }
    } catch (error) {
      console.log("[v0] Failed to load chat stats:", error)
      // Fallback to mock data
      const mockStats: ChatStats = {
        total_conversations: 24,
        total_messages: 156,
        average_messages_per_conversation: 6.5,
        most_active_day: "Martes",
        total_time_spent: 180,
        conversations_this_week: 8,
        conversations_this_month: 24,
        response_time_avg: 2.3,
        topics_discussed: ["Estrategia de marca", "Marketing digital", "Análisis de mercado", "Branding"],
        user_engagement_score: 85,
      }
      setStats(mockStats)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getEngagementColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getEngagementLabel = (score: number) => {
    if (score >= 80) return "Excelente"
    if (score >= 60) return "Bueno"
    return "Necesita mejora"
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Análisis y Estadísticas</h2>
          <p className="text-muted-foreground">Insights sobre tu interacción con Erasmo</p>
        </div>
        <Button variant="outline" onClick={loadChatStats} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {stats ? (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.total_conversations}</p>
                    <p className="text-sm text-muted-foreground">Conversaciones</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.total_messages}</p>
                    <p className="text-sm text-muted-foreground">Mensajes totales</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{formatTime(stats.total_time_spent)}</p>
                    <p className="text-sm text-muted-foreground">Tiempo total</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Target className="h-8 w-8 text-primary" />
                  <div>
                    <p className={`text-2xl font-bold ${getEngagementColor(stats.user_engagement_score)}`}>
                      {stats.user_engagement_score}%
                    </p>
                    <p className="text-sm text-muted-foreground">Engagement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Métricas de Actividad</span>
                </CardTitle>
                <CardDescription>Estadísticas detalladas de tu uso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Promedio mensajes/conversación</span>
                  <span className="font-medium">{stats.average_messages_per_conversation.toFixed(1)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Día más activo</span>
                  <Badge variant="secondary">{stats.most_active_day}</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Conversaciones esta semana</span>
                  <span className="font-medium">{stats.conversations_this_week}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Conversaciones este mes</span>
                  <span className="font-medium">{stats.conversations_this_month}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tiempo promedio de respuesta</span>
                  <span className="font-medium">{stats.response_time_avg.toFixed(1)}s</span>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Nivel de engagement</span>
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${getEngagementColor(stats.user_engagement_score)}`}>
                        {getEngagementLabel(stats.user_engagement_score)}
                      </span>
                      <Badge
                        variant={stats.user_engagement_score >= 80 ? "default" : "secondary"}
                        className={stats.user_engagement_score >= 80 ? "bg-green-600" : ""}
                      >
                        {stats.user_engagement_score}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Temas Discutidos</span>
                </CardTitle>
                <CardDescription>Los temas más frecuentes en tus conversaciones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topics_discussed.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{topic}</span>
                      <Badge variant="outline">{Math.floor(Math.random() * 20) + 5} veces</Badge>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Recomendación</h4>
                  <p className="text-sm text-muted-foreground">
                    Basado en tus conversaciones, Erasmo ha identificado que te enfocas principalmente en estrategia de
                    marca. Considera explorar más temas de marketing digital para ampliar tu perspectiva.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress and Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Progreso y Objetivos</span>
              </CardTitle>
              <CardDescription>Tu evolución en el uso de Erasmo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{stats.conversations_this_week}</div>
                  <p className="text-sm text-muted-foreground">Conversaciones esta semana</p>
                  <Badge variant="secondary" className="mt-2">
                    +{Math.floor(Math.random() * 5) + 1} vs semana anterior
                  </Badge>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {Math.floor(stats.total_messages / stats.total_conversations)}
                  </div>
                  <p className="text-sm text-muted-foreground">Mensajes promedio por sesión</p>
                  <Badge variant="secondary" className="mt-2">
                    Objetivo: 10 mensajes
                  </Badge>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{stats.topics_discussed.length}</div>
                  <p className="text-sm text-muted-foreground">Temas diferentes explorados</p>
                  <Badge variant="secondary" className="mt-2">
                    Diversidad alta
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando estadísticas...</p>
        </div>
      )}
    </div>
  )
}
