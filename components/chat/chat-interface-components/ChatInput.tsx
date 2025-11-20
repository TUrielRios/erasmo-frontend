"use client"

import type React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Plus, Paperclip } from 'lucide-react'
import { useRef } from "react"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  requireAnalysis: boolean
  onRequireAnalysisChange: (value: boolean) => void
  hasConversation: boolean
  onAttachFile?: (files: FileList) => void
  attachmentCount?: number
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  requireAnalysis,
  onRequireAnalysisChange,
  hasConversation,
  onAttachFile,
  attachmentCount = 0,
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onAttachFile && e.target.files) {
      onAttachFile(e.target.files)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

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

        <div className="flex items-start space-x-3 bg-white border border-gray-300 rounded-2xl px-6 py-3 hover:border-primary/50 transition-colors">
          <Plus className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-2" />
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Escribe tu consulta para Clara"
            disabled={isLoading}
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base px-0 resize-none min-h-[24px] max-h-[200px]"
            style={{ 
              wordBreak: "break-word", 
              overflowWrap: "break-word",
              whiteSpace: "pre-wrap"
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                onSubmit(e)
              }
            }}
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = Math.min(target.scrollHeight, 200) + 'px'
            }}
          />
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            disabled={isLoading}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          />
          
          <div className="flex items-center space-x-2 flex-shrink-0 mt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground transition-colors relative"
              title="Adjuntar archivo o imagen"
            >
              <Paperclip className="h-5 w-5" />
              {attachmentCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {attachmentCount}
                </span>
              )}
            </button>
            
            <button className="text-muted-foreground hover:text-foreground transition-colors">
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
              className="rounded-full h-10 w-10 flex items-center justify-center disabled:opacity-50"
            >
              <img src="/icons/circula_arrow.svg" alt="Enviar" className="h-10 w-10" />
            </button>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Presiona Enter para enviar, Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  )
}