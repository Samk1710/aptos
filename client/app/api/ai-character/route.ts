import { google } from "@ai-sdk/google"
import { streamText,generateText } from "ai"
import { NextResponse } from "next/server"
import { webSearch } from "./web-search"

export const maxDuration = 30

export async function POST(req: Request) {
  const { query,leader } = await req.json()
 
  const result =await generateText({
    model: google("gemini-2.0-flash"),
    system:leader.prompt,
    prompt: query,
    tools: {webSearch: webSearch},
    maxSteps: 5,
  })

  return NextResponse.json({
    result: result.text,        
  })
}
