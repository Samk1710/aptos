"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { leaders } from "@/lib/data"
import { SparklesIcon, DocumentTextIcon } from "@heroicons/react/24/outline"

export default function ConsultPage() {
  const searchParams = useSearchParams()
  const [selectedLeader, setSelectedLeader] = useState(leaders[0])
  const [topic, setTopic] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentTopic, setCurrentTopic] = useState("")

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  useEffect(() => {
    const leaderParam = searchParams.get("leader")
    const topicParam = searchParams.get("topic")

    if (leaderParam) {
      const leader = leaders.find((l) => l.id === leaderParam)
      if (leader) setSelectedLeader(leader)
    }

    if (topicParam) {
      setTopic(topicParam)
      setCurrentTopic(topicParam)
    }
  }, [searchParams])

  const generateResponse = async () => {
    if (!topic.trim()) return

    setIsLoading(true)
    setResponse("")
    const data=await fetch("/api/ai-character", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: topic,
        leader: selectedLeader,
      }),
    })
    if (!data.ok) {
      setResponse("Failed to generate response. Please try again.")
      setIsLoading(false)
      return
    }
    const result = await data.json()
    setResponse(result.result)
    setIsLoading(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-fade-in">
        {/* Dateline */}
        <div className="dateline">{currentDate} — Consultation Bureau</div>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl newspaper-headline mb-4">WISDOM CONSULTATIONS</h1>
          <p className="newspaper-subhead text-xl italic">Seek Counsel from History's Greatest Minds</p>
        </div>

        {/* Current Topic Banner */}
        {currentTopic && (
          <div className="newspaper-card mb-8 animate-slide-up">
            <div className="newspaper-card-content">
              <div className="flex items-start space-x-3">
                <DocumentTextIcon className="h-6 w-6 text-gray-600 mt-1" />
                <div>
                  <h3 className="newspaper-subhead mb-2">Current Topic from Affairs Bureau</h3>
                  <p className="newspaper-body">{currentTopic}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leader Selection */}
          <div className="lg:col-span-1 animate-slide-up">
            <div className="newspaper-card mb-6">
              <div className="newspaper-card-content">
                <h2 className="newspaper-subhead text-xl mb-6 text-center border-b-2 border-gray-400 pb-3">
                  SELECT DISTINGUISHED COUNSEL
                </h2>
                <div className="space-y-4">
                  {leaders.map((leader) => (
                    <button
                      key={leader.id}
                      onClick={() => setSelectedLeader(leader)}
                      className={`w-full p-4 border-2 transition-all duration-300 newspaper-body ${
                        selectedLeader.id === leader.id
                          ? "border-gray-800 bg-gray-100"
                          : "border-gray-400 hover:border-gray-600 bg-white"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <Image
                          src={leader.image || "/placeholder.svg"}
                          alt={leader.name}
                          width={50}
                          height={50}
                          className="rounded-full border-2 border-gray-400"
                        />
                        <div className="flex-1 text-left">
                          <h3 className="newspaper-subhead text-sm">{leader.name}</h3>
                          <p className="newspaper-caption text-xs mt-1">{leader.specialty}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Classified Advertisement */}
            <div className="classified-sidebar">
              <h3 className="newspaper-subhead text-sm mb-3 text-center border-b border-gray-400 pb-2">
                CONSULTATION NOTICE
              </h3>
              <div className="space-y-2 text-xs newspaper-body">
                <p>
                  <strong>PREMIUM SERVICE:</strong> Direct access to history's most influential leaders.
                </p>
                <p>
                  <strong>TOPICS AVAILABLE:</strong> Politics, Philosophy, Strategy, Ethics, Leadership
                </p>
                <p>
                  <strong>RESPONSE TIME:</strong> Immediate consultation available
                </p>
                <div className="border-t border-gray-400 pt-2 mt-3 text-center">
                  <p className="newspaper-caption">"Wisdom Through the Ages"</p>
                </div>
              </div>
            </div>
          </div>

          {/* Consultation Panel */}
          <div className="lg:col-span-2">
            <div className="newspaper-article animate-scale-in">
              <div className="newspaper-card-content">
                <div className="text-center mb-8 border-b-2 border-gray-400 pb-6">
                  <div className="relative inline-block">
                    <Image
                      src={selectedLeader.image || "/placeholder.svg"}
                      alt={selectedLeader.name}
                      width={120}
                      height={120}
                      className="rounded-full mx-auto mb-4 border-4 border-gray-400"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-gray-800 text-white p-2 rounded-full">
                      <SparklesIcon className="h-4 w-4" />
                    </div>
                  </div>
                  <h2 className="newspaper-headline text-2xl mb-2">{selectedLeader.name}</h2>
                  <p className="newspaper-caption">{selectedLeader.specialty}</p>
                  <p className="newspaper-caption text-xs mt-1">Available for Consultation</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block newspaper-subhead text-sm mb-3">
                      Submit Your Inquiry to {selectedLeader.name}:
                    </label>
                    <textarea
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder={`What counsel do you seek from ${selectedLeader.name}?`}
                      className="w-full p-4 border-2 border-gray-400 newspaper-body focus:border-gray-600 transition-all duration-300 bg-white"
                      rows={4}
                    />
                  </div>

                  <button
                    onClick={generateResponse}
                    disabled={!topic.trim() || isLoading}
                    className="w-full newspaper-btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Consulting {selectedLeader.name}...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <SparklesIcon className="h-5 w-5" />
                        <span>Request Consultation</span>
                      </div>
                    )}
                  </button>

                  {/* Response Area */}
                  {(response || isLoading) && <div className="newspaper-divider"></div>}

                  {(response || isLoading) && (
                    <div className="newspaper-card animate-fade-in">
                      <div className="newspaper-card-content">
                        <h3 className="newspaper-subhead mb-4 flex items-center space-x-2 border-b border-gray-400 pb-3">
                          <Image
                            src={selectedLeader.image || "/placeholder.svg"}
                            alt={selectedLeader.name}
                            width={32}
                            height={32}
                            className="rounded-full border border-gray-400"
                          />
                          <span>Official Response from {selectedLeader.name}:</span>
                        </h3>
                        {isLoading ? (
                          <div className="space-y-3">
                            <div className="h-4 bg-gray-300 animate-pulse"></div>
                            <div className="h-4 bg-gray-300 animate-pulse"></div>
                            <div className="h-4 bg-gray-300 animate-pulse w-3/4"></div>
                          </div>
                        ) : (
                          <p className="newspaper-body leading-relaxed drop-cap">{response}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {response && !isLoading && (
                    <>
                      <div className="newspaper-divider"></div>
                      <Link
                        href={`/mint?leader=${selectedLeader.id}&topic=${encodeURIComponent(topic)}&response=${encodeURIComponent(response)}`}
                        className="block w-full text-center newspaper-btn-secondary"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <DocumentTextIcon className="h-5 w-5" />
                          <span>Preserve as Historical Record</span>
                        </div>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
