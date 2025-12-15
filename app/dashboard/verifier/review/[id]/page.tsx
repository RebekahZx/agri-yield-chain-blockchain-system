"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Sprout, ArrowLeft, CheckCircle, XCircle, AlertCircle, FileText } from "lucide-react"
import { getConnectedAddress, getSigner, getContract, YieldStatus } from "@/lib/blockchain"
import type { User, YieldRecord } from "@/lib/db"

export default function ReviewYieldPage() {
  const router = useRouter()
  const params = useParams()
  const yieldId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [yieldRecord, setYieldRecord] = useState<YieldRecord | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [remarks, setRemarks] = useState("")
  const [decision, setDecision] = useState<"verified" | "rejected" | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    initializePage()
  }, [yieldId])

  async function initializePage() {
    try {
      const address = await getConnectedAddress()
      if (!address) {
        router.push("/auth")
        return
      }

      setWalletAddress(address)

      const userResponse = await fetch(`/api/users?wallet=${address}`)
      const userData = await userResponse.json()

      if (!userData.user || userData.user.role !== "verifier") {
        router.push("/auth")
        return
      }

      setUser(userData.user)

      // Fetch yield record
      const yieldResponse = await fetch(`/api/yields?limit=1000`)
      const yieldData = await yieldResponse.json()
      const record = yieldData.yields?.find((y: YieldRecord) => y.id.toString() === yieldId)

      if (!record) {
        setError("Yield record not found")
        return
      }

      if (record.status !== "pending") {
        setError("This yield has already been processed")
      }

      setYieldRecord(record)
    } catch (error) {
      console.error("[v0] Error initializing page:", error)
      setError("Failed to load yield record")
    }
  }

  async function handleSubmitDecision(e: React.FormEvent) {
    e.preventDefault()

    if (!decision) {
      setError("Please select a decision")
      return
    }

    if (!remarks.trim()) {
      setError("Please provide remarks for your decision")
      return
    }

    setShowConfirm(true)
  }

  async function confirmDecision() {
    if (!walletAddress || !user || !yieldRecord || !decision) return

    setIsProcessing(true)
    setError(null)
    setShowConfirm(false)

    try {
      // Submit to blockchain
      const signer = await getSigner()
      const contract = getContract(signer)

      const blockchainId = yieldRecord.blockchain_id || 0
      const statusCode = decision === "verified" ? YieldStatus.Verified : YieldStatus.Rejected

      console.log("[v0] Submitting verification to blockchain...")
      const tx = await contract.verifyYield(blockchainId, statusCode, remarks)

      console.log("[v0] Waiting for transaction confirmation...")
      const receipt = await tx.wait()

      console.log("[v0] Blockchain transaction confirmed:", receipt.hash)

      // Update database
      const response = await fetch(`/api/yields/${yieldId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verifier_wallet: walletAddress,
          status: decision,
          remarks,
          transaction_hash: receipt.hash,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update verification in database")
      }

      // Redirect to dashboard
      router.push("/dashboard/verifier?success=true")
    } catch (error: any) {
      console.error("[v0] Error processing verification:", error)
      setError(error.message || "Failed to process verification. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (error && !yieldRecord) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertCircle className="h-8 w-8" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Error</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
          <Button onClick={() => router.push("/dashboard/verifier")} className="w-full">
            Return to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  if (!yieldRecord) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading yield record...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard/verifier" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-balance">AgriYieldChain</h1>
              <p className="text-xs text-muted-foreground">Review Yield</p>
            </div>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/verifier">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h2 className="text-3xl font-bold">Review Yield Submission</h2>
              <p className="text-muted-foreground mt-1">Verify the accuracy and authenticity of the yield data</p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Yield Details */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Yield Information</h3>
              {yieldRecord.blockchain_id && (
                <Badge variant="outline" className="font-mono">
                  Blockchain ID: #{yieldRecord.blockchain_id}
                </Badge>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-muted-foreground">Crop Type</Label>
                <p className="text-lg font-semibold mt-1">{yieldRecord.crop_type}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Quantity</Label>
                <p className="text-lg font-semibold mt-1">{yieldRecord.quantity.toLocaleString()} kg</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Harvest Date</Label>
                <p className="text-lg font-semibold mt-1">{new Date(yieldRecord.harvest_date).toLocaleDateString()}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Location</Label>
                <p className="text-lg font-semibold mt-1">{yieldRecord.location}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Farmer Wallet</Label>
                <p className="text-sm font-mono mt-1 break-all">{yieldRecord.farmer_wallet}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Submission Date</Label>
                <p className="text-lg font-semibold mt-1">{new Date(yieldRecord.submitted_at).toLocaleString()}</p>
              </div>
            </div>

            {yieldRecord.ipfs_hash && (
              <div className="pt-4 border-t">
                <Label className="text-muted-foreground">Supporting Documents</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex-1 p-3 bg-muted rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-1">IPFS Hash</p>
                    <code className="text-xs font-mono break-all">{yieldRecord.ipfs_hash}</code>
                  </div>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Verification Form */}
          {yieldRecord.status === "pending" && (
            <Card className="p-6">
              <form onSubmit={handleSubmitDecision} className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Verification Decision</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setDecision("verified")}
                      className={`p-6 rounded-lg border-2 text-left transition-colors ${
                        decision === "verified"
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-border hover:border-emerald-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <p className="text-lg font-semibold">Verify & Approve</p>
                      </div>
                      <p className="text-sm text-muted-foreground">All data is accurate and meets quality standards</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecision("rejected")}
                      className={`p-6 rounded-lg border-2 text-left transition-colors ${
                        decision === "rejected" ? "border-red-500 bg-red-50" : "border-border hover:border-red-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-700">
                          <XCircle className="h-5 w-5" />
                        </div>
                        <p className="text-lg font-semibold">Reject</p>
                      </div>
                      <p className="text-sm text-muted-foreground">Data is inaccurate or does not meet requirements</p>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks">Verification Remarks *</Label>
                  <Textarea
                    id="remarks"
                    placeholder="Provide detailed remarks about your verification decision..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Explain your decision clearly. This will be visible to the farmer and recorded on the blockchain.
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <div className="bg-muted/50 rounded-lg p-4 mb-6 space-y-2">
                    <p className="text-sm font-medium">Before Submitting:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>✓ Review all yield information carefully</li>
                      <li>✓ Check supporting documents if available</li>
                      <li>✓ Your decision will be recorded on the blockchain</li>
                      <li>✓ Gas fees will be required for blockchain transaction</li>
                      <li>✓ Decision cannot be reversed once submitted</li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dashboard/verifier")}
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isProcessing || !decision} className="flex-1">
                      {isProcessing ? "Processing..." : "Submit Verification"}
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          )}

          {yieldRecord.status !== "pending" && (
            <Card className="p-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>This yield has already been processed and cannot be reviewed again.</AlertDescription>
              </Alert>
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full ${
                    decision === "verified" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                  }`}
                >
                  {decision === "verified" ? <CheckCircle className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold">Confirm Your Decision</h3>
                <p className="text-muted-foreground mt-2">
                  You are about to {decision === "verified" ? "verify" : "reject"} this yield submission. This action
                  will be recorded on the blockchain and cannot be undone.
                </p>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Your Remarks:</p>
              <p className="text-sm text-muted-foreground">{remarks}</p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                disabled={isProcessing}
                className="flex-1 bg-transparent"
              >
                Cancel
              </Button>
              <Button onClick={confirmDecision} disabled={isProcessing} className="flex-1">
                {isProcessing ? "Processing..." : "Confirm"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
