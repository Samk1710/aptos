import { google } from "@ai-sdk/google"
import { streamText } from "ai"

interface Tool {
    name: keyof typeof toolRegistry;
    tool: string;
  }
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages,prompt,array_tools,wallet_address,wallet_balance,temparature,top_k,model } = await req.json()
  console.log(temparature,top_k,model)

  const tools = Object.fromEntries(
      array_tools.map(({ name }: Tool) => [name, toolRegistry[name]])
    );
   
  const result = streamText({
    model: google(model),
    system: prompt+`if some one asks about thier wallet adress ,the adress is ${wallet_address} and the balance is ${wallet_balance}`,
    messages,
    
    temperature: temparature,
    topK: top_k,
    tools: tools,
    
    maxSteps: 5,
     // Allow multiple tool calls in a single conversation turn
  })

  return result.toDataStreamResponse()
}
