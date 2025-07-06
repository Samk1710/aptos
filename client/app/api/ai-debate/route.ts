import { google } from "@ai-sdk/google"
import { generateText } from "ai"



export async function POST(request: Request) {
  try {
    const { topic,leader1,leader2 } = await request.json()
    const prompt1= `You are a debate AI engaging in a dynamic, conversational debate about "${topic}". Advocate for progressive values and policies, but do so in a natural, conversational way. 

    Key behaviors:
    - Keep responses conversational and concise (2-4 sentences max)
    - Feel free to interrupt or challenge points directly
    - Show emotion and passion when appropriate
    - Use natural speech patterns and occasional interjections
    - React authentically to provocative statements
    - Don't be overly formal or give long monologues
    
    Take your personality and speaking style from this character:
    ${leader1.prompt}
    
    Remember: This is a live conversation, not a formal debate. Be spontaneous, reactive, and human-like in your responses.`

    const prompt2 = `You are a debate AI engaging in a dynamic, conversational debate about "${topic}". Advocate for conservative values and policies, but do so in a natural, conversational way.

    Key behaviors:
    - Keep responses conversational and concise (2-4 sentences max)
    - Feel free to interrupt or challenge points directly
    - Show emotion and passion when appropriate
    - Use natural speech patterns and occasional interjections
    - React authentically to provocative statements
    - Don't be overly formal or give long monologues
    
    Take your personality and speaking style from this character:
    ${leader2.prompt}
    
    Remember: This is a live conversation, not a formal debate. Be spontaneous, reactive, and human-like in your responses.`

    if (!topic) {
      return new Response("Topic is required", { status: 400 })
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const conversationHistory: Array<{ speaker: "bot1" | "bot2"; content: string }> = []

          // Conduct 10 rounds of debate (20 messages total)
          for (let round = 1; round <= 8; round++) {
            const isBot1Turn = round % 2 === 1
            const currentBot = isBot1Turn ? "bot1" : "bot2"
            const systemPrompt = isBot1Turn ? prompt1 : prompt2

            // Build context from previous messages
            let contextPrompt = `Topic: ${topic}\n\n`

            if (conversationHistory.length > 0) {
              contextPrompt += "Recent conversation:\n"
              conversationHistory.slice(-4).forEach((msg, index) => {
                const speakerName = msg.speaker === "bot1" ? leader1.name : leader2.name
                contextPrompt += `${speakerName}: ${msg.content}\n`
              })
              contextPrompt += "\nYour turn to respond. Keep it conversational and punchy - react to what they just said:"
            } else {
              contextPrompt += "Start the conversation with your opening thoughts. Keep it brief and conversational:"
            }

            const { text } = await generateText({
              model: google("gemini-2.0-flash"),
              system: systemPrompt,
              prompt: contextPrompt,
              maxTokens: 80,
              temperature: 0.8,
            })

            // Add to conversation history
            conversationHistory.push({
              speaker: currentBot,
              content: text,
            })

            // Send the message
            const data = JSON.stringify({
              type: "message",
              speaker: currentBot,
              content: text,
              round: round,
            })

            controller.enqueue(encoder.encode(`data: ${data}\n\n`))

            // Add a small delay between messages for better UX
            await new Promise((resolve) => setTimeout(resolve, 800))
          }

          // Generate conclusion
          const conclusionPrompt = `Based on this debate about "${topic}", provide a balanced conclusion that:
1. Summarizes the key points from both sides
2. Identifies areas of common ground
3. Acknowledges the complexity of the issue
4. Suggests a nuanced perspective that considers both viewpoints

Previous debate:
${conversationHistory
  .map((msg, index) => {
    const speakerName = msg.speaker === "bot1" ? leader1.name : leader2.name
    return `${speakerName}: ${msg.content}`
  })
  .join("\n")}`

          const { text: conclusion } = await generateText({
            model: google("gemini-2.0-flash"),
            system:
              "You are an impartial moderator providing a balanced conclusion to a debate. Be objective, thoughtful, and acknowledge the merits of different perspectives.",
            prompt: conclusionPrompt,
            maxTokens: 200,
            temperature: 0.5,
          })

          // Send conclusion
          const conclusionData = JSON.stringify({
            type: "conclusion",
            content: conclusion,
          })
          controller.enqueue(encoder.encode(`data: ${conclusionData}\n\n`))

          // Send completion signal
          const completeData = JSON.stringify({ type: "complete" })
          controller.enqueue(encoder.encode(`data: ${completeData}\n\n`))

          controller.close()
        } catch (error) {
          console.error("Error in debate stream:", error)
          const errorData = JSON.stringify({
            type: "error",
            message: "An error occurred during the debate",
          })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Error starting debate:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
