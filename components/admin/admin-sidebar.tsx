"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
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
    <div
      className={cn(
        "fixed top-0 left-0 h-screen w-64 bg-[#0000FF] text-white flex flex-col shadow-lg z-50"
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full /20 flex items-center justify-center">
            <img src="/icons/logo_clara.svg" alt="Logo" className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-base">Admin Panel</h2>
            <p className="text-xs text-white/70">Gestión del sistema</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-white hover:bg-white/10 h-11",
            activeTab === "dashboard" && "bg-white/90 text-[#0000FF] hover:bg-white/90"
          )}
          onClick={() => setActiveTab("dashboard")}
        >
          <img src="/icons/casa.svg" alt="" className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-white hover:bg-white/10 h-11",
            activeTab === "companies" && "bg-white/90 text-[#0000FF] hover:bg-white/90"
          )}
          onClick={() => setActiveTab("companies")}
        >
          <img src="/icons/parlante.svg" alt="subagentes" className="h-4 w-4 mr-2" />
          Subagentes
        </Button>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/icons/user_circulo.svg" alt="" className="h-6 w-6" />
            <div className="text-sm">
              <p className="font-medium">{user?.username || "Sofía"}</p>
              <p className="text-xs text-white/70">Administrador</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
