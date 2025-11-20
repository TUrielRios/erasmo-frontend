export interface Attachment {
  file: File
  id: string
  preview?: string
  type: "image" | "document"
  fileContext?: string
  filename: string
  uploadedFilename?: string // Filename returned by backend after upload
  content?: string // Extracted content from backend
  analysis?: string // AI analysis from backend
}

export async function uploadAttachmentsToBackend(
  attachments: Attachment[],
  userId: number,
  apiUrl: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
): Promise<Attachment[]> {
  const uploadedAttachments: Attachment[] = []

  for (const attachment of attachments) {
    try {
      const formData = new FormData()
      formData.append("file", attachment.file)
      if (userId) {
        formData.append("user_id", userId.toString())
      }

      const token = localStorage.getItem("access_token")
      const response = await fetch(`${apiUrl}/api/v1/files/upload`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      })

      if (!response.ok) {
        console.error(`Failed to upload ${attachment.filename}:`, await response.text())
        continue
      }

      const result = await response.json()

      uploadedAttachments.push({
        ...attachment,
        uploadedFilename: result.filename,
        content: result.content || result.analysis,
        analysis: result.analysis,
        fileContext: result.content || result.analysis,
      })
    } catch (error) {
      console.error(`Error uploading ${attachment.filename}:`, error)
    }
  }

  return uploadedAttachments
}

export function formatAttachmentsForBackend(attachments: Attachment[]) {
  return attachments.map((att) => ({
    filename: att.uploadedFilename || att.filename,
    file_type: att.type,
    content: att.content || att.fileContext || "",
    analysis: att.analysis || "",
  }))
}
