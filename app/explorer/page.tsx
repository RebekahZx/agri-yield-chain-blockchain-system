"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, TrendingUp, Package, CheckCircle, BarChart3, Filter } from "lucide-react"
import { Navigation } from "@/components/navigation"
import type { YieldRecord } from "@/lib/db"

export default function ExplorerPage() {
  const [yields, setYields] = useState<YieldRecord[]>([])
  const [filteredYields, setFilteredYields] = useState<YieldRecord[]>([])
  const [analytics, setAnalytics] = useState({
    totalYields: 0,
    verifiedYields: 0,
    pendingYields: 0,
    totalQuantity: 0,
    totalFarmers: 0,
    totalVerifiers: 0,
  })
  const [cropDistribution, setCropDistribution] = useState<
    Array<{ crop_type: string; count: number; total_quantity: number }>
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "pending">("all")
  const [cropFilter, setCropFilter] = useState<string>("all")

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterYields()
  }, [yields, searchQuery, statusFilter, cropFilter])

  async function fetchData() {
    try {
      const yieldsResponse = await fetch("/api/yields?limit=100")
      const yieldsData = await yieldsResponse.json()
      setYields(yieldsData.yields || [])

      const analyticsResponse = await fetch("/api/analytics?type=summary")
      const analyticsData = await analyticsResponse.json()
      setAnalytics(analyticsData.summary)

      const distributionResponse = await fetch("/api/analytics?type=crop-distribution")
      const distributionData = await distributionResponse.json()
      setCropDistribution(distributionData.distribution || [])
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  function filterYields() {
    let filtered = [...yields]

    if (statusFilter !== "all") {
      filtered = filtered.filter((y) => y.status === statusFilter)
    }

    if (cropFilter !== "all") {
      filtered = filtered.filter((y) => y.crop_type === cropFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (y) =>
          y.crop_type.toLowerCase().includes(query) ||
          y.location.toLowerCase().includes(query) ||
          y.farmer_wallet.toLowerCase().includes(query) ||
          (y.blockchain_id && y.blockchain_id.toString().includes(query)),
      )
    }

    setFilteredYields(filtered)
  }

  const uniqueCropTypes = Array.from(new Set(yields.map((y) => y.crop_type)))

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading explorer data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navigation />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <h2 className="text-4xl font-bold text-balance">Explore Verified Agricultural Data</h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto leading-relaxed">
            Access transparent, blockchain-verified yield records from farmers worldwide
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="p-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4" />
                <span className="text-xs font-medium">Total Yields</span>
              </div>
              <p className="text-3xl font-bold">{analytics.totalYields}</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-xs font-medium">Verified</span>
              </div>
              <p className="text-3xl font-bold text-emerald-600">{analytics.verifiedYields}</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-600">
                <Package className="h-4 w-4" />
                <span className="text-xs font-medium">Pending</span>
              </div>
              <p className="text-3xl font-bold text-amber-600">{analytics.pendingYields}</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Total Verified</span>
              </div>
              <p className="text-3xl font-bold">{(analytics.totalQuantity / 1000000).toFixed(1)}M kg</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4" />
                <span className="text-xs font-medium">Farmers</span>
              </div>
              <p className="text-3xl font-bold">{analytics.totalFarmers}</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="h-4 w-4" />
                <span className="text-xs font-medium">Verifiers</span>
              </div>
              <p className="text-3xl font-bold">{analytics.totalVerifiers}</p>
            </div>
          </Card>
        </div>

        {/* Crop Distribution */}
        {cropDistribution.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Crop Distribution</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {cropDistribution.slice(0, 8).map((crop) => (
                <div key={crop.crop_type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{crop.crop_type}</span>
                    <Badge variant="outline">{crop.count} records</Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${(Number(crop.total_quantity) / analytics.totalQuantity) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {(Number(crop.total_quantity) / 1000).toFixed(1)}t verified
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Search & Filter</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by crop, location, wallet, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified Only</option>
                <option value="pending">Pending Only</option>
              </select>

              <select
                value={cropFilter}
                onChange={(e) => setCropFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="all">All Crops</option>
                {uniqueCropTypes.map((crop) => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {filteredYields.length} of {yields.length} records
              </span>
              {(searchQuery || statusFilter !== "all" || cropFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setStatusFilter("all")
                    setCropFilter("all")
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Yield Records */}
        <div>
          <h3 className="text-2xl font-bold mb-4">Yield Records</h3>
          {filteredYields.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <h4 className="text-xl font-semibold mb-2">No records found</h4>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredYields.map((yieldRecord) => (
                <Card key={yieldRecord.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="text-lg font-semibold">{yieldRecord.crop_type}</h4>
                        {yieldRecord.status === "verified" ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : yieldRecord.status === "pending" ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Pending
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Rejected
                          </Badge>
                        )}
                        {yieldRecord.blockchain_id && (
                          <Badge variant="outline" className="font-mono text-xs">
                            Blockchain #{yieldRecord.blockchain_id}
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

                      <div className="flex flex-wrap gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Farmer: </span>
                          <code className="font-mono bg-muted px-2 py-1 rounded">
                            {yieldRecord.farmer_wallet.slice(0, 10)}...{yieldRecord.farmer_wallet.slice(-8)}
                          </code>
                        </div>
                        {yieldRecord.verifier_wallet && (
                          <div>
                            <span className="text-muted-foreground">Verifier: </span>
                            <code className="font-mono bg-muted px-2 py-1 rounded">
                              {yieldRecord.verifier_wallet.slice(0, 10)}...{yieldRecord.verifier_wallet.slice(-8)}
                            </code>
                          </div>
                        )}
                        {yieldRecord.transaction_hash && (
                          <div>
                            <span className="text-muted-foreground">TX: </span>
                            <code className="font-mono bg-muted px-2 py-1 rounded">
                              {yieldRecord.transaction_hash.slice(0, 10)}...
                            </code>
                          </div>
                        )}
                      </div>

                      {yieldRecord.remarks && yieldRecord.status === "verified" && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <p className="text-xs font-medium text-emerald-700 mb-1">Verification Notes</p>
                          <p className="text-sm text-emerald-900">{yieldRecord.remarks}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex lg:flex-col gap-2 shrink-0">
                      <Link href={`/explorer/${yieldRecord.id}`} className="flex-1 lg:flex-none">
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          View Details
                        </Button>
                      </Link>
                      {yieldRecord.ipfs_hash && (
                        <Button variant="outline" size="sm" className="flex-1 lg:flex-none bg-transparent">
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
