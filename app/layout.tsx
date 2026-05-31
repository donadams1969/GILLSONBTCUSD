import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'

import './globals.css'
import { SafetyProvider } from "@/components/safety/SafetyProvider"

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: 'VALORAIPLUS\u00AE\u00A9\u2122 // V1 OMNIBUS TERMINUS',
  description: 'V1 Sovereign Operative Stack — GDP-Pegged Asset Matrix with BLL Enforcement',
}

export const viewport: Viewport = {
  themeColor: '#020617',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased min-h-screen overflow-x-hidden selection:bg-primary/30">
        <SafetyProvider>
          {children}
        </SafetyProvider>
      </body>
    </html>
  )
}
