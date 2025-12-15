"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sprout, Wallet, User, AlertCircle } from "lucide-react"
import { connectWallet, getConnectedAddress } from "@/lib/blockchain"

export default function AuthPage() {
  const router = useRouter()
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<"connect" | "register" | "complete">("connect")

  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"farmer" | "verifier">("farmer")

  useEffect(() => {
    checkWalletConnection()
  }, [])

  async function checkWalletConnection() {
    try {
      const address = await getConnectedAddress()
      if (address) {
        setWalletAddress(address)
        await checkUserRegistration(address)
      }
    } catch (error) {
      console.error("[v0] Error checking wallet connection:", error)
    }
  }

  async function checkUserRegistration(address: string) {
    try {
      const response = await fetch(`/api/users?wallet=${address}`)
      const data = await response.json()

      if (data.user) {
        // User exists, redirect to dashboard
        const dashboardPath = data.user.role === "farmer" ? "/dashboard/farmer" : "/dashboard/verifier"
        router.push(dashboardPath)
      } else {
        // User needs to register
        setStep("register")
      }
    } catch (error) {
      console.error("[v0] Error checking user registration:", error)
      setStep("register")
    }
  }

  async function handleConnectWallet() {
    setIsConnecting(true)
    setError(null)

    try {
      const address = await connectWallet()
      setWalletAddress(address)
      await checkUserRegistration(address)
    } catch (error: any) {
      console.error("[v0] Error connecting wallet:", error)
      setError("Failed to connect wallet. Please make sure MetaMask is installed and unlocked.")
    } finally {
      setIsConnecting(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setIsRegistering(true)
    setError(null)

    if (!walletAddress) {
      setError("Please connect your wallet first")
      setIsRegistering(false)
      return
    }

    if (!name || !email) {
      setError("Please fill in all fields")
      setIsRegistering(false)
      return
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: walletAddress,
          name,
          email,
          role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to register user")
      }

      setStep("complete")

      // Redirect after a short delay
      setTimeout(() => {
        const dashboardPath = role === "farmer" ? "/dashboard/farmer" : "/dashboard/verifier"
        router.push(dashboardPath)
      }, 2000)
    } catch (error: any) {
      console.error("[v0] Error registering user:", error)
      setError(error.message || "Failed to register. Please try again.")
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <Link href="/" className="mb-8">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-balance">AgriYieldChain</h1>
            <p className="text-xs text-muted-foreground">Blockchain Transparency</p>
          </div>
        </div>
      </Link>

      <Card className="w-full max-w-md p-8 space-y-6">
        {/* Connect Wallet Step */}
        {step === "connect" && (
          <>
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Wallet className="h-8 w-8" />
                </div>
              </div>
              <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
              <p className="text-muted-foreground text-pretty leading-relaxed">
                Connect your Web3 wallet to access AgriYieldChain platform
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button onClick={handleConnectWallet} disabled={isConnecting} className="w-full" size="lg">
              {isConnecting ? "Connecting..." : "Connect MetaMask"}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Don't have MetaMask?{" "}
              <a
                href="https://metamask.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Install it here
              </a>
            </p>
          </>
        )}

        {/* Register Step */}
        {step === "register" && walletAddress && (
          <>
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-8 w-8" />
                </div>
              </div>
              <h2 className="text-2xl font-bold">Complete Registration</h2>
              <p className="text-muted-foreground text-pretty leading-relaxed">
                Create your account to start using AgriYieldChain
              </p>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs font-medium mb-1">Connected Wallet</p>
              <p className="text-sm font-mono break-all">{walletAddress}</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Account Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("farmer")}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      role === "farmer" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-semibold">Farmer</p>
                    <p className="text-xs text-muted-foreground mt-1">Submit yield records</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("verifier")}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      role === "verifier" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-semibold">Verifier</p>
                    <p className="text-xs text-muted-foreground mt-1">Approve submissions</p>
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={isRegistering} className="w-full" size="lg">
                {isRegistering ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </>
        )}

        {/* Complete Step */}
        {step === "complete" && (
          <>
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold">Account Created!</h2>
              <p className="text-muted-foreground text-pretty leading-relaxed">
                Your account has been successfully created. Redirecting to your dashboard...
              </p>
            </div>
          </>
        )}
      </Card>

      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  )
}
