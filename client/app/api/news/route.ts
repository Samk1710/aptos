// app/api/news/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q') || 'india'

  const url = `https://serpapi.com/search.json?engine=google_news&q=${encodeURIComponent(
    query
  )}&gl=in&hl=en&api_key=43d26c5a7fbc74cd9831a304e83b6d144d18891b4415b4838b50c5aa0098ae42`

  try {
    const response = await fetch(url)
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Server fetch failed:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
