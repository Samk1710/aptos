"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ClockIcon,
  FireIcon,
  EyeIcon,
} from "@heroicons/react/24/outline"
import { LeaderSelectionModal } from "@/components/LeaderSelectionModal"
import { DebateSetupModal } from "@/components/DebateSetupModal"
import Link from "next/link"
interface NewsItem {
  id: number
  headline: string
  source: string
  publishedAt: string
  category: string
  thumbnail: string
  summary: string
}

interface TrendingTopic {
  id: number
  topic: string
  engagement: number
  trend: "up" | "down"
}

const trendingTopics: TrendingTopic[] = [
  { id: 1, topic: "Climate Action", engagement: 15420, trend: "up" },
  { id: 2, topic: "AI Ethics", engagement: 12350, trend: "up" },
  { id: 3, topic: "Global Democracy", engagement: 9870, trend: "down" },
  { id: 4, topic: "Economic Justice", engagement: 8640, trend: "up" },
  { id: 5, topic: "Peace Negotiations", engagement: 7230, trend: "up" },
]

const categories = ["All", "World", "Politics", "Technology", "Environment", "Economics"]

export default function EventsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showLeaderModal, setShowLeaderModal] = useState(false)
  const [showDebateModal, setShowDebateModal] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState("")

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`/api/news?q=${encodeURIComponent(searchTerm || "current affairs")}`)
        const data = await res.json()
        const mapped = (data.news_results || []).map((item: any, index: number) => ({
          id: index + 1,
          headline: item.title,
          source: item.source?.name || "Unknown",
          publishedAt: item.date ? new Date(item.date).toLocaleDateString() : "",
          category: "World",
          thumbnail: item.thumbnail || "/placeholder.svg",
          summary: item.title,
        }))
        setNews(mapped)
      } catch (err) {
        console.error("Failed to fetch news", err)
      }
    }

    fetchNews()
  }, [searchTerm])

  useEffect(() => {
    let filtered = news

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.summary.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    setFilteredNews(filtered)
  }, [news, searchTerm, selectedCategory])

  const refreshNews = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const handleAskLeader = (topic: string) => {
    setSelectedTopic(topic)
    // setShowLeaderModal(true)
    // setShowDebateModal(true)
  }

  const handleStartDebate = (topic: string) => {
    setSelectedTopic(topic)
    
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="animate-fade-in mb-8">
        <div className="dateline">{currentDate} — Current Affairs Edition</div>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl newspaper-headline mb-4">TODAY'S DISPATCHES</h1>
          <p className="newspaper-subhead text-xl italic">Breaking News from Around the Globe</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="newspaper-body text-lg">Stay informed and engage with history's greatest minds</p>
          <button
            onClick={refreshNews}
            disabled={isRefreshing}
            className="newspaper-btn-secondary flex items-center space-x-2 mt-4 sm:mt-0"
          >
            <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh Telegraph</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="newspaper-card mb-8 animate-slide-up">
        <div className="newspaper-card-content">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600" />
              <input
                type="text"
                placeholder="Search dispatches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-400 newspaper-body focus:border-gray-600 transition-all duration-300"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 font-semibold transition-all duration-300 newspaper-body uppercase tracking-wide ${
                    selectedCategory === category
                      ? "bg-gray-800 text-white border-2 border-gray-800"
                      : "bg-white text-gray-700 border-2 border-gray-400 hover:border-gray-600"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* News Grid */}
        <div className="xl:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredNews.map((item, index) => (
              <div
                key={item.id}
                className="newspaper-article animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative">
                  <Image
                    src={item.thumbnail || "/placeholder.svg"}
                    alt={item.headline}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover border-b-2 border-gray-400"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="news-tag">{item.category}</span>
                  </div>
                </div>

                <div className="newspaper-card-content">
                  <h3 className="newspaper-subhead text-xl mb-3 leading-tight">
                    {item.headline.length > 80 ? `${item.headline.substring(0, 80)}...` : item.headline}
                  </h3>

                  <p className="newspaper-body mb-4 leading-relaxed">{item.summary}</p>

                  <div className="flex items-center justify-between text-sm newspaper-caption mb-4 border-t border-gray-300 pt-3">
                    <span className="font-semibold">{item.source}</span>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-3 w-3" />
                      <span>{item.publishedAt}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link 
                      // onClick={() => handleAskLeader(item.headline)}
                      href={`/consult?topic=${encodeURIComponent(item.headline)}`}
                      className="flex-1 newspaper-btn-primary text-xs py-2 flex items-center justify-center space-x-2"
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                      <span>Consult Leader</span>
                    </Link>
                    <button
                      onClick={() => handleStartDebate(item.headline)}
                      className="flex-1 newspaper-btn-secondary text-xs py-2 flex items-center justify-center space-x-2"
                    >
                      <SparklesIcon className="h-4 w-4" />
                      <span>Start Debate</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Topics Sidebar */}
        <div className="xl:col-span-1">
          <div className="classified-sidebar sticky top-24 animate-slide-up">
            <div className="flex items-center justify-center space-x-2 mb-6 border-b border-gray-400 pb-3">
              <FireIcon className="h-6 w-6 text-orange-600" />
              <h2 className="newspaper-subhead text-lg">TRENDING TOPICS</h2>
            </div>

            <div className="space-y-4">
              {trendingTopics.map((topic, index) => (
                <div key={topic.id} className="group">
                  <div className="p-3 bg-white border border-gray-400 hover:bg-gray-50 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                      <span className={`text-xs font-bold ${topic.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                        {topic.trend === "up" ? "↗ RISING" : "↘ FALLING"}
                      </span>
                    </div>
                    <h3 className="newspaper-subhead text-sm group-hover:text-gray-800 transition-colors">
                      {topic.topic}
                    </h3>
                    <div className="flex items-center space-x-1 mt-1">
                      <EyeIcon className="h-3 w-3 text-gray-500" />
                      <span className="text-xs newspaper-caption">{topic.engagement.toLocaleString()} readers</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAskLeader(topic.topic)}
                    className="w-full mt-2 newspaper-btn-secondary text-xs py-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                  >
                    Investigate Topic
                  </button>
                </div>
              ))}
            </div>

            <div className="newspaper-divider my-6"></div>

            <div className="text-center">
              <h3 className="newspaper-subhead text-sm mb-3">ADVERTISEMENT</h3>
              <div className="border-2 border-gray-400 p-4 bg-white">
                <p className="newspaper-body text-xs leading-tight">
                  <strong>PREMIUM CONSULTATIONS</strong>
                  <br />
                  Unlock exclusive access to history's most influential minds. Connect your wallet today!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LeaderSelectionModal isOpen={showLeaderModal} onClose={() => setShowLeaderModal(false)} topic={selectedTopic} />
      <DebateSetupModal isOpen={showDebateModal} onClose={() => setShowDebateModal(false)} topic={selectedTopic} />
    </div>
  )
}
