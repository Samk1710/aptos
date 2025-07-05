import { google } from "@ai-sdk/google"
import { streamText,generateText } from "ai"
import { NextResponse } from "next/server"


export const maxDuration = 30

export async function POST(req: Request) {
  const { query,leader } = await req.json()
 
  const result =await generateText({
    model: google("gemini-2.0-flash"),
    system: leader.prompt,
    prompt: query,
  })

  return NextResponse.json({
    result: result.text,        
  })
}
