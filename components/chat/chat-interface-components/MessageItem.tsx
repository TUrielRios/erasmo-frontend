"use client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Lightbulb, Target, Clock, Edit, Trash2, Check, X } from "lucide-react"
import Image from "next/image"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: string
}

interface MessageItemProps {
  message: Message
  editingMessageId: string | null
  editingContent: string
  openDropdowns: Record<string, boolean>
  onStartEdit: (messageId: string, content: string) => void
  onSaveEdit: (messageId: string) => void
  onCancelEdit: () => void
  onDeleteMessage: (messageId: string) => void
  onEditingContentChange: (content: string) => void
  onToggleDropdown: (messageId: string, type: string) => void
}

export function MessageItem({
  message,
  editingMessageId,
  editingContent,
  openDropdowns,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDeleteMessage,
  onEditingContentChange,
  onToggleDropdown,
}: MessageItemProps) {
  const isEditing = editingMessageId === message.id

  if (message.role === "user") {
    return (
      <div className="flex w-full justify-end">
        <div className="max-w-[80%] rounded-lg px-4 py-3 bg-[#EBEEFF] text-gray-900 rounded-3xl ml-12">
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editingContent}
                onChange={(e) => onEditingContentChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    e.preventDefault()
                    onSaveEdit(message.id)
                  } else if (e.key === "Escape") {
                    onCancelEdit()
                  }
                }}
                className="w-full min-h-[100px] resize-y"
                autoFocus
              />
              <div className="flex items-center space-x-2">
                <Button size="sm" onClick={() => onSaveEdit(message.id)} className="h-7">
                  <Check className="h-3 w-3 mr-1" />
                </Button>
                <Button size="sm" variant="ghost" onClick={onCancelEdit} className="h-7">
                  <X className="h-3 w-3 mr-1" />
                </Button>
              </div>
              <p className="text-xs opacity-70">Presiona Ctrl+Enter para guardar</p>
            </div>
          ) : (
            <>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
              {!message.id.startsWith("temp-") && (
                <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-[#EBEEFF]/50">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onStartEdit(message.id, message.content)}
                    className="h-6 w-6 p-0 hover:bg-[#EBEEFF]/50"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteMessage(message.id)}
                    className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  // Assistant message
  return (
    <div className="flex w-full justify-start">
      <div className="max-w-[80%] rounded-lg px-4 py-3 bg-transparent mr-12">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0">
            <Image src="/icons/logo_clara_azul.svg" alt="Clara" width={24} height={24} />
          </div>
          <div className="flex-1">
            <AssistantMessageContent
              message={message}
              openDropdowns={openDropdowns}
              onToggleDropdown={onToggleDropdown}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function AssistantMessageContent({ message, openDropdowns, onToggleDropdown }) {
  let responseData = null
  try {
    if (typeof message.content === "object") {
      responseData = message.content
    } else if (
      typeof message.content === "string" &&
      (message.content.includes("conceptual") || message.content.includes("accional"))
    ) {
      responseData = JSON.parse(message.content)
    }
  } catch (e) {
    responseData = null
  }

  if (responseData && responseData.response_type !== "normal" && (responseData.conceptual || responseData.accional)) {
    return (
      <StructuredResponse
        message={message}
        responseData={responseData}
        openDropdowns={openDropdowns}
        onToggleDropdown={onToggleDropdown}
      />
    )
  }

  const content =
    typeof message.content === "object"
      ? message.content.conceptual?.content || message.content.accional?.content || JSON.stringify(message.content)
      : message.content

  return (
    <>
      <div className="text-sm leading-relaxed text-foreground">
        <FormattedContent content={content} />
      </div>
      <div className="flex items-center space-x-2 mt-3 pt-2 border-gray-200">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigator.clipboard.writeText(message.content)}
          className="h-6 px-2 text-xs hover:bg-accent/50"
        >
          <img src="icons/copiar.svg" alt="" className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs hover:bg-accent/50">
          <img src="icons/descarga.svg" alt="" className="h-4 w-4" />
        </Button>
      </div>
    </>
  )
}

function StructuredResponse({ message, responseData, openDropdowns, onToggleDropdown }) {
  const hasConceptual = responseData.conceptual && responseData.conceptual.content
  const hasAccional = responseData.accional && responseData.accional.content

  return (
    <div className="space-y-2 min-w-[400px]">
      {hasConceptual && (
        <Card className="mb-3 border border-border hover:shadow-md transition-all duration-200">
          <button
            onClick={() => onToggleDropdown(message.id, "conceptual")}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-accent/50 transition-colors rounded-t-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Lightbulb className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground">Análisis Conceptual</h3>
            </div>
            {openDropdowns[`${message.id}-conceptual`] ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>

          {openDropdowns[`${message.id}-conceptual`] && (
            <div className="px-4 pb-4 border-t border-border bg-muted/20">
              <div className="pt-4 prose prose-sm max-w-none">
                <FormattedContent content={responseData.conceptual.content} />
              </div>
            </div>
          )}
        </Card>
      )}

      {hasAccional && (
        <Card className="mb-3 border border-border hover:shadow-md transition-all duration-200">
          <button
            onClick={() => onToggleDropdown(message.id, "accional")}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-accent/50 transition-colors rounded-t-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Plan de Acción</h3>
                <div className="flex items-center space-x-2 mt-1">
                  {responseData.accional.priority && (
                    <Badge variant="outline" className="text-xs">
                      {responseData.accional.priority}
                    </Badge>
                  )}
                  {responseData.accional.timeline && (
                    <Badge variant="secondary" className="text-xs flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{responseData.accional.timeline}</span>
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {openDropdowns[`${message.id}-accional`] ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>

          {openDropdowns[`${message.id}-accional`] && (
            <div className="px-4 pb-4 border-t border-border bg-muted/20">
              <div className="pt-4 prose prose-sm max-w-none">
                <FormattedContent content={responseData.accional.content} />
              </div>
            </div>
          )}
        </Card>
      )}
      <p className="text-xs opacity-70 mt-2">{new Date(message.timestamp).toLocaleTimeString()}</p>
    </div>
  )
}

function FormattedContent({ content }: { content: string }) {
  return (
    <>
      {content.split("\n").map((line, index) => {
        if (line.startsWith("# ")) {
          return (
            <h1 key={index} className="text-lg font-bold mt-4 mb-2">
              {line.substring(2)}
            </h1>
          )
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={index} className="text-base font-semibold mt-3 mb-2">
              {line.substring(3)}
            </h2>
          )
        }
        if (line.startsWith("### ")) {
          return (
            <h3 key={index} className="text-sm font-semibold mt-2 mb-1 text-foreground">
              {line.substring(4)}
            </h3>
          )
        }
        if (line === "---") {
          return <hr key={index} className="my-4 border-border" />
        }
        if (line.includes("**")) {
          const parts = line.split(/(\*\*.*?\*\*)/g)
          return (
            <p key={index} className="mb-2 text-foreground">
              {parts.map((part, partIndex) =>
                part.startsWith("**") && part.endsWith("**") ? (
                  <strong key={partIndex}>{part.slice(2, -2)}</strong>
                ) : (
                  part
                ),
              )}
            </p>
          )
        }
        if (/^\d+\.\s/.test(line)) {
          return (
            <div key={index} className="ml-4 mb-1 text-foreground">
              {line}
            </div>
          )
        }
        if (line.startsWith("   - ")) {
          return (
            <div key={index} className="ml-8 mb-1 text-foreground">
              • {line.substring(5)}
            </div>
          )
        }
        if (line.startsWith("- ")) {
          return (
            <div key={index} className="ml-4 mb-1 text-foreground">
              • {line.substring(2)}
            </div>
          )
        }
        if (line.trim() === "") {
          return <br key={index} />
        }
        return (
          <p key={index} className="mb-2 text-foreground">
            {line}
          </p>
        )
      })}
    </>
  )
}
