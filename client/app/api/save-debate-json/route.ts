import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const debateData = await request.json()

    // Create a formatted JSON file with better structure
    const formattedDebateData = {
      metadata: {
        topic: debateData.topic,
        participants: debateData.participants,
        timestamp: debateData.timestamp,
        totalMessages: Object.values(debateData.dialogue).flat().length,
      },
      dialogue: debateData.dialogue,
      conclusion: debateData.conclusion,
      format_version: "1.0",
    }

    const jsonContent = JSON.stringify(formattedDebateData, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json" })

    // Upload to Pinata using API Key and Secret
    const formData = new FormData()
    const filename = `debate-${debateData.participants.join("-vs-").replace(/\s+/g, "-")}-${Date.now()}.json`
    formData.append("file", blob, filename)

    // Add metadata for better organization on Pinata
    const metadata = JSON.stringify({
      name: `Debate: ${debateData.topic}`,
      keyvalues: {
        type: "debate-transcript",
        participants: debateData.participants.join(", "),
        
        topic: debateData.topic,
        date: new Date().toISOString().split("T")[0],
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

    if (!pinataResponse.ok) {
      const errorText = await pinataResponse.text()
      console.error("Pinata upload error:", errorText)
      throw new Error(`Failed to upload to Pinata: ${pinataResponse.status} ${pinataResponse.statusText}`)
    }

    const pinataResult = await pinataResponse.json()

    return NextResponse.json({
      success: true,
      ipfsHash: pinataResult.IpfsHash,
      pinataUrl: `https://gateway.pinata.cloud/ipfs/${pinataResult.IpfsHash}`,
      filename: filename,
      size: jsonContent.length,
    })
  } catch (error: any) {
    console.error("Error saving debate JSON:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to save debate JSON",
        details: error.stack,
      },
      { status: 500 },
    )
  }
}
