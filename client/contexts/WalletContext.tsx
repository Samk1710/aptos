"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface WalletContextType {
  isConnected: boolean
  address: string | null
  balance: number
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  mintNFT: (data: any) => Promise<boolean>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    // Check if wallet was previously connected
    const savedAddress = localStorage.getItem("walletAddress")
    if (savedAddress) {
      setIsConnected(true)
      setAddress(savedAddress)
      setBalance(Math.random() * 100) // Mock balance
    }
  }, [])

  const connectWallet = async () => {
    try {
      // Simulate Petra wallet connection
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const mockAddress = "0x" + Math.random().toString(16).substr(2, 40)
      setAddress(mockAddress)
      setIsConnected(true)
      setBalance(Math.random() * 100)
      localStorage.setItem("walletAddress", mockAddress)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setAddress(null)
    setBalance(0)
    localStorage.removeItem("walletAddress")
  }

  const mintNFT = async (data: any) => {
    try {
      // Simulate NFT minting transaction
      await new Promise((resolve) => setTimeout(resolve, 2000))
      return Math.random() > 0.1 // 90% success rate
    } catch (error) {
      return false
    }
  }

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        balance,
        connectWallet,
        disconnectWallet,
        mintNFT,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
