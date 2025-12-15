"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Sprout,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  Calendar,
  Package,
} from "lucide-react"
import type { YieldRecord } from "@/lib/db"

export default function YieldDetailPage() {
  const params = useParams()
  const router = useRouter()
  const yieldId = params.id as string

  const [yieldRecord, setYieldRecord] = useState<YieldRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchYieldRecord()
  }, [yieldId])

  async function fetchYieldRecord() {
    try {
      const response = await fetch(`/api/yields?limit=1000`)
      const data = await response.json()
      const record = data.yields?.find((y: YieldRecord) => y.id.toString() === yieldId)

      if (!record) {
        setError("Yield record not found")
        return
      }

      setYieldRecord(record)
    } catch (error) {
      console.error("[v0] Error fetching yield record:", error)
      setError("Failed to load yield record")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading yield details...</p>
        </div>
      </div>
    )
  }

  if (error || !yieldRecord) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
              <XCircle className="h-8 w-8" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Record Not Found</h2>
            <p className="text-muted-foreground">{error || "This yield record does not exist"}</p>
          </div>
          <Link href="/explorer">
            <Button className="w-full">Back to Explorer</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/explorer" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-balance">AgriYieldChain</h1>
              <p className="text-xs text-muted-foreground">Yield Details</p>
            </div>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <Link href="/explorer">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Explorer
            </Button>
          </Link>

          {/* Header Card */}
          <Card className="p-8">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold">{yieldRecord.crop_type} Yield Record</h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    {yieldRecord.status === "verified" ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verified
                      </Badge>
                    ) : yieldRecord.status === "pending" ? (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                        <Clock className="h-4 w-4 mr-1" />
                        Pending Verification
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 border-red-200">
                        <XCircle className="h-4 w-4 mr-1" />
                        Rejected
                      </Badge>
                    )}
                    {yieldRecord.blockchain_id && (
                      <Badge variant="outline" className="font-mono">
                        Blockchain ID: #{yieldRecord.blockchain_id}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-6 border-t">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Package className="h-4 w-4" />
                    <span>Quantity</span>
                  </div>
                  <p className="text-2xl font-bold">{yieldRecord.quantity.toLocaleString()} kg</p>
                  <p className="text-sm text-muted-foreground">({(yieldRecord.quantity / 1000).toFixed(2)} tonnes)</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Harvest Date</span>
                  </div>
                  <p className="text-2xl font-bold">{new Date(yieldRecord.harvest_date).toLocaleDateString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(yieldRecord.harvest_date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>Location</span>
                  </div>
                  <p className="text-xl font-semibold">{yieldRecord.location}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Submission Date</span>
                  </div>
                  <p className="text-xl font-semibold">{new Date(yieldRecord.submitted_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Blockchain Information */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Blockchain Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Farmer Wallet Address</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-3 py-2 rounded font-mono text-sm break-all">
                    {yieldRecord.farmer_wallet}
                  </code>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {yieldRecord.verifier_wallet && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Verifier Wallet Address</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted px-3 py-2 rounded font-mono text-sm break-all">
                      {yieldRecord.verifier_wallet}
                    </code>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {yieldRecord.transaction_hash && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Transaction Hash</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted px-3 py-2 rounded font-mono text-sm break-all">
                      {yieldRecord.transaction_hash}
                    </code>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {yieldRecord.blockchain_id && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Blockchain Record ID</p>
                  <p className="bg-muted px-3 py-2 rounded font-mono text-sm">{yieldRecord.blockchain_id}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Verification Details */}
          {yieldRecord.status !== "pending" && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Verification Details</h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <p className="text-lg font-semibold capitalize">{yieldRecord.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Verification Date</p>
                    <p className="text-lg font-semibold">
                      {yieldRecord.verified_at ? new Date(yieldRecord.verified_at).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>

                {yieldRecord.remarks && (
                  <div
                    className={`p-4 rounded-lg ${yieldRecord.status === "verified" ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}
                  >
                    <p
                      className={`text-sm font-medium mb-2 ${yieldRecord.status === "verified" ? "text-emerald-700" : "text-red-700"}`}
                    >
                      Verifier Remarks
                    </p>
                    <p className={`text-sm ${yieldRecord.status === "verified" ? "text-emerald-900" : "text-red-900"}`}>
                      {yieldRecord.remarks}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Supporting Documents */}
          {yieldRecord.ipfs_hash && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Supporting Documents</h3>
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <p className="font-medium">IPFS Stored Documents</p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Documents are stored on IPFS for permanent, decentralized access
                    </p>
                    <code className="text-xs font-mono bg-background px-2 py-1 rounded break-all">
                      {yieldRecord.ipfs_hash}
                    </code>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on IPFS
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Timeline */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6">Timeline</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="w-px h-full bg-border mt-2"></div>
                </div>
                <div className="flex-1 pb-8">
                  <p className="font-semibold">Harvest Completed</p>
                  <p className="text-sm text-muted-foreground">{new Date(yieldRecord.harvest_date).toLocaleString()}</p>
                  <p className="text-sm mt-1">Crop harvested from {yieldRecord.location}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  {yieldRecord.status !== "pending" && <div className="w-px h-full bg-border mt-2"></div>}
                </div>
                <div className={yieldRecord.status !== "pending" ? "flex-1 pb-8" : "flex-1"}>
                  <p className="font-semibold">Submitted to Blockchain</p>
                  <p className="text-sm text-muted-foreground">{new Date(yieldRecord.submitted_at).toLocaleString()}</p>
                  <p className="text-sm mt-1">Recorded on blockchain with ID #{yieldRecord.blockchain_id}</p>
                </div>
              </div>

              {yieldRecord.status !== "pending" && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${yieldRecord.status === "verified" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                    >
                      {yieldRecord.status === "verified" ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {yieldRecord.status === "verified" ? "Verified & Approved" : "Rejected"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {yieldRecord.verified_at ? new Date(yieldRecord.verified_at).toLocaleString() : "N/A"}
                    </p>
                    <p className="text-sm mt-1">Reviewed by authorized verifier</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
