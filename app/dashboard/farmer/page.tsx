"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sprout, Plus, TrendingUp, Clock, CheckCircle, XCircle, Package } from "lucide-react"
import { getConnectedAddress } from "@/lib/blockchain"
import { WalletConnect } from "@/components/wallet-connect"
import { Navigation } from "@/components/navigation"
import type { User, YieldRecord } from "@/lib/db"

export default function FarmerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [yields, setYields] = useState<YieldRecord[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
    totalQuantity: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

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

      setWalletAddress(address)

      // Fetch user data
      const userResponse = await fetch(`/api/users?wallet=${address}`)
      const userData = await userResponse.json()

      if (!userData.user || userData.user.role !== "farmer") {
        router.push("/auth")
        return
      }

      setUser(userData.user)

      // Fetch yields
      const yieldsResponse = await fetch(`/api/yields?farmer_id=${userData.user.id}`)
      const yieldsData = await yieldsResponse.json()

      setYields(yieldsData.yields || [])

      // Calculate stats
      const yieldsList = yieldsData.yields || []
      setStats({
        total: yieldsList.length,
        pending: yieldsList.filter((y: YieldRecord) => y.status === "pending").length,
        verified: yieldsList.filter((y: YieldRecord) => y.status === "verified").length,
        rejected: yieldsList.filter((y: YieldRecord) => y.status === "rejected").length,
        totalQuantity: yieldsList
          .filter((y: YieldRecord) => y.status === "verified")
          .reduce((sum: number, y: YieldRecord) => sum + y.quantity, 0),
      })
    } catch (error) {
      console.error("[v0] Error initializing dashboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "verified":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
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
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sprout className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-balance">AgriYieldChain</h1>
                <p className="text-xs text-muted-foreground">Farmer Dashboard</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/explorer">
                <Button variant="outline" size="sm">
                  Explorer
                </Button>
              </Link>
              <WalletConnect />
            </div>
          </div>
        </header>

        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Welcome back, {user?.name}</h2>
            <p className="text-muted-foreground mt-1">Manage your yield submissions and track verification status</p>
          </div>
          <Link href="/dashboard/farmer/submit">
            <Button size="lg" className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Submit New Yield
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Yields</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
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
                <p className="text-2xl font-bold">{(stats.totalQuantity / 1000).toFixed(1)}t</p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Yields */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold">Your Yield Submissions</h3>
          </div>

          {yields.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <h4 className="text-xl font-semibold mb-2">No yields submitted yet</h4>
              <p className="text-muted-foreground mb-6">Start by submitting your first yield record</p>
              <Link href="/dashboard/farmer/submit">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Your First Yield
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {yields.map((yieldRecord) => (
                <Card key={yieldRecord.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="text-lg font-semibold">{yieldRecord.crop_type}</h4>
                        {getStatusBadge(yieldRecord.status)}
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
                          <p className="text-muted-foreground">Location</p>
                          <p className="font-medium">{yieldRecord.location}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Submitted</p>
                          <p className="font-medium">{new Date(yieldRecord.submitted_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {yieldRecord.remarks && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Verifier Remarks</p>
                          <p className="text-sm">{yieldRecord.remarks}</p>
                        </div>
                      )}

                      {yieldRecord.transaction_hash && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Transaction:</span>
                          <code className="bg-muted px-2 py-1 rounded font-mono">
                            {yieldRecord.transaction_hash.slice(0, 20)}...
                          </code>
                        </div>
                      )}
                    </div>

                    <div className="flex md:flex-col gap-2">
                      <Button variant="outline" size="sm" className="flex-1 md:flex-none bg-transparent">
                        View Details
                      </Button>
                      {yieldRecord.ipfs_hash && (
                        <Button variant="outline" size="sm" className="flex-1 md:flex-none bg-transparent">
                          View Docs
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
