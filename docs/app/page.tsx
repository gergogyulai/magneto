import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Database, Github, Chrome, Lock, Zap } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">Magneto</span>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-xs">
              Open Source
            </Badge>
            <Badge variant="outline" className="text-xs">
              Privacy First
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4">
              Chrome Extension • Requires Chrome 114+
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6 text-balance">
              Never Lose a Magnet Link Again
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
              Magneto quietly collects and stores magnet links as you browse, creating your personal cache for when
              torrent sites go down. Completely private, lightweight, and open source.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="https://chromewebstore.google.com/">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3">
                <Chrome className="w-5 h-5 mr-2" />
                Add to Chrome
              </Button>
            </Link>
            <Link href="https://github.com/gergogyulai/magneto">
              <Button variant="outline" size="lg" className="px-8 py-3 bg-transparent">
                <Github className="w-5 h-5 mr-2" />
                View on GitHub
              </Button>
            </Link>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>✨ Currently available for Chrome • Firefox & Edge support coming soon</p>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold text-primary mb-6">The Problem</h2>
          <blockquote className="text-lg text-muted-foreground italic border-l-4 border-accent pl-6 text-left">
            "Torrent sites go down all the time. One day, a link is there, and the next, it's gone until the site comes
            back. I got tired of losing access to content I meant to download but didn't get around to."
          </blockquote>
          <p className="text-muted-foreground mt-4">
            That's why Magneto was built—a simple solution to create your personal magnet link archive.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">Privacy-First Features</h2>
            <p className="text-muted-foreground text-lg">
              Everything happens locally in your browser. No data ever leaves your device.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-xl">Whitelist Protection</CardTitle>
                <CardDescription>
                  Only collects from sites you explicitly approve. Complete control over what gets scraped.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Database className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-xl">Smart Stash</CardTitle>
                <CardDescription>
                  Browse, search, and organize your collected links. Export in multiple formats (TXT, JSON, CSV).
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-xl">Lightweight</CardTitle>
                <CardDescription>
                  Minimal impact on browsing performance. Runs quietly in the background without slowing you down.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy Guarantee */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Lock className="w-16 h-16 text-accent mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-primary mb-4">Your Privacy is Guaranteed</h2>
            <p className="text-lg text-muted-foreground">
              All processing happens locally in your browser. No servers, no tracking, no data collection.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary">What We Don't Do</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-destructive rounded-full mr-3"></span>
                  Send data to external servers
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-destructive rounded-full mr-3"></span>
                  Track your browsing habits
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-destructive rounded-full mr-3"></span>
                  Store personal information
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-destructive rounded-full mr-3"></span>
                  Require account creation
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-primary">What We Do</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-accent rounded-full mr-3"></span>
                  Process everything locally
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-accent rounded-full mr-3"></span>
                  Give you full control
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-accent rounded-full mr-3"></span>
                  Keep your data on your device
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-accent rounded-full mr-3"></span>
                  Provide open source code
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Simple, automatic, and completely under your control</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-accent">1</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Whitelist Sites</h3>
              <p className="text-foreground/80">
                Choose which torrent sites you want Magneto to monitor for magnet links.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-accent">2</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Browse Normally</h3>
              <p className="text-foreground/80">
                Magneto quietly collects magnet links as you browse your whitelisted sites.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-accent">3</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Access Your Stash</h3>
              <p className="text-foreground/80">
                View, search, and manage your collected links anytime, even when sites are down.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-accent/5">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">Ready to Never Lose Links Again?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join users who have already secured their magnet link collections with Magneto.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="https://chromewebstore.google.com/">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3">
                <Chrome className="w-5 h-5 mr-2" />
                Install Extension
              </Button>
            </Link>
            <Link href="https://github.com/gergogyulai/magneto">
              <Button variant="outline" size="lg" className="px-8 py-3 bg-transparent">
                <Github className="w-5 h-5 mr-2" />
                View Source Code
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground mt-6">Free forever • Open source • No account required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-sidebar border-t border-sidebar-border">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-accent rounded flex items-center justify-center">
                <Database className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="font-semibold text-sidebar-foreground">Magneto</span>
            </div>

            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-accent transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-sidebar-border text-center text-sm text-muted-foreground">
            <p>Built with privacy in mind. Open source and proud of it.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
