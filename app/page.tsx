"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import AuthScreen from "@/components/auth-screen"
import LoadingScreen from "@/components/loading-screen"
import DashboardLayout from "@/components/dashboard-layout"
import ChatSection from "@/components/sections/chat-section"
import KnowledgeSection from "@/components/sections/knowledge-section"
import PersonalitySection from "@/components/sections/personality-section"
import HistorySection from "@/components/sections/history-section"
import AnalyticsSection from "@/components/sections/analytics-section"
import SettingsSection from "@/components/sections/settings-section"

export default function ErasmoAI() {
  const { isAuthenticated, isLoading } = useAuth()
  const [activeSection, setActiveSection] = useState("chat")

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <AuthScreen />
  }

  const renderSection = () => {
    switch (activeSection) {
      case "chat":
        return <ChatSection />
      case "knowledge":
        return <KnowledgeSection />
      case "personality":
        return <PersonalitySection />
      case "history":
        return <HistorySection />
      case "analytics":
        return <AnalyticsSection />
      case "settings":
        return <SettingsSection />
      default:
        return <ChatSection />
    }
  }

  return (
    <DashboardLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      {renderSection()}
    </DashboardLayout>
  )
}
