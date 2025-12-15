import { NextResponse } from "next/server"
import { uploadToIPFS } from "@/lib/ipfs"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    // Validate files
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: `File ${file.name} exceeds 10MB limit` }, { status: 400 })
      }
    }

    // Upload to IPFS
    const results = await uploadToIPFS(files)

    return NextResponse.json({ results })
  } catch (error) {
    console.error("[v0] Error uploading to IPFS:", error)
    return NextResponse.json({ error: "Failed to upload files to IPFS" }, { status: 500 })
  }
}
