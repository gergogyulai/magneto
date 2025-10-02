import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Database, Lock, Eye, Server, HardDrive } from "lucide-react"
import Link from "next/link"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">Magneto</span>
          </Link>
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
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Shield className="w-16 h-16 text-accent mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 text-balance">Privacy Policy</h1>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Your privacy is our priority. Here's exactly how Magneto handles your data—spoiler alert: we don't.
            </p>
          </div>

          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              Last updated: September 2025
            </Badge>
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

      {/* Core Privacy Principles */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">Our Privacy Principles</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <HardDrive className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-xl">Local Processing Only</CardTitle>
                <CardDescription>
                  All data processing happens entirely within your browser. Nothing is ever transmitted to external
                  servers.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-xl">No Tracking</CardTitle>
                <CardDescription>
                  We don't track your browsing habits, collect analytics, or monitor your usage patterns.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Server className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-xl">No Servers</CardTitle>
                <CardDescription>
                  Magneto doesn't operate any servers or databases. Your data stays on your device, period.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-xl">Open Source</CardTitle>
                <CardDescription>
                  Our code is completely open source. You can verify our privacy claims by reviewing the source code.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Data Handling Details */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center">Data Handling Details</h2>

          <div className="space-y-12">
            <div>
              <h3 className="text-2xl font-semibold text-primary mb-6">What Data We Collect</h3>
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-primary">Magnet Links</h4>
                        <p className="text-muted-foreground">
                          Only magnet links from websites you explicitly whitelist are collected and stored locally in
                          your browser.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-primary">Whitelist Settings</h4>
                        <p className="text-muted-foreground">
                          Your approved website list is stored locally to control which sites Magneto monitors.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-primary">Extension Preferences</h4>
                        <p className="text-muted-foreground">
                          Basic settings like display preferences and export formats are stored locally.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-primary mb-6">What We Don't Collect</h3>
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-primary">Personal Information</h4>
                        <p className="text-muted-foreground">
                          No names, email addresses, IP addresses, or any personally identifiable information.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-primary">Browsing History</h4>
                        <p className="text-muted-foreground">
                          We don't track which websites you visit or monitor your browsing patterns.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-primary">Usage Analytics</h4>
                        <p className="text-muted-foreground">
                          No analytics, telemetry, crash reports, or usage statistics are collected.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-primary">Device Information</h4>
                        <p className="text-muted-foreground">
                          No device fingerprinting, system information, or hardware details are collected.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-primary mb-6">Data Storage & Security</h3>
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-primary">Local Storage Only</h4>
                        <p className="text-muted-foreground">
                          All data is stored using Chrome's local storage APIs on your device. Nothing leaves your
                          computer.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-primary">No Cloud Sync</h4>
                        <p className="text-muted-foreground">
                          Data is not synced across devices or backed up to any cloud services.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-primary">User Control</h4>
                        <p className="text-muted-foreground">
                          You can delete all stored data at any time through the extension settings or by uninstalling.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Permissions Explanation */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">Extension Permissions</h2>
          <p className="text-muted-foreground text-center mb-12">
            Magneto requires certain Chrome permissions to function. Here's exactly why we need each one:
          </p>

          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Tabs Permission</CardTitle>
                <CardDescription>
                  <strong>Why we need it:</strong> To scan the current page for magnet links when you're on a
                  whitelisted site, detect when you navigate to new pages, and open the dashboard interface in a new
                  tab.
                  <br />
                  <strong>What we do:</strong> Only read magnet links from pages you've approved, monitor tab changes
                  for whitelisted sites, and create new tabs for the dashboard interface when requested.
                  <br />
                  <strong>What we don't do:</strong> Access content from non-whitelisted sites or read sensitive page
                  data.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Storage Permission</CardTitle>
                <CardDescription>
                  <strong>Why we need it:</strong> To save your collected magnet links and whitelist settings locally.
                  <br />
                  <strong>What we do:</strong> Store data in Chrome's local storage on your device only.
                  <br />
                  <strong>What we don't do:</strong> Send any stored data to external servers or services.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Side Panel Permission</CardTitle>
                <CardDescription>
                  <strong>Why we need it:</strong> To provide a convenient side panel interface where you can view and
                  manage your magnet link stash.
                  <br />
                  <strong>What we do:</strong> Display your locally stored magnet links in an organized, searchable
                  interface.
                  <br />
                  <strong>What we don't do:</strong> Access any data outside of what you've collected or send
                  information elsewhere.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Downloads Permission</CardTitle>
                <CardDescription>
                  <strong>Why we need it:</strong> To enable exporting your magnet link collection in various formats
                  (TXT, JSON, CSV).
                  <br />
                  <strong>What we do:</strong> Generate export files from your locally stored data and save them to your
                  Downloads folder.
                  <br />
                  <strong>What we don't do:</strong> Download any external content or access your existing download
                  history.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Host Permissions</CardTitle>
                <CardDescription>
                  <strong>Why we need it:</strong> To access whitelisted torrent sites and scan for magnet links.
                  <br />
                  <strong>What we do:</strong> Only access sites you explicitly approve through the whitelist feature.
                  <br />
                  <strong>What we don't do:</strong> Access any sites without your explicit permission.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Third Party Services */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">Third-Party Services</h2>

          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-4">No Third-Party Services</h3>
                <p className="text-muted-foreground">
                  Magneto does not integrate with, send data to, or rely on any third-party services, analytics
                  platforms, or external APIs. The extension operates entirely offline and independently.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Updates to Privacy Policy */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">Policy Updates</h2>

          <Card className="border-border">
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">If we ever need to update this privacy policy, we will:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-accent rounded-full mr-3"></span>
                  Update the "Last updated" date at the top of this page
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-accent rounded-full mr-3"></span>
                  Notify users through the extension if changes affect data handling
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-accent rounded-full mr-3"></span>
                  Maintain our commitment to local-only processing
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">Questions About Privacy?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Since Magneto is open source, you can review our code to verify these privacy claims. If you have questions,
            feel free to open an issue on GitHub.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3 bg-transparent">
              View Source Code
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-sidebar border-t border-sidebar-border">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-accent rounded flex items-center justify-center">
                <Database className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="font-semibold text-sidebar-foreground">Magneto</span>
            </Link>

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
