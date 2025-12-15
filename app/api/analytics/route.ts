import { NextResponse } from "next/server"
import { getAnalyticsSummary } from "@/lib/db"
import sql from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (type === "summary") {
      const summary = await getAnalyticsSummary()
      return NextResponse.json({ summary })
    }

    if (type === "crop-distribution") {
      const distribution = await sql`
        SELECT crop_type, COUNT(*) as count, SUM(quantity) as total_quantity
        FROM yield_records
        WHERE status = 'verified'
        GROUP BY crop_type
        ORDER BY total_quantity DESC
      `
      return NextResponse.json({ distribution })
    }

    if (type === "monthly-trends") {
      const trends = await sql`
        SELECT 
          DATE_TRUNC('month', submitted_at) as month,
          COUNT(*) as total_submissions,
          COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified_count,
          SUM(CASE WHEN status = 'verified' THEN quantity ELSE 0 END) as verified_quantity
        FROM yield_records
        GROUP BY DATE_TRUNC('month', submitted_at)
        ORDER BY month DESC
        LIMIT 12
      `
      return NextResponse.json({ trends })
    }

    // Default: return summary
    const summary = await getAnalyticsSummary()
    return NextResponse.json({ summary })
  } catch (error) {
    console.error("[v0] Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
