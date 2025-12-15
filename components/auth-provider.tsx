"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  walletAddress: string | null
  userRole: "farmer" | "verifier" | null
  userId: string | null
  login: (address: string, role: "farmer" | "verifier", userId: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<"farmer" | "verifier" | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const address = localStorage.getItem("walletAddress")
    const role = localStorage.getItem("userRole") as "farmer" | "verifier" | null
    const id = localStorage.getItem("userId")

    if (address && role && id) {
      setIsAuthenticated(true)
      setWalletAddress(address)
      setUserRole(role)
      setUserId(id)
    }
  }, [])

  const login = (address: string, role: "farmer" | "verifier", userId: string) => {
    localStorage.setItem("walletAddress", address)
    localStorage.setItem("userRole", role)
    localStorage.setItem("userId", userId)
    setIsAuthenticated(true)
    setWalletAddress(address)
    setUserRole(role)
    setUserId(userId)
  }

  const logout = () => {
    localStorage.removeItem("walletAddress")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userId")
    setIsAuthenticated(false)
    setWalletAddress(null)
    setUserRole(null)
    setUserId(null)
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, walletAddress, userRole, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
