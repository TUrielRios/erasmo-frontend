"use client"

import { Home, Users, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { removeAuthToken } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface AdminSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  user: any
}

export function AdminSidebar({ activeTab, setActiveTab, user }: AdminSidebarProps) {
  const router = useRouter()

  const handleLogout = () => {
    removeAuthToken()
    router.push("/login")
  }

  return (
    <div className="h-full bg-[#0000FF] text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-base">Admin Panel</h2>
            <p className="text-xs text-white/70">Gestión del sistema</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-white hover:bg-white/10 h-11",
            activeTab === "dashboard" && "bg-white/90 text-[#0000FF] hover:bg-white/90",
          )}
          onClick={() => setActiveTab("dashboard")}
        >
          <Home className="h-4 w-4 mr-3" />
          Dashboard
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-white hover:bg-white/10 h-11",
            activeTab === "companies" && "bg-white/90 text-[#0000FF] hover:bg-white/90",
          )}
          onClick={() => setActiveTab("companies")}
        >
          <Users className="h-4 w-4 mr-3" />
          Subagentes
        </Button>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-white/20 text-white text-xs">
                {user?.username?.substring(0, 2).toUpperCase() || "AD"}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">{user?.username || "Sofía"}</p>
              <p className="text-xs text-white/70">Administrador</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
