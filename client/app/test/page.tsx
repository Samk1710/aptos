'use client'

import { useState } from 'react'

export default function NewsSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchNews = async () => {
    if (!query) return
    setLoading(true)
    console.log('Fetching news for query:', query)

    try {
      const res = await fetch(`/api/news?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      console.log('Fetched data:', data)

      setResults(data.news_results || [])
    } catch (error) {
      console.error('Fetch error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Search News</h1>

      {/* Search Input */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. UPSC, cricket, politics"
          className="flex-1 border p-2 rounded-lg"
        />
        <button
          onClick={fetchNews}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {/* Loading Text */}
      {loading && <p>Loading news...</p>}

      {/* News Results */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {results.map((news, idx) => (
          <a
            key={idx}
            href={news.link}
            target="_blank"
            rel="noopener noreferrer"
            className="border rounded-lg p-4 hover:shadow-md transition bg-white"
          >
            <div className="flex items-start gap-4">
              {news.thumbnail ? (
                <img
                  src={news.thumbnail}
                  alt="thumbnail"
                  className="w-24 h-24 object-cover rounded"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded" />
              )}
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold">{news.title}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {news.source?.name} •{' '}
                  {news.date ? new Date(news.date).toLocaleDateString() : ''}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* No Results Fallback */}
      {!loading && results.length === 0 && query && (
        <p className="text-gray-500 mt-4">No results found.</p>
      )}
    </div>
  )
}
