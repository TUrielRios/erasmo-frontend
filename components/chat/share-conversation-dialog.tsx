"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Loader2, Share2, Trash2, Users } from "lucide-react"
import { getCompanyUsers, type User } from "@/lib/auth"
import { projectService, type ConversationShareResponse } from "@/lib/projects"

interface ShareConversationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversationId: string // Cambiado de number a string para UUIDs
  conversationTitle: string
}

export function ShareConversationDialog({
  open,
  onOpenChange,
  conversationId,
  conversationTitle,
}: ShareConversationDialogProps) {
  const [companyUsers, setCompanyUsers] = useState<User[]>([])
  const [existingShares, setExistingShares] = useState<ConversationShareResponse[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [canEdit, setCanEdit] = useState(false)
  const [canView, setCanView] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open, conversationId])

  const loadData = async () => {
    setIsLoadingUsers(true)
    try {
      const users = await getCompanyUsers()
      setCompanyUsers(users)

      // Intentar cargar shares existentes, pero no fallar si no hay endpoint
      try {
        const shares = await projectService.getConversationShares(conversationId)
        setExistingShares(shares)
      } catch (shareError) {
        console.warn("Could not load existing shares (endpoint may not support UUIDs):", shareError)
        setExistingShares([])
      }
    } catch (error) {
      console.error("Error loading company users:", error)
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const handleShare = async () => {
    if (!selectedUserId) return

    setIsSharing(true)
    try {
      await projectService.shareConversation(conversationId, {
        shared_with_user_id: selectedUserId,
        can_edit: canEdit,
        can_view: canView,
      })

      // Reload shares
      const shares = await projectService.getConversationShares(conversationId)
      setExistingShares(shares)

      // Reset form
      setSelectedUserId(null)
      setCanEdit(false)
      setCanView(true)

      // Show success message
      alert("¡Conversación compartida exitosamente!")
    } catch (error) {
      console.error("Error sharing conversation:", error)
      alert("Error al compartir la conversación. Intenta de nuevo.")
    } finally {
      setIsSharing(false)
    }
  }

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/chat/${conversationId}`
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        alert("¡Enlace copiado al portapapeles!")
      })
      .catch(() => {
        alert("Error al copiar el enlace")
      })
  }

  const handleRemoveShare = async (shareId: number, userId: number) => {
    if (!confirm("¿Estás seguro de que quieres dejar de compartir con este usuario?")) return

    setIsLoading(true)
    try {
      await projectService.removeConversationShare(conversationId, userId)

      // Reload shares
      const shares = await projectService.getConversationShares(conversationId)
      setExistingShares(shares)
    } catch (error) {
      console.error("Error removing share:", error)
      alert("Error al eliminar el compartido. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const availableUsers = companyUsers.filter(
    (user) => !existingShares.some((share) => share.shared_with_user_id === user.id),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5" />
            <span>Compartir conversación</span>
          </DialogTitle>
          <DialogDescription>Comparte "{conversationTitle}" con tus compañeros de equipo</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing Shares */}
          {existingShares.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                <span>Compartido con ({existingShares.length})</span>
              </div>
              <ScrollArea className="max-h-32">
                <div className="space-y-2">
                  {existingShares.map((share) => {
                    const user = companyUsers.find((u) => u.id === share.shared_with_user_id)
                    return (
                      <div
                        key={share.id}
                        className="flex items-center justify-between p-2 bg-muted rounded-lg border border-border"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user?.full_name || "Usuario"}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            {share.can_edit && (
                              <Badge variant="secondary" className="text-xs">
                                Puede editar
                              </Badge>
                            )}
                            {share.can_view && (
                              <Badge variant="outline" className="text-xs">
                                Puede ver
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveShare(share.id, share.shared_with_user_id)}
                          disabled={isLoading}
                          className="ml-2"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Share with new user */}
          <div className="space-y-3 pt-3 border-t border-border">
            <Label className="text-sm font-medium">Compartir con</Label>

            {isLoadingUsers ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : availableUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay más usuarios disponibles para compartir
              </p>
            ) : (
              <>
                <ScrollArea className="max-h-40 border border-border rounded-lg">
                  <div className="p-2 space-y-1">
                    {availableUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUserId(user.id)}
                        className={`w-full text-left p-2 rounded-md transition-colors ${
                          selectedUserId === user.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        }`}
                      >
                        <p className="text-sm font-medium">{user.full_name}</p>
                        <p className="text-xs opacity-70">{user.email}</p>
                      </button>
                    ))}
                  </div>
                </ScrollArea>

                {selectedUserId && (
                  <div className="space-y-3 p-3 bg-muted rounded-lg">
                    <Label className="text-sm font-medium">Permisos</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="can-view"
                          checked={canView}
                          onCheckedChange={(checked) => setCanView(checked as boolean)}
                        />
                        <Label htmlFor="can-view" className="text-sm cursor-pointer">
                          Puede ver la conversación
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="can-edit"
                          checked={canEdit}
                          onCheckedChange={(checked) => setCanEdit(checked as boolean)}
                        />
                        <Label htmlFor="can-edit" className="text-sm cursor-pointer">
                          Puede editar mensajes
                        </Label>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          {selectedUserId && (
            <Button onClick={handleShare} disabled={isSharing || !canView}>
              {isSharing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Compartiendo...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </>
              )}
            </Button>
          )}
          <Button onClick={handleCopyShareLink} disabled={isLoadingUsers}>
            <Share2 className="h-4 w-4 mr-2" />
            Copiar enlace
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
