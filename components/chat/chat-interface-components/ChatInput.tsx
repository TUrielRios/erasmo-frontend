"use client"

import type React from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Plus, Loader2 } from "lucide-react"
import { useRef, useState } from "react"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  requireAnalysis: boolean
  onRequireAnalysisChange: (value: boolean) => void
  hasConversation: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  requireAnalysis,
  onRequireAnalysisChange,
  hasConversation,
}: ChatInputProps) {
  // 🔥 Necesario para auto-resize
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSubmit(e as any)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("[MICROPHONE] Error accessing microphone:", error)
      alert("No se pudo acceder al micrófono. Verifica los permisos.")
    }
  }

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return

    setIsRecording(false)
    mediaRecorderRef.current.stop()

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }

    // Wait for the last ondataavailable event
    await new Promise((resolve) => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.onstop = resolve
      }
    })

    // Create blob from chunks
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
    await transcribeAudio(audioBlob)
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    if (audioBlob.size === 0) {
      console.error("[v0] Audio blob is empty")
      return
    }

    setIsTranscribing(true)

    try {
      const formData = new FormData()
      formData.append("audio", audioBlob, "audio.webm")

      console.log("[v0] Starting transcription request, blob size:", audioBlob.size)

      const response = await fetch(`${API_URL}/api/v1/transcribe`, {
        method: "POST",
        body: formData,
      })

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Backend error response:", errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Transcription response:", data)

      const transcribedText = data.text || data.transcription || ""

      if (transcribedText) {
        // Add transcribed text to existing input
        onChange(value ? `${value} ${transcribedText}` : transcribedText)
        console.log("[v0] Transcription added to input")
      } else {
        console.warn("[v0] No text returned from transcription")
      }
    } catch (error) {
      console.error("[v0] Error transcribing audio:", error)
      alert("Error al transcribir el audio. Intenta de nuevo.")
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleMicrophoneClick = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
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

        <div className="flex items-center space-x-3 bg-white border border-gray-300 rounded-2xl px-6 py-3 hover:border-primary/50 transition-colors">
          <Plus className="h-5 w-5 text-muted-foreground flex-shrink-0" />

          {/* Textarea con auto-resize */}
          <textarea
            ref={textareaRef}
            value={value}
            placeholder="Escribe tu consulta para Clara"
            disabled={isLoading || isRecording || isTranscribing}
            rows={1}
            onChange={(e) => {
              onChange(e.target.value)

              if (textareaRef.current) {
                textareaRef.current.style.height = "auto"
                textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
              }
            }}
            onKeyDown={handleKeyDown}
            className="
              flex-1 bg-transparent border-0 outline-none text-base px-0 
              placeholder:text-muted-foreground resize-none overflow-hidden
            "
          />

          <button
            onClick={handleMicrophoneClick}
            disabled={isLoading || isTranscribing}
            className={`text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 ${
              isRecording ? "text-red-500 animate-pulse" : ""
            } disabled:opacity-50`}
            title={isRecording ? "Detener grabación" : "Iniciar grabación"}
          >
            {isTranscribing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
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
            )}
          </button>

          <button
            onClick={onSubmit}
            disabled={isLoading || !value.trim() || isRecording || isTranscribing}
            className="rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0 disabled:opacity-50"
          >
            <img src="/icons/circula_arrow.svg" alt="Enviar" className="h-10 w-10" />
          </button>
        </div>
      </div>
    </div>
  )
}
