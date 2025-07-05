"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { leaders } from "@/lib/data"

export default function MintPage() {
  const searchParams = useSearchParams()
  const { connected, connectWallet, mintNFT } = useWallet()
  const [mintData, setMintData] = useState<any>(null)
  const [isMinting, setIsMinting] = useState(false)
  const [mintSuccess, setMintSuccess] = useState(false)
  const [mintError, setMintError] = useState(false)

  useEffect(() => {
    const type = searchParams.get("type")
    const topic = searchParams.get("topic")

    if (type === "debate") {
      const leader1Id = searchParams.get("leader1")
      const leader2Id = searchParams.get("leader2")
      const leader1 = leaders.find((l) => l.id === leader1Id)
      const leader2 = leaders.find((l) => l.id === leader2Id)

      setMintData({
        type: "debate",
        topic,
        leaders: [leader1, leader2],
        title: `Debate: ${topic}`,
      })
    } else {
      const leaderId = searchParams.get("leader")
      const response = searchParams.get("response")
      const leader = leaders.find((l) => l.id === leaderId)

      setMintData({
        type: "consultation",
        topic,
        leaders: [leader],
        response,
        title: `${leader?.name} on ${topic}`,
      })
    }
  }, [searchParams])

  const handleMint = async () => {
    if (!isConnected) {
      await connectWallet()
      return
    }

    setIsMinting(true)
    setMintError(false)

    try {
      const success = await mintNFT(mintData)
      if (success) {
        setMintSuccess(true)
      } else {
        setMintError(true)
      }
    } catch (error) {
      setMintError(true)
    } finally {
      setIsMinting(false)
    }
  }

  if (!mintData) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-800 mb-4">Loading...</h1>
        </div>
      </div>
    )
  }

  if (mintSuccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-green-600 mb-4">NFT Minted Successfully!</h1>
          <p className="text-slate-600 mb-8">
            Your {mintData.type} NFT has been successfully minted on the Aptos blockchain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/gallery" className="btn-primary">
              View in Gallery
            </Link>
            <a href="#" className="btn-secondary" onClick={(e) => e.preventDefault()}>
              View on Aptos Explorer
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-8">Mint NFT</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* NFT Preview */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">NFT Preview</h2>

          <div className="bg-gradient-to-br from-blue-800 to-amber-500 p-6 rounded-lg text-white mb-4">
            <div className="flex items-center justify-between mb-4">
              {mintData.leaders.map((leader: any, index: number) => (
                <Image
                  key={leader.id}
                  src={leader.image || "/placeholder.svg"}
                  alt={leader.name}
                  width={60}
                  height={60}
                  className="rounded-full border-2 border-white"
                />
              ))}
            </div>

            <h3 className="text-lg font-bold mb-2">{mintData.title}</h3>
            <p className="text-sm opacity-90">
              {mintData.type === "debate" ? "Historical Debate" : "Leadership Consultation"}
            </p>

            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-xs">World Leaders' Roundtable</p>
              <p className="text-xs opacity-75">Aptos Blockchain</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Type:</span>
              <span className="capitalize">{mintData.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Leaders:</span>
              <span>{mintData.leaders.map((l: any) => l.name).join(", ")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Topic:</span>
              <span className="text-right">{mintData.topic}</span>
            </div>
          </div>
        </div>

        {/* Minting Interface */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Mint to Aptos</h2>

          {!isConnected ? (
            <div className="text-center">
              <p className="text-slate-600 mb-6">Connect your Petra wallet to mint this NFT on the Aptos blockchain.</p>
              <button onClick={connectWallet} className="btn-primary w-full">
                Connect Petra Wallet
              </button>
            </div>
          ) : (
            <div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-green-800 font-medium">Wallet Connected</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Minting Cost:</span>
                  <span>0.001 APT</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Gas Fee:</span>
                  <span>~0.0001 APT</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>~0.0011 APT</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleMint}
                disabled={isMinting}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMinting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Minting NFT...
                  </div>
                ) : (
                  "Mint NFT"
                )}
              </button>

              {mintError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">Failed to mint NFT. Please try again.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
