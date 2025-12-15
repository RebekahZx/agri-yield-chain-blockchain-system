"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { connectWallet, getConnectedAddress, formatAddress } from "@/lib/blockchain"

export function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    checkConnection()
  }, [])

  async function checkConnection() {
    const address = await getConnectedAddress()
    setWalletAddress(address)
  }

  async function handleConnect() {
    setIsConnecting(true)
    try {
      const address = await connectWallet()
      setWalletAddress(address)
    } catch (error) {
      console.error("[v0] Error connecting wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  if (walletAddress) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium">
        <Wallet className="h-4 w-4" />
        <span>{formatAddress(walletAddress)}</span>
      </div>
    )
  }

  return (
    <Button onClick={handleConnect} disabled={isConnecting} size="sm">
      <Wallet className="h-4 w-4 mr-2" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  )
}
