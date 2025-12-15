import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Shield, TrendingUp, Users, FileCheck, Sprout, Lock } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navigation />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Lock className="h-4 w-4" />
            <span>Powered by Blockchain Technology</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-balance leading-tight">
            Transparent Agricultural Yield Registration for a Sustainable Future
          </h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto leading-relaxed">
            A decentralized platform that brings trust, transparency, and immutability to agricultural yield data
            through blockchain technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="text-base px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/explorer">
              <Button size="lg" variant="outline" className="text-base px-8 bg-transparent">
                View Explorer
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12">
            <div className="space-y-2">
              <p className="text-3xl md:text-4xl font-bold text-primary">2,847</p>
              <p className="text-sm text-muted-foreground">Verified Yields</p>
            </div>
            <div className="space-y-2">
              <p className="text-3xl md:text-4xl font-bold text-primary">1,234</p>
              <p className="text-sm text-muted-foreground">Active Farmers</p>
            </div>
            <div className="space-y-2">
              <p className="text-3xl md:text-4xl font-bold text-primary">156</p>
              <p className="text-sm text-muted-foreground">Verifiers</p>
            </div>
            <div className="space-y-2">
              <p className="text-3xl md:text-4xl font-bold text-primary">45M kg</p>
              <p className="text-sm text-muted-foreground">Total Verified</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-balance">Why Choose AgriYieldChain?</h3>
            <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto leading-relaxed">
              Built on blockchain technology to ensure data integrity, transparency, and trust in agricultural supply
              chains.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-semibold">Immutable Records</h4>
              <p className="text-muted-foreground leading-relaxed">
                All yield data is stored on the blockchain, making it tamper-proof and permanently verifiable.
              </p>
            </Card>

            <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileCheck className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-semibold">Verified Data</h4>
              <p className="text-muted-foreground leading-relaxed">
                Government-approved verifiers ensure all submitted yield data meets quality standards.
              </p>
            </Card>

            <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-semibold">Real-Time Analytics</h4>
              <p className="text-muted-foreground leading-relaxed">
                Track agricultural trends, yield patterns, and production statistics in real-time.
              </p>
            </Card>

            <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-semibold">Multi-Stakeholder</h4>
              <p className="text-muted-foreground leading-relaxed">
                Connects farmers, verifiers, researchers, and policymakers on a single transparent platform.
              </p>
            </Card>

            <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Lock className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-semibold">Secure Access</h4>
              <p className="text-muted-foreground leading-relaxed">
                Wallet-based authentication ensures only authorized users can submit and verify data.
              </p>
            </Card>

            <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sprout className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-semibold">IPFS Integration</h4>
              <p className="text-muted-foreground leading-relaxed">
                Supporting documents stored on IPFS for decentralized, permanent, and accessible record keeping.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h3 className="text-3xl md:text-4xl font-bold text-balance">How It Works</h3>
              <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
                A simple three-step process for transparent agricultural data management.
              </p>
            </div>

            <div className="space-y-12">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  1
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-semibold">Farmers Submit Yield Data</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Farmers connect their wallet and submit harvest information including crop type, quantity, location,
                    and supporting documents. Data is recorded on the blockchain with a unique transaction ID.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  2
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-semibold">Verifiers Review & Approve</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Government-approved verifiers review submitted data, inspect supporting documents, and either
                    approve or reject submissions. All verification actions are recorded immutably on the blockchain.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  3
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-semibold">Public Access & Analytics</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Verified data becomes publicly accessible through the explorer. Researchers, policymakers, and
                    stakeholders can analyze trends, track production, and make data-driven decisions for agricultural
                    development.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 md:p-12 bg-primary text-primary-foreground">
            <div className="text-center space-y-6">
              <h3 className="text-3xl md:text-4xl font-bold text-balance">Ready to Get Started?</h3>
              <p className="text-lg text-primary-foreground/90 text-pretty max-w-2xl mx-auto leading-relaxed">
                Join thousands of farmers and verifiers building a transparent agricultural future with blockchain
                technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/auth">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-base px-8 bg-background text-foreground hover:bg-background/90"
                  >
                    Connect Your Wallet
                  </Button>
                </Link>
                <Link href="/explorer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-base px-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                  >
                    Explore Public Data
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Sprout className="h-5 w-5" />
                </div>
                <span className="font-bold">AgriYieldChain</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Building trust in agriculture through blockchain technology.
              </p>
            </div>

            <div className="space-y-4">
              <h5 className="font-semibold">Platform</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/auth" className="hover:text-foreground transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/explorer" className="hover:text-foreground transition-colors">
                    Explorer
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="font-semibold">Resources</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Smart Contracts
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    API Reference
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="font-semibold">Legal</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2025 AgriYieldChain. Built on blockchain for a transparent future.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
