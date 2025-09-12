"use client"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  // Simple markdown parser for basic formatting
  const parseMarkdown = (text: string) => {
    // Replace headers
    text = text.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2 mt-4">$1</h3>')
    text = text.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3 mt-4">$1</h2>')
    text = text.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 mt-4">$1</h1>')

    // Replace bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')

    // Replace bullet points
    text = text.replace(/^• (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>')

    // Replace line breaks
    text = text.replace(/\n\n/g, '</p><p class="mb-3">')
    text = text.replace(/\n/g, "<br />")

    // Wrap in paragraph tags
    if (!text.includes("<h1>") && !text.includes("<h2>") && !text.includes("<h3>")) {
      text = `<p class="mb-3">${text}</p>`
    }

    return text
  }

  return (
    <div
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  )
}
