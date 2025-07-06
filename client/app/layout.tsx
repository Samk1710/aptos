import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { WalletProvider } from "@/components/WalletProvider"
import { AutoConnectProvider } from "@/components/AutoConnectProvider"
import {ReactQueryClientProvider} from "@/components/ReactQueryClientProvider"
import Navigation from "@/components/Navigation"
import { Toaster } from "@/components/ui/toaster"
import { Playfair_Display, Crimson_Text, Old_Standard_TT } from "next/font/google"

// Define fonts with Next.js font system
const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "700", "900"],
})

const crimson = Crimson_Text({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-crimson",
  weight: ["400", "600"],
})

const oldStandard = Old_Standard_TT({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-old-standard",
  weight: ["400", "700"],
})

export const metadata: Metadata = {
  title: "The World Leaders' Gazette — Historical Perspectives on Modern Challenges",
  description: "A vintage newspaper experience featuring consultations with history's greatest minds",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${crimson.variable} ${oldStandard.variable}`}>
      <body className="animate-flicker">
        <div className="watermark">LEADERS' GAZETTE</div>
        <div className="min-h-screen">
          <ReactQueryClientProvider>
            <AutoConnectProvider>
              <WalletProvider>
                <Navigation />
                <main>{children}</main>
                <Toaster />
              </WalletProvider>
            </AutoConnectProvider>
          </ReactQueryClientProvider>
        </div>
      </body>
    </html>
  )
}
