"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Wheat, LayoutDashboard, LogOut } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()
  const isAuthenticated = typeof window !== "undefined" && localStorage.getItem("walletAddress")
  const userRole = typeof window !== "undefined" ? localStorage.getItem("userRole") : null

  const handleLogout = () => {
    localStorage.removeItem("walletAddress")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userId")
    window.location.href = "/"
  }

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Wheat className="h-6 w-6 text-primary" />
            <span>AgriYieldChain</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/explorer"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/explorer" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Explorer
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  href={userRole === "farmer" ? "/dashboard/farmer" : "/dashboard/verifier"}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname?.startsWith("/dashboard") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Dashboard
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href={userRole === "farmer" ? "/dashboard/farmer" : "/dashboard/verifier"}>
                  <Button variant="outline" size="sm" className="hidden md:flex bg-transparent">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/auth">
                <Button size="sm">Get Started</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
