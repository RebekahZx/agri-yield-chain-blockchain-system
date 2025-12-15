"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "farmer" | "verifier"
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const walletAddress = localStorage.getItem("walletAddress")
    const userRole = localStorage.getItem("userRole")

    if (!walletAddress) {
      router.push("/auth")
      return
    }

    if (requiredRole && userRole !== requiredRole) {
      router.push(`/dashboard/${userRole}`)
      return
    }

    setIsLoading(false)
  }, [router, requiredRole])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return <>{children}</>
}
