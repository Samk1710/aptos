"use client"

import { useState } from "react"
import { useWallet } from "@/contexts/WalletContext"
import { mockNFTs } from "@/lib/data"

export default function GalleryPage() {
  const { isConnected, address } = useWallet()
  const [filter, setFilter] = useState("all")

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="dateline text-center">{currentDate} — Archives Bureau</div>
        <div className="newspaper-card text-center">
          <div className="newspaper-card-content">
            <h1 className="newspaper-headline text-3xl mb-4">HISTORICAL ARCHIVES</h1>
            <p className="newspaper-body mb-6">
              Connect your wallet to access your personal collection of historical records.
            </p>
            <div className="classified-sidebar inline-block">
              <h3 className="newspaper-subhead text-sm mb-3">NOTICE</h3>
              <p className="newspaper-body text-sm">Wallet connection required for archive access</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="animate-fade-in mb-8">
        <div className="dateline">{currentDate} — Personal Archives</div>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl newspaper-headline mb-4">HISTORICAL ARCHIVES</h1>
          <p className="newspaper-subhead text-xl italic">Your Personal Collection of Historic Records</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="newspaper-body text-lg">
            <strong>Archive Owner:</strong> {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span className="news-tag">{mockNFTs.length} Records</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border-2 border-gray-400 px-3 py-2 newspaper-body bg-white focus:border-gray-600"
            >
              <option value="all">All Records</option>
              <option value="debate">Debates</option>
              <option value="consultation">Consultations</option>
            </select>
          </div>
        </div>
      </div>

      {/* NFT Grid */}
      {mockNFTs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockNFTs.map((nft) => (
            <div key={nft.id} className="newspaper-article animate-scale-in">
              <div className="newspaper-card-content">
                {/* Archive Header */}
                <div className="bg-gray-800 text-white p-4 -m-6 mb-4 border-b-2 border-gray-400">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex space-x-2">
                      {nft.leaders.map((leader, index) => (
                        <div
                          key={index}
                          className="w-8 h-8 bg-white/20 border border-white/40 flex items-center justify-center text-xs font-bold"
                        >
                          {leader[0]}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs bg-white/20 px-2 py-1 border border-white/40">Record #{nft.id}</span>
                  </div>
                  <h3 className="newspaper-subhead text-sm text-white">{nft.topic}</h3>
                </div>

                {/* Archive Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between border-b border-gray-300 pb-2">
                    <span className="newspaper-caption">Participants:</span>
                    <span className="newspaper-body text-sm">{nft.leaders.join(", ")}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-300 pb-2">
                    <span className="newspaper-caption">Date Recorded:</span>
                    <span className="newspaper-body text-sm">{nft.mintDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="newspaper-caption">Type:</span>
                    <span className="news-tag text-xs">Historical Record</span>
                  </div>
                </div>

                <button
                  onClick={() => alert("Official Transcript: " + nft.transcript)}
                  className="w-full newspaper-btn-secondary text-sm py-2"
                >
                  View Official Transcript
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="newspaper-article text-center py-12">
          <div className="newspaper-card-content">
            <div className="text-6xl mb-4">📜</div>
            <h2 className="newspaper-headline text-xl mb-4">NO RECORDS FOUND</h2>
            <p className="newspaper-body mb-6">
              Your personal archive is empty. Begin consulting leaders or arranging debates to create your first
              historical record!
            </p>

            <div className="newspaper-divider"></div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/consult" className="newspaper-btn-primary">
                Request Consultation
              </a>
              <a href="/debate" className="newspaper-btn-secondary">
                Arrange Debate
              </a>
            </div>

            <div className="newspaper-divider"></div>

            <div className="classified-sidebar inline-block mt-6">
              <h3 className="newspaper-subhead text-sm mb-3">ARCHIVE SERVICES</h3>
              <div className="space-y-2 text-xs newspaper-body">
                <p>
                  <strong>CONSULTATIONS:</strong> Private counsel sessions
                </p>
                <p>
                  <strong>DEBATES:</strong> Public intellectual discourse
                </p>
                <p>
                  <strong>PRESERVATION:</strong> Permanent historical records
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
