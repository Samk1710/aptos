"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { leaders } from "@/lib/data"
import { PlayIcon, DocumentTextIcon } from "@heroicons/react/24/outline"

interface DebateMessage {
  speaker: string
  message: string
  timestamp: Date
}

export default function DebatePage() {
  const searchParams = useSearchParams()
  const [leader1, setLeader1] = useState(leaders[0])
  const [leader2, setLeader2] = useState(leaders[1])
  const [topic, setTopic] = useState("")
  const [currentTopic, setCurrentTopic] = useState("")
  const [isDebating, setIsDebating] = useState(false)
  const [debateMessages, setDebateMessages] = useState<DebateMessage[]>([])
  const [debateEnded, setDebateEnded] = useState(false)

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  useEffect(() => {
    const topicParam = searchParams.get("topic")
    if (topicParam) {
      setTopic(topicParam)
      setCurrentTopic(topicParam)
    }
  }, [searchParams])

  const startDebate = async () => {
    if (!topic.trim()) return

    setIsDebating(true)
    setDebateMessages([])
    setDebateEnded(false)

    // Simulate debate messages
    const messages = [
      {
        speaker: leader1.name,
        message: `I believe that ${topic.toLowerCase()} requires a measured approach based on historical precedent and moral principles. We must learn from past experiences to guide our present decisions.`,
      },
      {
        speaker: leader2.name,
        message: `While I respect that perspective, I think we must also consider the urgent realities of our current situation and act decisively. Sometimes bold action is necessary to create meaningful change.`,
      },
      {
        speaker: leader1.name,
        message: `Decisive action without proper consideration of consequences has led to many historical mistakes. We must balance urgency with wisdom, ensuring our actions serve the greater good.`,
      },
      {
        speaker: leader2.name,
        message: `But we cannot be paralyzed by the past. True leadership means taking calculated risks and making difficult decisions when the moment demands it.`,
      },
      {
        speaker: leader1.name,
        message: `I agree that leadership requires courage, but it also demands patience and the ability to unite people around common values and shared objectives.`,
      },
      {
        speaker: leader2.name,
        message: `On that point, we find common ground. The challenge lies in determining what truly serves the greater good in these complex times.`,
      },
    ]

    for (let i = 0; i < messages.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 3000))
      setDebateMessages((prev) => [...prev, { ...messages[i], timestamp: new Date() }])
    }

    setIsDebating(false)
    setDebateEnded(true)
  }

  const endDebate = () => {
    setIsDebating(false)
    setDebateEnded(true)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-fade-in">
        {/* Dateline */}
        <div className="dateline">{currentDate} — Debate Arena</div>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl newspaper-headline mb-4">INTELLECTUAL DISCOURSE</h1>
          <p className="newspaper-subhead text-xl italic">Where Great Minds Meet in Debate</p>
        </div>

        {/* Current Topic Banner */}
        {currentTopic && (
          <div className="newspaper-card mb-8 animate-slide-up">
            <div className="newspaper-card-content">
              <div className="flex items-start space-x-3">
                <DocumentTextIcon className="h-6 w-6 text-gray-600 mt-1" />
                <div>
                  <h3 className="newspaper-subhead mb-2">Topic from Current Affairs</h3>
                  <p className="newspaper-body">{currentTopic}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isDebating && !debateEnded && (
          <div className="newspaper-article animate-scale-in">
            <div className="newspaper-card-content">
              <h2 className="newspaper-headline text-2xl mb-8 text-center border-b-2 border-gray-400 pb-4">
                ARRANGE YOUR DEBATE
              </h2>

              {/* Leader Selection */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="newspaper-subhead mb-6 text-center border-b border-gray-400 pb-2">FIRST DEBATER</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {leaders.map((leader) => (
                      <button
                        key={leader.id}
                        onClick={() => setLeader1(leader)}
                        className={`p-4 border-2 transition-all duration-300 ${
                          leader1.id === leader.id
                            ? "border-gray-800 bg-gray-100"
                            : "border-gray-400 hover:border-gray-600 bg-white"
                        }`}
                      >
                        <Image
                          src={leader.image || "/placeholder.svg"}
                          alt={leader.name}
                          width={50}
                          height={50}
                          className="rounded-full mx-auto mb-3 border-2 border-gray-400"
                        />
                        <p className="text-sm newspaper-subhead text-center">{leader.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="newspaper-subhead mb-6 text-center border-b border-gray-400 pb-2">SECOND DEBATER</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {leaders.map((leader) => (
                      <button
                        key={leader.id}
                        onClick={() => setLeader2(leader)}
                        className={`p-4 border-2 transition-all duration-300 ${
                          leader2.id === leader.id
                            ? "border-gray-800 bg-gray-100"
                            : "border-gray-400 hover:border-gray-600 bg-white"
                        }`}
                      >
                        <Image
                          src={leader.image || "/placeholder.svg"}
                          alt={leader.name}
                          width={50}
                          height={50}
                          className="rounded-full mx-auto mb-3 border-2 border-gray-400"
                        />
                        <p className="text-sm newspaper-subhead text-center">{leader.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="newspaper-divider"></div>

              {/* Topic Input */}
              <div className="mb-8">
                <label className="block newspaper-subhead mb-3">Debate Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., How should we address climate change?"
                  className="w-full p-4 border-2 border-gray-400 newspaper-body focus:border-gray-600 transition-all duration-300 bg-white"
                />
              </div>

              <button
                onClick={startDebate}
                disabled={!topic.trim() || leader1.id === leader2.id}
                className="w-full newspaper-btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="flex items-center justify-center space-x-2">
                  <PlayIcon className="h-5 w-5" />
                  <span>Commence Debate</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Debate Interface */}
        {(isDebating || debateEnded) && (
          <div>
            {/* Debate Header */}
            <div className="newspaper-card mb-6">
              <div className="newspaper-card-content">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="newspaper-subhead text-xl">Debate Topic: {topic}</h2>
                  {isDebating && (
                    <button onClick={endDebate} className="newspaper-btn-secondary text-sm py-2 px-4">
                      End Debate
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Image
                      src={leader1.image || "/placeholder.svg"}
                      alt={leader1.name}
                      width={60}
                      height={60}
                      className="rounded-full border-2 border-gray-400"
                    />
                    <div>
                      <h3 className="newspaper-subhead">{leader1.name}</h3>
                      <p className="newspaper-caption">{leader1.specialty}</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="text-2xl">⚔️</span>
                    <p className="newspaper-caption">VERSUS</p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <h3 className="newspaper-subhead">{leader2.name}</h3>
                      <p className="newspaper-caption">{leader2.specialty}</p>
                    </div>
                    <Image
                      src={leader2.image || "/placeholder.svg"}
                      alt={leader2.name}
                      width={60}
                      height={60}
                      className="rounded-full border-2 border-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Debate Transcript */}
            <div className="newspaper-article mb-6">
              <div className="newspaper-card-content">
                <h3 className="newspaper-subhead mb-4 border-b border-gray-400 pb-2">Official Transcript</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {debateMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.speaker === leader1.name ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 border-2 ${
                          message.speaker === leader1.name ? "border-gray-600 bg-gray-100" : "border-gray-400 bg-white"
                        }`}
                      >
                        <p className="newspaper-subhead text-sm mb-1">{message.speaker}</p>
                        <p className="newspaper-body text-sm">{message.message}</p>
                      </div>
                    </div>
                  ))}

                  {isDebating && (
                    <div className="flex justify-center">
                      <div className="animate-pulse newspaper-caption">Debate in progress...</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Post-Debate Actions */}
            {debateEnded && (
              <div className="newspaper-card text-center">
                <div className="newspaper-card-content">
                  <h3 className="newspaper-headline text-xl mb-4">DEBATE CONCLUDED!</h3>
                  <p className="newspaper-body mb-6">
                    This historic discussion between {leader1.name} and {leader2.name} about {topic.toLowerCase()} is
                    now ready to be preserved for posterity.
                  </p>
                  <Link
                    href={`/mint?type=debate&leader1=${leader1.id}&leader2=${leader2.id}&topic=${encodeURIComponent(topic)}`}
                    className="newspaper-btn-primary"
                  >
                    Preserve Historical Record
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
