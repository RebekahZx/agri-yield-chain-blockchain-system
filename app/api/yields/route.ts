import { NextResponse } from "next/server"
import {
  getAllYieldRecords,
  getYieldRecordsByFarmer,
  getPendingYieldRecords,
  createYieldRecord,
  getUserByWallet,
} from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const farmerId = searchParams.get("farmer_id")
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    if (farmerId) {
      const yields = await getYieldRecordsByFarmer(farmerId)
      return NextResponse.json({ yields })
    }

    if (status === "pending") {
      const yields = await getPendingYieldRecords()
      return NextResponse.json({ yields })
    }

    const yields = await getAllYieldRecords(limit)
    return NextResponse.json({ yields })
  } catch (error) {
    console.error("[v0] Error fetching yield records:", error)
    return NextResponse.json({ error: "Failed to fetch yield records" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { farmer_wallet, crop_type, quantity, harvest_date, location, ipfs_hash, blockchain_id, transaction_hash } =
      body

    if (!farmer_wallet || !crop_type || !quantity || !harvest_date || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get farmer user
    const farmer = await getUserByWallet(farmer_wallet)
    if (!farmer) {
      return NextResponse.json({ error: "Farmer not found" }, { status: 404 })
    }

    if (farmer.role !== "farmer") {
      return NextResponse.json({ error: "User is not a farmer" }, { status: 403 })
    }

    const yieldRecord = await createYieldRecord({
      farmer_id: farmer.id,
      farmer_wallet,
      crop_type,
      quantity: Number.parseInt(quantity),
      harvest_date: new Date(harvest_date),
      location,
      ipfs_hash,
      blockchain_id: blockchain_id ? Number.parseInt(blockchain_id) : undefined,
      transaction_hash,
    })

    return NextResponse.json({ yield: yieldRecord }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating yield record:", error)
    return NextResponse.json({ error: "Failed to create yield record" }, { status: 500 })
  }
}
