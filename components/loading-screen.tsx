"use client"

import { Brain } from "lucide-react"

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 animate-pulse">
          <Brain className="h-8 w-8 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Erasmo AI</h2>
        <p className="text-muted-foreground">Cargando tu asistente estratégico...</p>
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </div>
    </div>
  )
}
