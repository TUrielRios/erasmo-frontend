"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Upload, X, FileIcon, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fileService } from "@/lib/file-service"
import type { Attachment } from "@/lib/attachment-utils"

interface FileAttachmentAreaProps {
  attachments?: Attachment[]
  onRemove?: (id: string) => void
  onAttachmentsChange: (attachments: Attachment[]) => void
  maxFiles?: number
  disabled?: boolean
}

export function FileAttachmentArea({
  attachments: externalAttachments,
  onRemove,
  onAttachmentsChange,
  maxFiles = 5,
  disabled = false,
}: FileAttachmentAreaProps) {
  const [internalAttachments, setInternalAttachments] = useState<Attachment[]>([])
  const attachments = externalAttachments || internalAttachments
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const processFiles = async (files: FileList | null) => {
    if (!files) return
    if (attachments.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    setError(null)
    setIsProcessing(true)

    const newAttachments: Attachment[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file
      const validation = fileService.validateFile(file)
      if (!validation.valid) {
        setError(`${file.name}: ${validation.error}`)
        continue
      }

      const isImage = file.type.startsWith("image/")
      const attachment: Attachment = {
        file,
        id: `${Date.now()}-${i}`,
        type: isImage ? "image" : "document",
        filename: file.name,
      }

      // Create preview for images
      if (isImage) {
        const reader = new FileReader()
        reader.onload = (e) => {
          attachment.preview = e.target?.result as string
          const updatedAttachments = [...attachments.filter((a) => a.id !== attachment.id), attachment]
          if (externalAttachments) {
            onAttachmentsChange(updatedAttachments)
          } else {
            setInternalAttachments(updatedAttachments)
          }
        }
        reader.readAsDataURL(file)
      }

      newAttachments.push(attachment)
    }

    const updatedAttachments = [...attachments, ...newAttachments]
    if (externalAttachments) {
      onAttachmentsChange(updatedAttachments)
    } else {
      setInternalAttachments(updatedAttachments)
    }
    setIsProcessing(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    processFiles(e.dataTransfer.files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeAttachment = (id: string) => {
    if (onRemove) {
      onRemove(id)
    } else {
      const updated = attachments.filter((a) => a.id !== id)
      if (externalAttachments) {
        onAttachmentsChange(updated)
      } else {
        setInternalAttachments(updated)
      }
    }
  }

  if (attachments.length === 0) {
    return (
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          disabled={disabled || isProcessing}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        />

        <div
          onClick={() => !disabled && !isProcessing && fileInputRef.current?.click()}
          className="flex flex-col items-center gap-2"
        >
          <Upload className="h-6 w-6 text-gray-400" />
          <div className="text-sm">
            <p className="font-medium text-gray-700">Drag files here or click to upload</p>
            <p className="text-xs text-gray-500">Images: PNG, JPG, GIF, WEBP | Documents: PDF, DOCX, XLSX, TXT</p>
            <p className="text-xs text-gray-500">Max {maxFiles} files, 20MB each</p>
          </div>
        </div>

        {error && (
          <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Attachments ({attachments.length})</h4>
        {attachments.length < maxFiles && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isProcessing}
          >
            <Upload className="h-4 w-4 mr-1" />
            Add more
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        disabled={disabled || isProcessing}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {attachments.map((attachment) => (
          <div key={attachment.id} className="relative group border rounded-lg overflow-hidden bg-gray-50">
            {attachment.type === "image" && attachment.preview ? (
              <img
                src={attachment.preview || "/placeholder.svg"}
                alt={attachment.filename}
                className="w-full h-24 object-cover"
              />
            ) : (
              <div className="w-full h-24 flex items-center justify-center bg-gray-100">
                <FileIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <button
                type="button"
                onClick={() => removeAttachment(attachment.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
              {attachment.filename}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  )
}
