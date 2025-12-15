"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, TrendingUp, FileCheck } from "lucide-react"
import { getConnectedAddress } from "@/lib/blockchain"
import type { User, YieldRecord } from "@/lib/db"
import { Navigation } from "@/components/navigation"

export default function VerifierDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [pendingYields, setPendingYields] = useState<YieldRecord[]>([])
  const [processedYields, setProcessedYields] = useState<YieldRecord[]>([])
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    rejected: 0,
    totalProcessed: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"pending" | "processed">("pending")

  useEffect(() => {
    initializeDashboard()
  }, [])

  async function initializeDashboard() {
    try {
      const address = await getConnectedAddress()
      if (!address) {
        router.push("/auth")
        return
      }

      // Fetch user data
      const userResponse = await fetch(`/api/users?wallet=${address}`)
      const userData = await userResponse.json()

      if (!userData.user || userData.user.role !== "verifier") {
        router.push("/auth")
        return
      }

      setUser(userData.user)

      // Fetch pending yields
      const pendingResponse = await fetch("/api/yields?status=pending")
      const pendingData = await pendingResponse.json()
      setPendingYields(pendingData.yields || [])

      // Fetch all yields to show processed ones by this verifier
      const allResponse = await fetch("/api/yields?limit=100")
      const allData = await allResponse.json()
      const processed =
        allData.yields?.filter((y: YieldRecord) => y.verifier_id === userData.user.id && y.status !== "pending") || []
      setProcessedYields(processed)

      // Calculate stats
      setStats({
        pending: pendingData.yields?.length || 0,
        verified: processed.filter((y: YieldRecord) => y.status === "verified").length,
        rejected: processed.filter((y: YieldRecord) => y.status === "rejected").length,
        totalProcessed: processed.length,
      })
    } catch (error) {
      console.error("[v0] Error initializing dashboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navigation />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold">Welcome, {user?.name}</h2>
          <p className="text-muted-foreground mt-1">Review and verify yield submissions from farmers</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.verified}</p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-700">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rejected}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalProcessed}</p>
                <p className="text-xs text-muted-foreground">Total Processed</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("pending")}
              className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                activeTab === "pending"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Pending Review ({stats.pending})
            </button>
            <button
              onClick={() => setActiveTab("processed")}
              className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
                activeTab === "processed"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Processed ({stats.totalProcessed})
            </button>
          </div>
        </div>

        {/* Pending Yields */}
        {activeTab === "pending" && (
          <div>
            {pendingYields.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <FileCheck className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <h4 className="text-xl font-semibold mb-2">No pending submissions</h4>
                <p className="text-muted-foreground">All yields have been reviewed</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingYields.map((yieldRecord) => (
                  <Card key={yieldRecord.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h4 className="text-lg font-semibold">{yieldRecord.crop_type}</h4>
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                          {yieldRecord.blockchain_id && (
                            <Badge variant="outline" className="font-mono text-xs">
                              #{yieldRecord.blockchain_id}
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Farmer</p>
                            <p className="font-medium font-mono text-xs">
                              {yieldRecord.farmer_wallet.slice(0, 10)}...{yieldRecord.farmer_wallet.slice(-8)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Quantity</p>
                            <p className="font-medium">{yieldRecord.quantity.toLocaleString()} kg</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Harvest Date</p>
                            <p className="font-medium">{new Date(yieldRecord.harvest_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Location</p>
                            <p className="font-medium">{yieldRecord.location}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Submitted</p>
                            <p className="font-medium">{new Date(yieldRecord.submitted_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Documents</p>
                            <p className="font-medium">{yieldRecord.ipfs_hash ? "Available" : "None"}</p>
                          </div>
                        </div>

                        {yieldRecord.ipfs_hash && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs font-medium text-muted-foreground mb-1">IPFS Hash</p>
                            <code className="text-xs font-mono break-all">{yieldRecord.ipfs_hash}</code>
                          </div>
                        )}
                      </div>

                      <div className="flex lg:flex-col gap-2 shrink-0">
                        <Link href={`/dashboard/verifier/review/${yieldRecord.id}`} className="flex-1 lg:flex-none">
                          <Button className="w-full">Review & Verify</Button>
                        </Link>
                        {yieldRecord.ipfs_hash && (
                          <Button variant="outline" size="sm" className="flex-1 lg:flex-none bg-transparent">
                            View Documents
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Processed Yields */}
        {activeTab === "processed" && (
          <div>
            {processedYields.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <FileCheck className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <h4 className="text-xl font-semibold mb-2">No processed submissions yet</h4>
                <p className="text-muted-foreground">Start reviewing pending yields</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {processedYields.map((yieldRecord) => (
                  <Card key={yieldRecord.id} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h4 className="text-lg font-semibold">{yieldRecord.crop_type}</h4>
                          {yieldRecord.status === "verified" ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              <XCircle className="h-3 w-3 mr-1" />
                              Rejected
                            </Badge>
                          )}
                          {yieldRecord.blockchain_id && (
                            <Badge variant="outline" className="font-mono text-xs">
                              #{yieldRecord.blockchain_id}
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Quantity</p>
                            <p className="font-medium">{yieldRecord.quantity.toLocaleString()} kg</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Harvest Date</p>
                            <p className="font-medium">{new Date(yieldRecord.harvest_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Verified</p>
                            <p className="font-medium">
                              {yieldRecord.verified_at ? new Date(yieldRecord.verified_at).toLocaleDateString() : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Location</p>
                            <p className="font-medium">{yieldRecord.location}</p>
                          </div>
                        </div>

                        {yieldRecord.remarks && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Your Remarks</p>
                            <p className="text-sm">{yieldRecord.remarks}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
