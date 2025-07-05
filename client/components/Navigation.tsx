"use client"

import React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useWallet } from "@/contexts/WalletContext"
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  PhotoIcon,
  TrophyIcon,
  UserIcon,
  NewspaperIcon,
} from "@heroicons/react/24/outline"
import { useState } from "react"

const navigation = [
  { name: "Front Page", href: "/", icon: HomeIcon },
  { name: "Current Affairs", href: "/events", icon: NewspaperIcon },
  { name: "Consultations", href: "/consult", icon: ChatBubbleLeftRightIcon },
  { name: "Debates", href: "/debate", icon: SparklesIcon },
  { name: "Archives", href: "/gallery", icon: PhotoIcon },
  { name: "Society Pages", href: "/leaderboard", icon: TrophyIcon },
  { name: "Personal", href: "/profile", icon: UserIcon },
]

export default function Navigation() {
  const pathname = usePathname()
  const { isConnected, address, connectWallet, disconnectWallet } = useWallet()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <nav className="newspaper-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Masthead */}
        <div className="masthead">
          <div className="text-xs newspaper-caption mb-2">{currentDate}</div>
          <h1 className="text-3xl md:text-4xl newspaper-headline tracking-wider">THE WORLD LEADERS' GAZETTE</h1>
          <div className="text-xs newspaper-caption mt-2 italic">
            "Historical Perspectives on Modern Challenges" — Est. 2024
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center py-4">
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item, index) => {
              const Icon = item.icon
              return (
                <React.Fragment key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 font-semibold text-sm transition-all duration-300 newspaper-body ${
                      pathname === item.href
                        ? "bg-brown-400 text-white border-b-2 border-gray-800"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="uppercase tracking-wide">{item.name}</span>
                  </Link>
                  {index < navigation.length - 1 && <div className="column-divider h-6"></div>}
                </React.Fragment>
              )
            })}
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <>
                <div className="hidden sm:block bg-green-100 px-4 py-2 border border-green-600 newspaper-body">
                  <span className="text-sm font-semibold text-green-800">
                    Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
                <button onClick={disconnectWallet} className="newspaper-btn-secondary text-xs">
                  Disconnect
                </button>
              </>
            ) : (
              <button onClick={connectWallet} className="newspaper-btn-primary text-xs">
                Connect Wallet
              </button>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden animate-fade-in border-t border-gray-300 pt-4 pb-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 font-semibold transition-all duration-300 newspaper-body ${
                      pathname === item.href ? "bg-gray-800 text-white" : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="uppercase tracking-wide">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
