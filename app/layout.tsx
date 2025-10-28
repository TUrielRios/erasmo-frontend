import type React from "react"
import type { Metadata } from "next"
import { Red_Hat_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthProvider } from "@/hooks/use-auth"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const redHatDisplay = Red_Hat_Display({
  subsets: ["latin"],
  variable: "--font-red-hat", // ← Cambio aquí
})

export const metadata: Metadata = {
  title: "Erasmo - AI Branding & Marketing",
  description: "Professional AI-powered branding and marketing platform",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="light">
      <body className={`font-sans  ${redHatDisplay.variable} antialiased`}>
        <AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>
            {children}
            <Analytics />
          </Suspense>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}