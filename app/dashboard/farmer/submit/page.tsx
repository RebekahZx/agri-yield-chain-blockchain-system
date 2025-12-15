"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sprout, ArrowLeft, Upload, CheckCircle, AlertCircle } from "lucide-react"
import { getConnectedAddress, getSigner, getContract } from "@/lib/blockchain"
import type { User } from "@/lib/db"

const CROP_TYPES = [
  "Wheat",
  "Rice",
  "Corn",
  "Soybeans",
  "Barley",
  "Cotton",
  "Sugarcane",
  "Coffee",
  "Tea",
  "Vegetables",
  "Fruits",
  "Other",
]

export default function SubmitYieldPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [cropType, setCropType] = useState("")
  const [customCropType, setCustomCropType] = useState("")
  const [quantity, setQuantity] = useState("")
  const [harvestDate, setHarvestDate] = useState("")
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [documents, setDocuments] = useState<FileList | null>(null)

  useEffect(() => {
    initializePage()
  }, [])

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

      if (!userData.user || userData.user.role !== "farmer") {
        router.push("/auth")
        return
      }

      setUser(userData.user)
    } catch (error) {
      console.error("[v0] Error initializing page:", error)
      router.push("/auth")
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!walletAddress || !user) {
      setError("Please connect your wallet")
      setIsSubmitting(false)
      return
    }

    const finalCropType = cropType === "Other" ? customCropType : cropType

    if (!finalCropType || !quantity || !harvestDate || !location) {
      setError("Please fill in all required fields")
      setIsSubmitting(false)
      return
    }

    try {
      // Simulate IPFS upload (in production, this would upload to actual IPFS)
      let ipfsHash = null
      if (documents && documents.length > 0) {
        // Placeholder IPFS hash
        ipfsHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
      }

      // Submit to blockchain
      const signer = await getSigner()
      const contract = getContract(signer)

      const harvestTimestamp = Math.floor(new Date(harvestDate).getTime() / 1000)

      console.log("[v0] Submitting to blockchain...")
      const tx = await contract.submitYield(finalCropType, quantity, harvestTimestamp, location, ipfsHash || "")

      console.log("[v0] Waiting for transaction confirmation...")
      const receipt = await tx.wait()

      // Get blockchain ID from event logs
      const event = receipt.logs.find((log: any) => log.eventName === "YieldSubmitted")
      const blockchainId = event ? event.args[0] : null

      console.log("[v0] Blockchain transaction confirmed:", receipt.hash)

      // Save to database
      const response = await fetch("/api/yields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmer_wallet: walletAddress,
          crop_type: finalCropType,
          quantity: Number.parseInt(quantity),
          harvest_date: new Date(harvestDate).toISOString(),
          location,
          ipfs_hash: ipfsHash,
          blockchain_id: blockchainId ? blockchainId.toString() : null,
          transaction_hash: receipt.hash,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save yield record to database")
      }

      setSuccess(true)

      // Redirect after success
      setTimeout(() => {
        router.push("/dashboard/farmer")
      }, 2000)
    } catch (error: any) {
      console.error("[v0] Error submitting yield:", error)
      setError(error.message || "Failed to submit yield. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle className="h-8 w-8" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Yield Submitted Successfully!</h2>
            <p className="text-muted-foreground">
              Your yield record has been recorded on the blockchain and is awaiting verification.
            </p>
          </div>
          <Button onClick={() => router.push("/dashboard/farmer")} className="w-full">
            Return to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard/farmer" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-balance">AgriYieldChain</h1>
              <p className="text-xs text-muted-foreground">Submit Yield</p>
            </div>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/farmer">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h2 className="text-3xl font-bold">Submit New Yield</h2>
              <p className="text-muted-foreground mt-1">Record your harvest data on the blockchain</p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cropType">Crop Type *</Label>
                <select
                  id="cropType"
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select a crop type</option>
                  {CROP_TYPES.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </div>

              {cropType === "Other" && (
                <div className="space-y-2">
                  <Label htmlFor="customCropType">Specify Crop Type *</Label>
                  <Input
                    id="customCropType"
                    placeholder="e.g., Quinoa, Millet"
                    value={customCropType}
                    onChange={(e) => setCustomCropType(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (kg) *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  placeholder="e.g., 5000"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Enter the total harvest quantity in kilograms</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="harvestDate">Harvest Date *</Label>
                <Input
                  id="harvestDate"
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., GPS coordinates or farm name"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Provide GPS coordinates, farm ID, or location identifier
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information about this harvest..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="documents">Supporting Documents (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    id="documents"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => setDocuments(e.target.files)}
                    className="hidden"
                  />
                  <label htmlFor="documents" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">Click to upload documents</p>
                    <p className="text-xs text-muted-foreground">PDF, JPG, PNG, DOC (Max 10MB per file)</p>
                  </label>
                  {documents && documents.length > 0 && (
                    <div className="mt-4 text-left">
                      <p className="text-sm font-medium mb-2">{documents.length} file(s) selected:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {Array.from(documents).map((file, index) => (
                          <li key={index}>
                            {file.name} ({(file.size / 1024).toFixed(1)} KB)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload harvest reports, field photos, or other supporting documents
                </p>
              </div>

              <div className="pt-4 border-t">
                <div className="bg-muted/50 rounded-lg p-4 mb-6 space-y-2">
                  <p className="text-sm font-medium">Before Submitting:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>✓ All data will be recorded on the blockchain</li>
                    <li>✓ Your submission will be reviewed by authorized verifiers</li>
                    <li>✓ Gas fees will be required for blockchain transaction</li>
                    <li>✓ Data cannot be modified once submitted</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => router.push("/dashboard/farmer")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? "Submitting to Blockchain..." : "Submit Yield Record"}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
