"use client"

import { useState } from "react"
import Image from "next/image"

interface Leader {
  name: string
  prompt: string
  image: string
  id: string
}

export default function LeaderPage() {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [leader, setLeader] = useState<Leader | null>(null)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    setLeader(null)

    try {
      const res = await fetch("/api/ai-personality-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Something went wrong")
      }

      const data: Leader = await res.json()
      setLeader(data)

      // Save to localStorage
      const stored = localStorage.getItem("leaders")
      const leaders: Leader[] = stored ? JSON.parse(stored) : []
      leaders.push(data)
      localStorage.setItem("leaders", JSON.stringify(leaders))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Generate Political Leader</h1>
      <input
        type="text"
        placeholder="Enter leader name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />
      <button
        onClick={handleSubmit}
        disabled={loading || !name.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {leader && (
        <div className="mt-6 border rounded-lg p-4">
          <h2 className="text-xl font-semibold">{leader.name}</h2>
          <p className="text-sm mt-2">{leader.prompt}</p>
          <Image
            src={leader.image}
            alt={leader.name}
            width={256}
            height={256}
            className="mt-4 rounded border"
          />
        </div>
      )}
    </div>
  )
}
