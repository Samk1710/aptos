"use client"

import { useState, useEffect } from "react"
import { Loader2, Play, Users, Plus, UserPlus } from "lucide-react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { toast } from "@/hooks/use-toast"
import { WalletSelector } from "@/components/WalletSelector"
import {
  Aptos,
  AptosConfig,
  Network as AptosNetwork,
} from "@aptos-labs/ts-sdk"

interface Leader {
  name: string
  prompt?: string
  image: string
  id: string
  specialty?: string
}

interface DebateMessage {
  id: string
  speaker: "bot1" | "bot2" | "conclusion"
  content: string
  timestamp: Date
}

interface DebateState {
  topic: string
  messages: DebateMessage[]
  isDebating: boolean
  currentRound: number
  phase: "setup" | "debating" | "concluded"
}

export default function DebateSystem() {
  const { account, connected, signAndSubmitTransaction } = useWallet()
  const searchParams = useSearchParams()
  const [availableLeaders, setAvailableLeaders] = useState<Leader[]>([])
  const [leader1, setLeader1] = useState<Leader | null>(null)
  const [leader2, setLeader2] = useState<Leader | null>(null)
  const [showCreateAgent, setShowCreateAgent] = useState(false)
  const [newAgentName, setNewAgentName] = useState("")
  const [creatingAgent, setCreatingAgent] = useState(false)
  const [createError, setCreateError] = useState("")
  const [audiogenerated, setAudioGenerated] = useState(false)
  const [audioUrl, setAudioUrl] = useState("")
  const [debateState, setDebateState] = useState<DebateState>({
    topic: "",
    messages: [],
    isDebating: false,
    currentRound: 0,
    phase: "setup",
  })

  const [savingDebate, setSavingDebate] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [savedLinks, setSavedLinks] = useState<{ json?: string; audio?: string }>({})

  // Add state for NFT minting
  const [mintingNFT, setMintingNFT] = useState(false)
  const [mintError, setMintError] = useState("")
  const [mintSuccess, setMintSuccess] = useState(false)
  const [aptosClient, setAptosClient] = useState<Aptos | null>(null)
  
  // Voice NFT contract information
  const VOICE_NFT_MODULE_ADDRESS = process.env.NEXT_PUBLIC_VOICE_NFT_MODULE_ADDRESS || ""
  const VOICE_NFT_MODULE_NAME = process.env.NEXT_PUBLIC_VOICE_NFT_MODULE_NAME || ""

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Load leaders from localStorage on component mount
  useEffect(() => {
    const storedLeaders =
      typeof window !== "undefined" && localStorage.getItem("leaders")
        ? JSON.parse(localStorage.getItem("leaders")!)
        : []

    setAvailableLeaders(storedLeaders)

    if (storedLeaders.length > 0) {
      setLeader1(storedLeaders[0])
      setLeader2(storedLeaders[1] || storedLeaders[0])
    }
  }, [])

  // Initialize Aptos client
  useEffect(() => {
    const config = new AptosConfig({ network: AptosNetwork.DEVNET })
    setAptosClient(new Aptos(config))
    
    // Debug logging
    console.log("Initializing Aptos client...")
    console.log("Module address:", VOICE_NFT_MODULE_ADDRESS)
    console.log("Module name:", VOICE_NFT_MODULE_NAME)
    console.log("Environment check:", {
      moduleAddress: process.env.NEXT_PUBLIC_VOICE_NFT_MODULE_ADDRESS,
      moduleName: process.env.NEXT_PUBLIC_VOICE_NFT_MODULE_NAME
    })
  }, [])

  const handleCreateAgent = async () => {
    if (!newAgentName.trim()) return

    setCreatingAgent(true)
    setCreateError("")

    try {
      const res = await fetch("/api/ai-personality-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newAgentName }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Failed to create agent")
      }

      const newLeader: Leader = await res.json()

      // Save to localStorage
      const stored = localStorage.getItem("leaders")
      const storedLeaders: Leader[] = stored ? JSON.parse(stored) : []
      storedLeaders.push(newLeader)
      localStorage.setItem("leaders", JSON.stringify(storedLeaders))

      // Update available leaders (remove defaultLeaders reference)
      setAvailableLeaders(storedLeaders)

      // Reset form
      setNewAgentName("")
      setShowCreateAgent(false)

      // Auto-select the new agent if no agents were selected
      if (!leader1) setLeader1(newLeader)
      else if (!leader2) setLeader2(newLeader)
    } catch (err: any) {
      setCreateError(err.message)
    } finally {
      setCreatingAgent(false)
    }
  }

  const startDebate = async () => {
    if (!debateState.topic.trim() || !leader1 || !leader2) return

    setDebateState((prev) => ({
      ...prev,
      isDebating: true,
      phase: "debating",
      messages: [],
      currentRound: 0,
    }))

    try {
      const response = await fetch("/api/ai-debate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: debateState.topic, leader1: leader1, leader2: leader2 }),
      })

      if (!response.ok) throw new Error("Failed to start debate")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No reader available")

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\n").filter((line) => line.trim())

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === "message") {
                setDebateState((prev) => ({
                  ...prev,
                  messages: [
                    ...prev.messages,
                    {
                      id: Date.now().toString(),
                      speaker: data.speaker,
                      content: data.content,
                      timestamp: new Date(),
                    },
                  ],
                  currentRound: data.round,
                }))
              } else if (data.type === "conclusion") {
                setDebateState((prev) => ({
                  ...prev,
                  messages: [
                    ...prev.messages,
                    {
                      id: Date.now().toString(),
                      speaker: "conclusion",
                      content: data.content,
                      timestamp: new Date(),
                    },
                  ],
                  phase: "concluded",
                  isDebating: false,
                }))
              } else if (data.type === "complete") {
                setDebateState((prev) => ({
                  ...prev,
                  isDebating: false,
                  phase: "concluded",
                }))
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e)
            }
          }
        }
      }
    } catch (error) {
      console.error("Error starting debate:", error)
      setDebateState((prev) => ({
        ...prev,
        isDebating: false,
        phase: "setup",
      }))
    }
  }

  const resetDebate = () => {
    setDebateState({
      topic: "",
      messages: [],
      isDebating: false,
      currentRound: 0,
      phase: "setup",
    })
  }

  // Add NFT minting function
  const mintVoiceNFT = async (metadata: string) => {
    if (!aptosClient || !account || !connected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to mint the NFT",
        variant: "destructive",
      })
      return
    }

    setMintingNFT(true)
    setMintError("")
    setMintSuccess(false)

    try {
      const transaction: any = {
        data: {
          function: `${VOICE_NFT_MODULE_ADDRESS}::${VOICE_NFT_MODULE_NAME}::mint_voice_nft`,
          functionArguments: [metadata],
        },
      }

      console.log("Transaction payload:", transaction)
      console.log("Module address:", VOICE_NFT_MODULE_ADDRESS)
      console.log("Module name:", VOICE_NFT_MODULE_NAME)

      const response = await signAndSubmitTransaction(transaction)
      console.log("Transaction response:", response)
      
      await aptosClient.waitForTransaction({ transactionHash: response.hash })

      toast({
        title: "NFT Minted Successfully",
        description: "Your podcast has been preserved as an NFT on the Aptos blockchain",
      })
      
      setMintSuccess(true)
    } catch (error: any) {
      console.error("NFT Minting Error:", error)
      setMintError(error.message || "Failed to mint NFT")
      toast({
        title: "NFT Minting Failed",
        description: error.message || "Failed to mint NFT",
        variant: "destructive",
      })
    } finally {
      setMintingNFT(false)
    }
  }

  const saveDebateRecord = async () => {
    if (!leader1 || !leader2 || debateState.messages.length === 0) return

    setSavingDebate(true)
    setSaveError("")
    setSaveSuccess(false)

    try {
      // Format the debate data with better structure
      const debateData = {
        topic: debateState.topic,
        participants: [leader1.name, leader2.name],
        timestamp: new Date().toISOString(),
        dialogue: debateState.messages
          .filter((msg) => msg.speaker !== "conclusion")
          .reduce(
            (acc, msg) => {
              const speakerName = msg.speaker === "bot1" ? leader1.name : leader2.name
              acc[speakerName] = acc[speakerName] || []
              acc[speakerName].push(msg.content)
              return acc
            },
            {} as Record<string, string[]>,
          ),
        conclusion: debateState.messages.find((msg) => msg.speaker === "conclusion")?.content || "",
      }

      console.log("Saving debate data:", debateData)

      // Save JSON to Pinata
      const jsonResponse = await fetch("/api/save-debate-json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(debateData),
      })

      if (!jsonResponse.ok) {
        const errorData = await jsonResponse.json()
        throw new Error(errorData.error || "Failed to save debate JSON")
      }

      const jsonResult = await jsonResponse.json()
      console.log("JSON saved successfully:", jsonResult)

      // Generate podcast audio
      console.log("Generating podcast audio...")
      const audioResponse = await fetch("/api/generate-debate-podcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          debateData,
          leader1Voice: leader1.name,
          leader2Voice: leader2.name,
        }),
      })

      if (!audioResponse.ok) {
        const errorData = await audioResponse.json()
        console.error("Audio generation error:", errorData)
        // Don't throw error here - we still have the JSON saved
        setSavedLinks({
          json: jsonResult.ipfsHash,
        })
        setSaveSuccess(true)
        setSaveError("Debate saved successfully, but podcast generation failed. You can still access the transcript.")
        return
      }

      const audioResult = await audioResponse.json()
      console.log("Audio generated successfully:", audioResult)
      setAudioGenerated(true)

      setAudioUrl(audioResult.filename)

      setSavedLinks({
        json: jsonResult.ipfsHash,
        audio: audioResult.ipfsHash,
      })
      setSaveSuccess(true)

      // After saving is successful, mint the NFT
      if (audioResult.ipfsHash) {
        const audioUrl = `https://gateway.pinata.cloud/ipfs/${audioResult.ipfsHash}`
        console.log("About to mint NFT with audio URL:", audioUrl)
        console.log("Wallet connected:", connected)
        console.log("Account:", account)
        console.log("Aptos client:", aptosClient)
        await mintVoiceNFT(audioUrl)
      }
    } catch (error: any) {
      console.error("Error saving debate:", error)
      setSaveError(error.message || "Failed to save debate record")
    } finally {
      setSavingDebate(false)
    }
  }

  const getSpeakerInfo = (speaker: string) => {
    switch (speaker) {
      case "bot1":
        return { name: leader1?.name || "Agent 1", color: "bg-gray-800", img: leader1?.image }
      case "bot2":
        return { name: leader2?.name || "Agent 2", color: "bg-gray-600", img: leader2?.image }
      case "conclusion":
        return { name: "Final Verdict", color: "bg-gray-900", avatar: "⚖️" }
      default:
        return { name: "Unknown", color: "bg-gray-500", avatar: "❓" }
    }
  }

  // No agents available state
  if (availableLeaders.length === 0) {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-fade-in">
            <div className="dateline">{currentDate} — Agent Creation Bureau</div>

            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl newspaper-headline mb-4">NO AGENTS PRESENT</h1>
              <p className="newspaper-subhead text-xl italic">Create Your First Artificial Intelligence Agent</p>
            </div>

            <div className="newspaper-article text-center py-16">
              <div className="newspaper-card-content">
                <UserPlus className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                <h3 className="newspaper-headline text-2xl mb-4">AGENT FACTORY AWAITS</h3>
                <p className="newspaper-body text-lg mb-8">
                  No artificial intelligence agents are currently available for debate. Create your first agent to begin
                  intellectual discourse.
                </p>

                <div className="max-w-md mx-auto mb-8">
                  <label className="block newspaper-subhead mb-3">Agent Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Winston Churchill, Marie Curie, etc."
                    value={newAgentName}
                    onChange={(e) => setNewAgentName(e.target.value)}
                    disabled={creatingAgent}
                    className="w-full p-4 border-2 border-gray-400 newspaper-body focus:border-gray-600 transition-all duration-300 bg-white mb-4"
                  />

                  <button
                    onClick={handleCreateAgent}
                    disabled={creatingAgent || !newAgentName.trim()}
                    className="w-full newspaper-btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {creatingAgent ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Manufacturing Agent...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <UserPlus className="h-5 w-5" />
                        <span>Create First Agent</span>
                      </div>
                    )}
                  </button>
                </div>

                {createError && (
                  <div className="newspaper-card bg-red-50 border-red-400 max-w-md mx-auto">
                    <div className="newspaper-card-content">
                      <p className="text-red-800 newspaper-body">{createError}</p>
                    </div>
                  </div>
                )}

                <div className="classified-sidebar inline-block mt-8">
                  <h3 className="newspaper-subhead text-sm mb-3">AGENT SPECIFICATIONS</h3>
                  <div className="space-y-2 text-xs newspaper-body">
                    <p>
                      <strong>PERSONALITY:</strong> AI-generated based on historical figures
                    </p>
                    <p>
                      <strong>CAPABILITIES:</strong> Intelligent debate and discourse
                    </p>
                    <p>
                      <strong>STORAGE:</strong> Saved locally for future use
                    </p>
                    <p>
                      <strong>CUSTOMIZATION:</strong> Unique traits and perspectives
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="animate-fade-in">
          {/* Dateline */}
          <div className="dateline">{currentDate} — Intellectual Arena</div>

          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl newspaper-headline mb-4 flex items-center justify-center gap-3">
              <Users className="h-10 w-10" />
              ARTIFICIAL INTELLIGENCE DEBATE ARENA
            </h1>
            <p className="newspaper-subhead text-xl italic">Witness Mechanical Minds Engage in Scholarly Discourse</p>
          </div>

          {/* Wallet Connection Section */}
          <div className="newspaper-card mb-8">
            <div className="newspaper-card-content">
              <div className="flex items-center justify-between mb-4">
                <h2 className="newspaper-subhead text-lg">Wallet Connection</h2>
                <WalletSelector />
              </div>
              {connected && account && (
                <div className="text-sm newspaper-body text-green-800 flex items-center gap-4">
                  <span>Connected: {account.address?.toString().slice(0, 6)}...{account.address?.toString().slice(-4)}</span>
                  <button
                    onClick={() => {
                      console.log("Testing wallet connection...");
                      console.log("Account:", account);
                      console.log("Connected:", connected);
                      console.log("Aptos client:", aptosClient);
                      console.log("Module address:", VOICE_NFT_MODULE_ADDRESS);
                      console.log("Module name:", VOICE_NFT_MODULE_NAME);
                      
                      toast({
                        title: "Test Wallet Connection",
                        description: "Check console for wallet details",
                      });
                    }}
                    className="newspaper-btn-secondary text-xs py-1 px-3"
                  >
                    Test Wallet
                  </button>
                </div>
              )}
              {!connected && (
                <div className="text-sm newspaper-body text-orange-800">
                  Connect your wallet to mint NFTs after debates
                </div>
              )}
            </div>
          </div>

          {/* Agent Creation Section */}
          <div className="newspaper-card mb-8">
            <div className="newspaper-card-content">
              <div className="flex items-center justify-between mb-4">
                <h2 className="newspaper-subhead text-lg">Available Agents: {availableLeaders.length}</h2>
                <button
                  onClick={() => setShowCreateAgent(!showCreateAgent)}
                  className="newspaper-btn-secondary text-sm py-2 px-4 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create New Agent</span>
                </button>
              </div>

              {showCreateAgent && (
                <div className="border-t-2 border-gray-400 pt-4">
                  <h3 className="newspaper-subhead mb-3">Agent Manufacturing</h3>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Enter agent name (e.g., Napoleon Bonaparte)"
                      value={newAgentName}
                      onChange={(e) => setNewAgentName(e.target.value)}
                      disabled={creatingAgent}
                      className="flex-1 p-3 border-2 border-gray-400 newspaper-body focus:border-gray-600 transition-all duration-300 bg-white"
                    />
                    <button
                      onClick={handleCreateAgent}
                      disabled={creatingAgent || !newAgentName.trim()}
                      className="newspaper-btn-primary text-sm py-3 px-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {creatingAgent ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Creating...</span>
                        </div>
                      ) : (
                        "Create Agent"
                      )}
                    </button>
                  </div>

                  {createError && (
                    <div className="mt-3 p-3 bg-red-50 border-2 border-red-400">
                      <p className="text-red-800 newspaper-body text-sm">{createError}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Leader Selection */}
          {debateState.phase === "setup" && (
            <div className="newspaper-article mb-8 animate-scale-in">
              <div className="newspaper-card-content">
                <h2 className="newspaper-headline text-2xl mb-8 text-center border-b-2 border-gray-400 pb-4">
                  SELECT YOUR DEBATING MACHINES
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="newspaper-subhead mb-6 text-center border-b border-gray-400 pb-2">
                      FIRST ARTIFICIAL MIND
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {availableLeaders.map((leader) => (
                        <button
                          key={leader.id}
                          onClick={() => setLeader1(leader)}
                          className={`p-4 border-2 transition-all duration-300 ${
                            leader1?.id === leader.id
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
                          <p className="text-xs newspaper-caption text-center mt-1">
                            {leader.specialty || "AI Persona"}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="newspaper-subhead mb-6 text-center border-b border-gray-400 pb-2">
                      SECOND ARTIFICIAL MIND
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {availableLeaders.map((leader) => (
                        <button
                          key={leader.id}
                          onClick={() => setLeader2(leader)}
                          className={`p-4 border-2 transition-all duration-300 ${
                            leader2?.id === leader.id
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
                          <p className="text-xs newspaper-caption text-center mt-1">
                            {leader.specialty || "AI Persona"}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
{/* <audio controls>
        <source src="/debate-podcast-1751752625607.wav" type="audio/wav" />
        Your browser does not support the audio element.
      </audio> */}
                <div className="newspaper-divider"></div>

                {/* Topic Input */}
                <div className="mb-8">
                  <label className="block newspaper-subhead mb-3">Debate Topic for Artificial Minds</label>
                  <input
                    type="text"
                    placeholder="e.g., Should artificial intelligence replace human teachers?"
                    value={debateState.topic}
                    onChange={(e) => setDebateState((prev) => ({ ...prev, topic: e.target.value }))}
                    disabled={debateState.isDebating}
                    className="w-full p-4 border-2 border-gray-400 newspaper-body focus:border-gray-600 transition-all duration-300 bg-white"
                  />
                </div>

                <button
                  onClick={startDebate}
                  disabled={
                    debateState.isDebating ||
                    !debateState.topic.trim() ||
                    !leader1 ||
                    !leader2 ||
                    leader1.id === leader2.id
                  }
                  className="w-full newspaper-btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {debateState.isDebating ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Artificial Minds Debating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Play className="h-5 w-5" />
                      <span>Activate Debate Machines</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Active Debate Interface */}
          {(debateState.phase === "debating" || debateState.phase === "concluded") && leader1 && leader2 && (
            <div className="space-y-6">
              {/* Debate Header */}
              <div className="newspaper-card">
                <div className="newspaper-card-content">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <div>
                      <h2 className="newspaper-subhead text-xl mb-2">Current Debate Topic:</h2>
                      <p className="newspaper-body">{debateState.topic}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-4 sm:mt-0">
                      <span className="news-tag">Round {Math.ceil(debateState.currentRound / 2)}/10</span>
                      {debateState.phase === "concluded" && (
                        <button onClick={resetDebate} className="newspaper-btn-secondary text-sm py-2 px-4">
                          New Debate
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Debater Info */}
                  <div className="flex items-center justify-between border-t-2 border-gray-400 pt-4">
                    <div className="flex items-center space-x-4">
                      <Image
                        src={leader1.image || "/placeholder.svg"}
                        alt={leader1.name}
                        width={50}
                        height={50}
                        className="rounded-full border-2 border-gray-400"
                      />
                      <div>
                        <h3 className="newspaper-subhead">{leader1.name}</h3>
                        <p className="newspaper-caption">AI Persona #1</p>
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="text-2xl">⚔️</span>
                      <p className="newspaper-caption">VERSUS</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <h3 className="newspaper-subhead">{leader2.name}</h3>
                        <p className="newspaper-caption">AI Persona #2</p>
                      </div>
                      <Image
                        src={leader2.image || "/placeholder.svg"}
                        alt={leader2.name}
                        width={50}
                        height={50}
                        className="rounded-full border-2 border-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Debate Transcript */}
              <div className="newspaper-article">
                <div className="newspaper-card-content">
                  <h3 className="newspaper-subhead mb-6 border-b-2 border-gray-400 pb-3 text-center">
                    OFFICIAL DEBATE TRANSCRIPT
                  </h3>

                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {debateState.messages.map((message) => {
                      const speakerInfo = getSpeakerInfo(message.speaker)
                      return (
                        <div key={message.id} className="newspaper-card">
                          <div className="newspaper-card-content">
                            <div className="flex items-start gap-4">
                              {speakerInfo.img ? (
                                <Image
                                  src={speakerInfo.img || "/placeholder.svg"}
                                  alt={speakerInfo.name}
                                  width={40}
                                  height={40}
                                  className="rounded-full border-2 border-gray-400 flex-shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center text-lg flex-shrink-0">
                                  {speakerInfo.avatar}
                                </div>
                              )}

                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3 border-b border-gray-300 pb-2">
                                  <h4 className="newspaper-subhead">{speakerInfo.name}</h4>
                                  <span className="newspaper-caption text-xs">
                                    {message.timestamp.toLocaleTimeString()}
                                  </span>
                                  {message.speaker === "conclusion" && (
                                    <span className="news-tag text-xs">FINAL VERDICT</span>
                                  )}
                                </div>
                                <p className="newspaper-body leading-relaxed">
                                  {message.speaker === "conclusion" && (
                                    <span className="drop-cap">{message.content}</span>
                                  )}
                                  {message.speaker !== "conclusion" && message.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {debateState.isDebating && (
                      <div className="newspaper-card border-dashed border-gray-400">
                        <div className="newspaper-card-content">
                          <div className="flex items-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
                            <div>
                              <p className="newspaper-subhead">Artificial Intelligence Processing...</p>
                              <p className="newspaper-caption">Mechanical minds formulating arguments</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {debateState.messages.length === 0 && debateState.phase === "setup" && availableLeaders.length > 0 && (
            <div className="newspaper-article text-center py-16">
              <div className="newspaper-card-content">
                <Users className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                <h3 className="newspaper-headline text-2xl mb-4">DEBATE ARENA AWAITS</h3>
                <p className="newspaper-body text-lg mb-6">
                  Configure your artificial debaters above and witness mechanical minds engage in scholarly discourse
                </p>

                <div className="classified-sidebar inline-block">
                  <h3 className="newspaper-subhead text-sm mb-3">ARENA SPECIFICATIONS</h3>
                  <div className="space-y-2 text-xs newspaper-body">
                    <p>
                      <strong>PARTICIPANTS:</strong> Two AI personas
                    </p>
                    <p>
                      <strong>FORMAT:</strong> Structured intellectual debate
                    </p>
                    <p>
                      <strong>DURATION:</strong> 10 rounds maximum
                    </p>
                    <p>
                      <strong>CONCLUSION:</strong> Automated verdict
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Post-Debate Actions */}
      {debateState.phase === "concluded" && leader1 && leader2 && (
        <div className="newspaper-card text-center">
          <div className="newspaper-card-content">
            <h3 className="newspaper-headline text-xl mb-4">DEBATE CONCLUDED!</h3>
            <p className="newspaper-body mb-6">
              This historic discussion between {leader1?.name} and {leader2?.name} about{" "}
              {debateState.topic.toLowerCase()} is now ready to be preserved for posterity.
            </p>

            {!saveSuccess ? (
              <div className="space-y-4">
                <button
                  onClick={saveDebateRecord}
                  disabled={savingDebate}
                  className="newspaper-btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {savingDebate ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Preserving, Creating Podcast & Minting NFT...</span>
                    </div>
                  ) : (
                    "Preserve, Create Podcast & Mint NFT"
                  )}
                </button>

                {saveError && (
                  <div className="newspaper-card bg-red-50 border-red-400">
                    <div className="newspaper-card-content">
                      <p className="text-red-800 newspaper-body text-sm">{saveError}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="newspaper-card bg-green-50 border-green-400">
                  <div className="newspaper-card-content">
                    <h4 className="newspaper-subhead text-green-800 mb-3">Successfully Preserved!</h4>
                    <div className="space-y-3 text-sm">
                      {savedLinks.json && (
                        <div className="flex items-center justify-between p-3 bg-white border border-green-300">
                          <span className="newspaper-body">Debate Transcript (JSON)</span>
                          <a
                            href={`https://gateway.pinata.cloud/ipfs/${savedLinks.json}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="newspaper-btn-secondary text-xs py-1 px-3"
                          >
                            View Record
                          </a>

                        </div>
                      )}
                      {
                        audiogenerated && <>
                          <div className="flex items-center justify-between p-3 bg-white border border-green-300">
                            <span className="newspaper-body">Debate Podcast (Audio)</span>
                            <a
                              href={audioUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="newspaper-btn-secondary text-xs py-1 px-3"
                            >
                              Listen

                            </a>
                            <audio controls>
        <source src={`${audioUrl}`} type="audio/wav" />
        Your browser does not support the audio element.
      </audio>
                          </div>
                        
                        </>
                      }
                      {savedLinks.audio && (
                        <div className="flex items-center justify-between p-3 bg-white border border-green-300">
                          <span className="newspaper-body">Debate Podcast (Audio)</span>
                          <a
                            href={`https://gateway.pinata.cloud/ipfs/${savedLinks.audio}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="newspaper-btn-secondary text-xs py-1 px-3"
                          >
                            Listen
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {mintSuccess && (
                  <div className="mt-4 newspaper-card bg-green-50 border-green-400">
                    <div className="newspaper-card-content">
                      <h4 className="newspaper-subhead text-green-800 mb-2">NFT Minted Successfully!</h4>
                      <p className="newspaper-body text-sm">
                        Your podcast has been preserved as a Voice NFT on the Aptos blockchain.
                      </p>
                    </div>
                  </div>
                )}

                <button onClick={resetDebate} className="newspaper-btn-primary">
                  Start New Debate
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
