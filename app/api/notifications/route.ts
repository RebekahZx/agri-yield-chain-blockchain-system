import { NextResponse } from "next/server"
import { getNotificationsByUser, markNotificationAsRead } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json({ error: "Missing user_id parameter" }, { status: 400 })
    }

    const notifications = await getNotificationsByUser(userId)
    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("[v0] Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { notification_id } = body

    if (!notification_id) {
      return NextResponse.json({ error: "Missing notification_id" }, { status: 400 })
    }

    await markNotificationAsRead(Number.parseInt(notification_id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error marking notification as read:", error)
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
  }
}
