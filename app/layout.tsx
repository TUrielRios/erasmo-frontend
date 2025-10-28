import type React from "react"
import type { Metadata } from "next"
import { Red_Hat_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const redHatDisplay = Red_Hat_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-red-hat",
  display: "swap",
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
    <html lang="en">
      <body className={`${redHatDisplay.variable} ${redHatDisplay.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
