"use client"

import type React from "react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  requireAnalysis: boolean
  onRequireAnalysisChange: (value: boolean) => void
  hasConversation: boolean
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  requireAnalysis,
  onRequireAnalysisChange,
  hasConversation,
}: ChatInputProps) {
  return (
    <div className="py-6 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        {hasConversation && (
          <div className="flex items-center space-x-2 mb-8">
            <Switch id="require-analysis" checked={requireAnalysis} onCheckedChange={onRequireAnalysisChange} />
            <Label htmlFor="require-analysis" className="text-sm text-muted-foreground cursor-pointer">
              Generar análisis conceptual y plan de acción estructurado
            </Label>
          </div>
        )}

        <div className="flex items-center space-x-3 bg-white border border-gray-300 rounded-2xl px-6 py-3 hover:border-primary/50 transition-colors">
          <Plus className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Escribe tu consulta para Clara"
            disabled={isLoading}
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base px-0"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                onSubmit(e)
              }
            }}
          />
          <button className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </button>
          <button
            onClick={onSubmit}
            disabled={isLoading || !value.trim()}
            className="rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0 disabled:opacity-50"
          >
            <img src="/icons/circula_arrow.svg" alt="Enviar" className="h-10 w-10" />
          </button>
        </div>
      </div>
    </div>
  )
}
