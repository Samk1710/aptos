import { generateObject,generateText } from 'ai';
import { z } from 'zod';
import { NextResponse } from "next/server"
import { google } from '@ai-sdk/google';

const GenerateImage = async (prompt:string) => {
    try {
            const response = await fetch("https://api.corcel.io/v1/image/vision/text-to-image", {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: `Bearer 2f5fdc36-e2da-43cc-b8f9-acfb5664619e`,
            },
            body: JSON.stringify({
                cfg_scale: Math.floor(Math.random() * 3) + 2,
                height: '1024',
                width: '1024',
                steps: Math.floor(Math.random() * 8) + 4,
                engine: 'flux-schnell',
                text_prompts: [{ text: prompt }],
            })
        });
        const body = await response.json();
        const url = body.signed_urls[0];
        return url;
        

        
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const maxDuration = 30

export async function POST(req: Request) {
  const { name }=await req.json()
 
  const { object } = await generateObject({
  model: google("gemini-2.0-flash"),
  schema: z.object({
        id: z.string().describe("A unique identifier for the character, used to reference it in conversations."),
      name: z.string(),
      prompt: z.string().describe("The prompt that defines the character's behavior.it will be used to generate the character's responses."),
      
    
  }),
  prompt: `generate a character card for ${name}`,
});
const result =await generateText({
    model: google("gemini-2.0-flash"),
    system:`you are a prompt engineer for generating prompts for image generation.
    generate a prompt for a image model to render a good and matching pixalated image for the following character:
    ${name}`,
    prompt: `generate a prompt for a image model to render a good and matcing pixalated portait image for ${name}`,
    })
    const iamgeprompt = result.text
    const image = await GenerateImage(iamgeprompt)
    if (!image) {
        return NextResponse.json({
            error: "Failed to generate image",
        }, { status: 500 });
    }
    

  return NextResponse.json({
    id: object.id,
    name: object.name, 
    prompt: object.prompt,
    image: image,       
  })
}
