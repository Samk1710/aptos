"use client"

import { useWallet } from "@/contexts/WalletContext"
import { useState } from "react"
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline"

export default function ProfilePage() {
  const { isConnected, address, balance } = useWallet()
  const [copied, setCopied] = useState(false)
  const [aiDepth, setAiDepth] = useState("detailed")

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="dateline text-center">{currentDate} — Personal Bureau</div>
        <div className="newspaper-card text-center">
          <div className="newspaper-card-content">
            <h1 className="newspaper-headline text-3xl mb-4">PERSONAL RECORDS</h1>
            <p className="newspaper-body mb-6">
              Connect your wallet to access your personal profile and activity records.
            </p>
            <div className="classified-sidebar inline-block">
              <h3 className="newspaper-subhead text-sm mb-3">NOTICE</h3>
              <p className="newspaper-body text-sm">Wallet connection required for profile access</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const recentActivity = [
    {
      id: 1,
      action: "Consulted Gandhi about AI Ethics",
      timestamp: "2 hours ago",
      type: "consultation",
    },
    {
      id: 2,
      action: "Started debate: Churchill vs Roosevelt on Climate Action",
      timestamp: "1 day ago",
      type: "debate",
    },
    {
      id: 3,
      action: "Minted NFT: Lincoln on Democracy",
      timestamp: "3 days ago",
      type: "mint",
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-fade-in">
        {/* Dateline */}
        <div className="dateline">{currentDate} — Personal Records Bureau</div>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl newspaper-headline mb-4">PERSONAL PROFILE</h1>
          <p className="newspaper-subhead text-xl italic">Individual Activity & Account Records</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wallet Info & Settings */}
          <div className="lg:col-span-1">
            {/* Wallet Information */}
            <div className="newspaper-article mb-6">
              <div className="newspaper-card-content">
                <h2 className="newspaper-subhead text-lg mb-4 border-b-2 border-gray-400 pb-3 text-center">
                  WALLET CREDENTIALS
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block newspaper-caption mb-2">Registered Address</label>
                    <div className="flex items-center space-x-2 border-2 border-gray-400 p-3 bg-white">
                      <code className="flex-1 newspaper-body text-sm font-mono">{address?.slice(0, 20)}...</code>
                      <button
                        onClick={copyAddress}
                        className="p-2 text-gray-600 hover:text-gray-800 transition-colors border border-gray-400 bg-gray-50"
                      >
                        {copied ? (
                          <CheckIcon className="h-4 w-4 text-green-600" />
                        ) : (
                          <ClipboardIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block newspaper-caption mb-2">Account Balance</label>
                    <div className="border-2 border-gray-400 p-3 bg-white">
                      <span className="newspaper-subhead">{balance.toFixed(4)} APT</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="newspaper-article mb-6">
              <div className="newspaper-card-content">
                <h2 className="newspaper-subhead text-lg mb-4 border-b-2 border-gray-400 pb-3 text-center">
                  PREFERENCES
                </h2>

                <div>
                  <label className="block newspaper-caption mb-3">Response Detail Level</label>
                  <div className="space-y-2">
                    <label className="flex items-center newspaper-body">
                      <input
                        type="radio"
                        name="aiDepth"
                        value="simple"
                        checked={aiDepth === "simple"}
                        onChange={(e) => setAiDepth(e.target.value)}
                        className="mr-3"
                      />
                      Brief Responses
                    </label>
                    <label className="flex items-center newspaper-body">
                      <input
                        type="radio"
                        name="aiDepth"
                        value="detailed"
                        checked={aiDepth === "detailed"}
                        onChange={(e) => setAiDepth(e.target.value)}
                        className="mr-3"
                      />
                      Detailed Analysis
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Classified Advertisement */}
            <div className="classified-sidebar">
              <h3 className="newspaper-subhead text-sm mb-3 text-center border-b border-gray-400 pb-2">
                MEMBER BENEFITS
              </h3>
              <div className="space-y-2 text-xs newspaper-body">
                <p>
                  <strong>PREMIUM ACCESS:</strong> Unlimited consultations with historical figures
                </p>
                <p>
                  <strong>DEBATE HOSTING:</strong> Arrange private intellectual discussions
                </p>
                <p>
                  <strong>ARCHIVE STORAGE:</strong> Permanent record preservation
                </p>
                <div className="border-t border-gray-400 pt-2 mt-3 text-center">
                  <p className="newspaper-caption">"Member Since 2024"</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and Activity */}
          <div className="lg:col-span-2">
            {/* Stats */}
            <div className="newspaper-article mb-6">
              <div className="newspaper-card-content">
                <h2 className="newspaper-subhead text-lg mb-6 border-b-2 border-gray-400 pb-3 text-center">
                  ACTIVITY STATISTICS
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center border-2 border-gray-400 p-4 bg-white">
                    <div className="text-3xl newspaper-headline mb-2">7</div>
                    <div className="newspaper-caption">Debates Completed</div>
                  </div>
                  <div className="text-center border-2 border-gray-400 p-4 bg-white">
                    <div className="text-3xl newspaper-headline mb-2">12</div>
                    <div className="newspaper-caption">Topics Covered</div>
                  </div>
                  <div className="text-center border-2 border-gray-400 p-4 bg-white">
                    <div className="text-3xl newspaper-headline mb-2">5</div>
                    <div className="newspaper-caption">Records Preserved</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="newspaper-article">
              <div className="newspaper-card-content">
                <h2 className="newspaper-subhead text-lg mb-6 border-b-2 border-gray-400 pb-3 text-center">
                  RECENT ACTIVITY LOG
                </h2>

                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="border-2 border-gray-400 p-4 bg-white">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div
                            className={`w-4 h-4 mt-1 border-2 ${
                              activity.type === "consultation"
                                ? "bg-gray-600 border-gray-800"
                                : activity.type === "debate"
                                  ? "bg-gray-400 border-gray-600"
                                  : "bg-gray-800 border-gray-900"
                            }`}
                          ></div>
                        </div>
                        <div className="flex-1">
                          <p className="newspaper-body font-semibold">{activity.action}</p>
                          <p className="newspaper-caption mt-1">{activity.timestamp}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <span
                            className={`news-tag text-xs ${
                              activity.type === "consultation"
                                ? "bg-gray-600"
                                : activity.type === "debate"
                                  ? "bg-gray-500"
                                  : "bg-gray-800"
                            }`}
                          >
                            {activity.type.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="newspaper-divider"></div>

                <div className="text-center">
                  <p className="newspaper-body mb-4">Continue building your intellectual legacy</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="/consult" className="newspaper-btn-primary text-sm py-2 px-6">
                      New Consultation
                    </a>
                    <a href="/debate" className="newspaper-btn-secondary text-sm py-2 px-6">
                      Arrange Debate
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
