"use client"
import type React from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Settings, BarChart3, Building2, LogOut } from "lucide-react"

interface AdminSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  user?: any
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, user }) => {
  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="h-6 w-6 text-primary" />
          <div>
            <h2 className="font-semibold text-sidebar-foreground">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">Gestión del Sistema</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          <div className="space-y-1">
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("dashboard")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>

            <Button
              variant={activeTab === "companies" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("companies")}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Compañías
            </Button>
          </div>
        </div>
      </ScrollArea>

      {/* User Info */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.full_name || user?.username}</p>
            <p className="text-xs text-muted-foreground">Administrador</p>
          </div>
          <Button variant="ghost" size="sm">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
