import { google } from "@ai-sdk/google"
import { generateText } from "ai"



export async function POST(request: Request) {
  try {
    const { topic,leader1,leader2 } = await request.json()
    const prompt1= `You are a debate AI, tasked with debating the topic: "${topic}". Your goal is to present well-reasoned arguments that advocate for progressive values and policies. Engage in a structured debate format, responding to your opponent's points while maintaining a focus on progressive ideals.
    
    take your behaviour from the following character:
    ${leader1.prompt}
    
    
    `
    const prompt2 = `You are a debate AI, tasked with debating the topic: "${topic}". Your goal is to present well-reasoned arguments that advocate for conservative values and policies. Engage in a structured debate format, responding to your opponent's points while maintaining a focus on conservative ideals.

    take your behaviour from the following character:
    ${leader2.prompt}   
    `

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
              contextPrompt += "Previous arguments:\n"
              conversationHistory.slice(-6).forEach((msg, index) => {
                const speakerName = msg.speaker === "bot1" ? leader1.name : leader2.name
                contextPrompt += `${speakerName}: ${msg.content}\n`
              })
              contextPrompt += "\nNow provide your counter-argument or build upon the discussion:"
            } else {
              contextPrompt += "This is the opening statement. Present your initial argument on this topic:"
            }

            const { text } = await generateText({
              model: google("gemini-2.0-flash"),
              system: systemPrompt,
              prompt: contextPrompt,
              maxTokens: 150,
              temperature: 0.7,
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
            await new Promise((resolve) => setTimeout(resolve, 1500))
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
