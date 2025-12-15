import { NextResponse } from "next/server"
import { getYieldRecordById, updateYieldRecordStatus, getUserByWallet, createNotification } from "@/lib/db"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const yieldId = Number.parseInt(params.id)
    const body = await request.json()
    const { verifier_wallet, status, remarks, transaction_hash } = body

    if (!verifier_wallet || !status || !remarks) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (status !== "verified" && status !== "rejected") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Get verifier user
    const verifier = await getUserByWallet(verifier_wallet)
    if (!verifier) {
      return NextResponse.json({ error: "Verifier not found" }, { status: 404 })
    }

    if (verifier.role !== "verifier") {
      return NextResponse.json({ error: "User is not a verifier" }, { status: 403 })
    }

    // Get yield record
    const yieldRecord = await getYieldRecordById(yieldId)
    if (!yieldRecord) {
      return NextResponse.json({ error: "Yield record not found" }, { status: 404 })
    }

    if (yieldRecord.status !== "pending") {
      return NextResponse.json({ error: "Yield record already processed" }, { status: 400 })
    }

    // Update yield record
    const updatedYield = await updateYieldRecordStatus(
      yieldId,
      status,
      verifier.id,
      verifier_wallet,
      remarks,
      transaction_hash,
    )

    // Create notification for farmer
    await createNotification({
      user_id: yieldRecord.farmer_id,
      title: status === "verified" ? "Yield Verified" : "Yield Rejected",
      message:
        status === "verified"
          ? `Your ${yieldRecord.crop_type} yield submission has been verified.`
          : `Your ${yieldRecord.crop_type} yield submission has been rejected. Reason: ${remarks}`,
      type: status === "verified" ? "success" : "error",
      related_yield_id: yieldId,
    })

    return NextResponse.json({ yield: updatedYield })
  } catch (error) {
    console.error("[v0] Error verifying yield record:", error)
    return NextResponse.json({ error: "Failed to verify yield record" }, { status: 500 })
  }
}
