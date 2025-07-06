import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { writeFileSync, readFileSync } from "fs"
import { join } from "path"
import wav from "wav"
import FormData from "form-data"
import {Blob} from "fetch-blob"

async function saveWaveFile(
  filename: string,
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2,
) {
  return new Promise((resolve, reject) => {
    const writer = new wav.FileWriter(filename, {
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    })
    writer.on("finish", resolve)
    writer.on("error", reject)
    writer.write(pcmData)
    writer.end()
  })
}

export async function POST(request: NextRequest) {
  try {
    const { debateData, leader1Voice, leader2Voice } = await request.json()

    // Initialize Gemini AI with correct import
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! })

    // Create podcast script with natural conversation flow
    let podcastScript = `Welcome to Historical Debates Podcast. Today we present a debate between ${leader1Voice} and ${leader2Voice} on the topic: ${debateData.topic}.`

    // Add dialogue alternating between speakers
    const dialogue = debateData.dialogue
    const leader1Messages = dialogue[leader1Voice] || []
    const leader2Messages = dialogue[leader2Voice] || []

    // Interleave messages from both leaders
    const maxLength = Math.max(leader1Messages.length, leader2Messages.length)

    for (let i = 0; i < maxLength; i++) {
      if (i < leader1Messages.length) {
        podcastScript += ` ${leader1Voice} says: ${leader1Messages[i]}`
      }
      if (i < leader2Messages.length) {
        podcastScript += ` ${leader2Voice} responds: ${leader2Messages[i]}`
      }
    }

    if (debateData.conclusion) {
      podcastScript += ` In conclusion: ${debateData.conclusion}`
    }

    podcastScript += " Thank you for listening to Historical Debates Podcast."

    // Generate audio using Gemini 2.5 Flash TTS with correct syntax
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [
        {
          parts: [
            {
              text: `Convert this debate transcript into a high-quality podcast audio with distinct voices for each speaker. Use appropriate pacing, intonation, and emphasis to make it engaging:

${podcastScript}

Instructions:
- Use a professional narrator voice for introductions and conclusions
- Give ${leader1Voice} a voice that matches their historical character and speaking style
- Give ${leader2Voice} a voice that matches their historical character and speaking style  
- Add appropriate pauses between speakers
- Use natural speech patterns and emphasis
- Make it sound like a real podcast conversation`,
            },
          ],
        },
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          multiSpeakerVoiceConfig:{
            speakerVoiceConfigs: [
              {
                speaker: leader1Voice,
                voiceConfig: {
                        prebuiltVoiceConfig: {voiceName: "Orus"},
                     }
              },
              {
                speaker: leader2Voice,
                voiceConfig: {
                        prebuiltVoiceConfig: {voiceName: "Algieba"},
                    }
              },
            ],
          }
        },
      },
    })

    // Extract audio data from the response
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data

    if (!audioData) {
      throw new Error("No audio data generated from Gemini TTS")
    }

    // Convert base64 audio data to buffer (Gemini returns PCM/WAV data)
    const audioBuffer = Buffer.from(audioData, "base64")

    // Save file to public folder first
    const filename = `debate-podcast-${Date.now()}.wav`
    const filePath = join(process.cwd(), "public", filename)

    // Use the proper WAV file writer
    await saveWaveFile(filePath, audioBuffer)

    // Return the public URL for the file
    const publicUrl = `/${filename}`
return NextResponse.json({
      success: true,
      filename: filename,
      publicUrl: publicUrl,
})
    // Also upload to Pinata for permanent storage
    let pinataResult = null
    try {
      // Read the saved WAV file for Pinata upload
      console.log("Reading WAV file for Pinata upload:", filePath)
      const wavFileBuffer = readFileSync(filePath)
      
      // Upload to Pinata using API Key and Secret
      const formData = new FormData()
      const pinataFilename = `debate-podcast-${debateData.participants.join("-vs-").replace(/\s+/g, "-")}-${Date.now()}.wav`
      const audioBlob = new Blob([wavFileBuffer], { type: "audio/wav" })
      formData.append("file", audioBlob, pinataFilename)

      // Add metadata for the audio file
      const metadata = JSON.stringify({
        name: `Podcast: ${debateData.topic}`,
        keyvalues: {
          type: "debate-podcast",
          participants: debateData.participants.join(", "),
          topic: debateData.topic,
          date: new Date().toISOString().split("T")[0],
          format: "wav",
          generated_by: "gemini-2.5-flash-tts",
          voice_model: "Kore",
        },
      })
      formData.append("pinataMetadata", metadata)

      const pinataOptions = JSON.stringify({
        cidVersion: 0,
      })
      formData.append("pinataOptions", pinataOptions)

      const pinataResponse = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          pinata_api_key: process.env.PINATA_API_KEY!,
          pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY!,
        },
        body: formData,
      })

      if (pinataResponse.ok) {
        pinataResult = await pinataResponse.json()
        console.log("Successfully uploaded to Pinata:", pinataResult.IpfsHash)
      } else {
        const errorText = await pinataResponse.text()
        console.error("Pinata upload failed:", errorText)
      }
    } catch (pinataError) {
      console.error("Pinata upload error:", pinataError)
      // Don't fail the entire request if Pinata fails
    }

    return NextResponse.json({
      success: true,
      filename: filename,
      publicUrl: publicUrl,
      audioSize: audioBuffer.length,
      format: "wav",
      localPath: filePath,
      // Include Pinata info if upload was successful
      ...(pinataResult && {
        pinata: {
          ipfsHash: pinataResult.IpfsHash,
          pinataUrl: `https://gateway.pinata.cloud/ipfs/${pinataResult.IpfsHash}`,
          timestamp: pinataResult.Timestamp,
        },
      }),
    })
  } catch (error: any) {
    console.error("Error generating podcast:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to generate podcast",
        details: error.stack,
      },
      { status: 500 },
    )
  }
}
