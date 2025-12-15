import { NextResponse } from "next/server"
import sql, { getUserByWallet, createUser } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("wallet")

    if (walletAddress) {
      const user = await getUserByWallet(walletAddress)
      return NextResponse.json({ user })
    }

    // Get all users
    const users = await sql`SELECT * FROM users ORDER BY created_at DESC`
    return NextResponse.json({ users })
  } catch (error) {
    console.error("[v0] Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { wallet_address, name, email, role } = body

    if (!wallet_address || !name || !email || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUserByWallet(wallet_address)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Generate user ID
    const userId = `${role}-${Date.now()}-${Math.random().toString(36).substring(7)}`

    const user = await createUser({
      id: userId,
      wallet_address,
      name,
      email,
      role,
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
