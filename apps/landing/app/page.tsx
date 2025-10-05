import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Database, Github, Chrome, Lock, Zap, Download, Search, FileText, Check } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { userAgent } from "next/server"
import { headers } from "next/headers"
import BrowserAwareAddButton from "@/components/browser-aware-add-button"
import BrowserAwareBadge from "@/components/browser-aware-badge"


export default async function Home() {
  const headersList = await headers()
  const { browser } = userAgent({headers: headersList});

  const browserName = browser.name || 'Chrome';
  const addButtonText = `Add to ${browserName}`;
  const installButtonText = `Install Extension`;
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto max-w-5xl text-center relative">
          <BrowserAwareBadge />
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 text-balance leading-tight">
            Never Lose a <span className="text-primary">Magnet Link</span> Again
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 text-pretty max-w-3xl mx-auto leading-relaxed">
            Magneto quietly collects and stores magnet links as you browse, creating your personal cache for when
            torrent sites go down. Completely private, lightweight, and open source.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <BrowserAwareAddButton />
            <Link href="https://github.com/gergogyulai/magneto">
              <Button variant="outline" size="lg" className="px-8 py-6 text-base font-semibold">
                <Github className="w-5 h-5 mr-2" />
                View on GitHub
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              Privacy-first
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Database className="w-4 h-4" />
              Local Storage
            </span>
            <span className="flex items-center gap-1.5">
              <Github className="w-4 h-4" />
              Open Source
            </span>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">The Problem</h2>
          </div>
          <blockquote className="text-lg md:text-xl text-muted-foreground italic border-l-4 border-primary pl-6 py-2">
            "Torrent sites go down all the time. One day, a link is there, and the next, it's gone until the site comes
            back. I got tired of losing access to content I meant to download but didn't get around to."
          </blockquote>
          <p className="text-base md:text-lg text-muted-foreground mt-6 text-center">
            That's why Magneto was built—a simple solution to create your personal magnet link archive.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Privacy-First Features</h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Everything happens locally in your browser. No data ever leaves your device.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">Whitelist Protection</CardTitle>
                <CardDescription className="text-base">
                  Only collects from sites you explicitly approve. Complete control over what gets scraped.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Search className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">Smart Stash</CardTitle>
                <CardDescription className="text-base">
                  Browse, search, and organize your collected links. Export in multiple formats (TXT, JSON, CSV).
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">Lightweight</CardTitle>
                <CardDescription className="text-base">
                  Minimal impact on browsing performance. Runs quietly in the background without slowing you down.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy Guarantee */}
      <section className="py-24 px-4 bg-muted/50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">Your Privacy is Guaranteed</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              All processing happens locally in your browser. No servers, no tracking, no data collection.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <span className="text-destructive">✗</span> What We Don't Do
              </h3>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-base">Send data to external servers</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-base">Track your browsing habits</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-base">Store personal information</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-base">Require account creation</span>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <span className="text-primary">✓</span> What We Do
              </h3>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-base">Process everything locally</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-base">Give you full control</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-base">Keep your data on your device</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-base">Provide open source code</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg md:text-xl">Simple, automatic, and completely under your control</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Whitelist Sites</h3>
              <p className="text-muted-foreground text-base">
                Choose which torrent sites you want Magneto to monitor for magnet links.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Browse Normally</h3>
              <p className="text-muted-foreground text-base">
                Magneto quietly collects magnet links as you browse your whitelisted sites.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Access Your Stash</h3>
              <p className="text-muted-foreground text-base">
                View, search, and manage your collected links anytime, even when sites are down.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto max-w-4xl text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Ready to Never Lose Links Again?</h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join users who have already secured their magnet link collections with Magneto.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <BrowserAwareAddButton text="Install Extension" />
            <Link href="https://github.com/gergogyulai/magneto">
              <Button variant="outline" size="lg" className="px-8 py-6 text-base font-semibold">
                <Github className="w-5 h-5 mr-2" />
                View Source Code
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Check className="size-4"/>Free forever</span>
            <span className="inline-flex items-center gap-1.5"><Check className="size-4"/>Open source</span>
            <span className="inline-flex items-center gap-1.5"><Check className="size-4"/>No account required</span>
          </div>
        </div>
      </section>
    </div>
  )
}
