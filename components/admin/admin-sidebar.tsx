"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { logout } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface AdminSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  user: any
}

export function AdminSidebar({ activeTab, setActiveTab, user }: AdminSidebarProps) {
  const router = useRouter()

  const handleLogout = () => {
    logout()
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
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-white hover:bg-white/10 h-11",
            activeTab === "protocols" && "bg-white/90 text-[#0000FF] hover:bg-white/90"
          )}
          onClick={() => setActiveTab("protocols")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M12 18v-6" />
            <path d="M9 15h6" />
          </svg>
          Protocolos
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
