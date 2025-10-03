import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Database, Lock, Eye, Server, HardDrive, Github } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto max-w-4xl relative">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">Privacy Policy</h1>
            <p className="text-xl md:text-2xl text-muted-foreground text-pretty max-w-3xl mx-auto leading-relaxed">
              Your privacy is our priority. Here's exactly how Magneto handles your data—spoiler alert: we don't.
            </p>
          </div>

          <div className="text-center">
            <Badge variant="secondary" className="text-sm px-4 py-1.5">
              Last updated: October 2025
            </Badge>
          </div>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">TL;DR</h2>
          </div>
          
          <Card className="border-2">
            <CardContent className="">
              <div className="space-y-4 text-base md:text-lg">
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Magneto is a 100% local-only browser extension.</strong> Everything happens on your device:
                </p>
                <ul className="space-y-3 text-muted-foreground ml-6">
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-0.5">✓</span>
                    <span>All magnet links are stored in your browser's local storage—never transmitted anywhere</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-0.5">✓</span>
                    <span>No servers, no remote databases, no network requests</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-0.5">✓</span>
                    <span>No analytics, tracking, or telemetry of any kind</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-0.5">✓</span>
                    <span>Only scans websites you explicitly whitelist</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-0.5">✓</span>
                    <span>Open source—verify everything yourself</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Core Privacy Principles */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">Our Privacy Principles</h2>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <HardDrive className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">Local Processing Only</CardTitle>
                <CardDescription className="text-base">
                  All data processing happens entirely within your browser using the browser's local storage API. Nothing is ever transmitted to external servers or cloud services.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Eye className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">Zero Tracking</CardTitle>
                <CardDescription className="text-base">
                  We don't track your browsing habits, collect analytics, monitor usage patterns, or implement any form of telemetry. No data is ever sent outside your browser.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Server className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">No Backend Infrastructure</CardTitle>
                <CardDescription className="text-base">
                  Magneto doesn't operate any servers, databases, or backend infrastructure. There's literally nowhere for your data to go. It stays on your device, period.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Lock className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">Fully Open Source</CardTitle>
                <CardDescription className="text-base">
                  Our entire codebase is open source and available on GitHub. You can verify every single privacy claim by reviewing the source code yourself.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Data Handling Details */}
      <section className="py-24 px-4 bg-muted/50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-16 text-center">Data Handling Details</h2>

          <div className="space-y-12">
            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-6">What Data We Store Locally</h3>
              <Card className="border-2">
                <CardContent className="">
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2.5 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-foreground text-lg mb-1">Magnet Links</h4>
                        <p className="text-muted-foreground text-base">
                          When Magneto detects a magnet link on a whitelisted website, it stores: the magnet URI (including info hash, display name, and trackers), the source URL where it was found, the collection timestamp, and any metadata extracted from the link itself. This data is stored in your browser's local storage area.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2.5 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-foreground text-lg mb-1">Whitelist Configuration</h4>
                        <p className="text-muted-foreground text-base">
                          Your approved website patterns (like <code className="text-sm bg-muted px-1.5 py-0.5 rounded">https://example.com/*</code>) are stored locally in your browser. Magneto only scans pages matching these patterns. No information about non-whitelisted sites is ever collected or stored.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2.5 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-foreground text-lg mb-1">Extension Settings</h4>
                        <p className="text-muted-foreground text-base">
                          Simple preferences like whether collection is currently enabled/paused and display options. These are basic boolean flags and UI preferences only.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-6">What We Absolutely Never Collect</h3>
              <Card className="border-2 border-destructive/20">
                <CardContent className="">
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-2 h-2 bg-destructive rounded-full mt-2.5 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-foreground text-lg mb-1">Personal Information</h4>
                        <p className="text-muted-foreground text-base">
                          Zero collection of names, email addresses, IP addresses, user IDs, or any other personally identifiable information. There's no user account system, no authentication, nothing.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-2 h-2 bg-destructive rounded-full mt-2.5 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-foreground text-lg mb-1">Browsing History or Activity</h4>
                        <p className="text-muted-foreground text-base">
                          We don't log which websites you visit (even whitelisted ones), what time you visit them, how long you stay, or any browsing patterns. The content script only looks for magnet links—nothing else.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-2 h-2 bg-destructive rounded-full mt-2.5 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-foreground text-lg mb-1">Analytics or Telemetry</h4>
                        <p className="text-muted-foreground text-base">
                          No analytics services, no crash reporting, no performance monitoring, no usage statistics, no A/B testing, no feature flags from a server—absolutely nothing. The code contains zero network requests.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-2 h-2 bg-destructive rounded-full mt-2.5 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-foreground text-lg mb-1">Device or System Information</h4>
                        <p className="text-muted-foreground text-base">
                          No device fingerprinting, no OS detection, no screen resolution, no hardware specs, no installed fonts, no timezone—nothing that could identify your device.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-6">Storage & Security</h3>
              <Card className="border-2">
                <CardContent className="">
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2.5 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-foreground text-lg mb-1">Browser Local Storage API</h4>
                        <p className="text-muted-foreground text-base">
                          All data is stored using your browser's local storage API. This stores data on your device only and is isolated per-browser profile. It never syncs to any cloud services.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2.5 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-foreground text-lg mb-1">No Cloud Synchronization</h4>
                        <p className="text-muted-foreground text-base">
                          We explicitly use local-only storage. Your magnet links stay on your computer and are never backed up to any cloud servers or synced across devices.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2.5 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-foreground text-lg mb-1">Complete User Control</h4>
                        <p className="text-muted-foreground text-base">
                          You have full control over your data. Delete individual magnet links, clear your entire stash, or uninstall the extension—your data is instantly and permanently removed from storage.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2.5 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-foreground text-lg mb-1">Export Your Data Anytime</h4>
                        <p className="text-muted-foreground text-base">
                          Export your collected magnet links to TXT, JSON, or CSV formats at any time. The export happens locally in your browser using the <code className="text-sm bg-muted px-1.5 py-0.5 rounded">downloads</code> permission—no server upload involved.
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
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-center">Browser Permissions Explained</h2>
          <p className="text-muted-foreground text-center text-lg mb-16 max-w-3xl mx-auto">
            Modern browsers require extensions to declare permissions upfront. Here's exactly why Magneto needs each one and what we actually do with them:
          </p>

          <div className="space-y-6">
            <Card className="border-2 hover:border-primary/30 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl text-foreground flex items-center gap-2">
                  <code className="text-base bg-muted px-2 py-1 rounded font-mono text-primary">storage</code>
                  <span>Permission</span>
                </CardTitle>
                <CardDescription className="text-base leading-relaxed space-y-2 pt-2">
                  <p>
                    <strong className="text-foreground">Why we need it:</strong> To persist your collected magnet links, whitelist configuration, and basic settings between browser sessions.
                  </p>
                  <p>
                    <strong className="text-foreground">What we actually do:</strong> Use the browser's local storage API to read/write data to your browser's local storage. All operations are performed locally on your device.
                  </p>
                  <p>
                    <strong className="text-foreground">What we never do:</strong> Access the browser's sync storage or transmit any stored data to external servers.
                  </p>
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/30 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl text-foreground flex items-center gap-2">
                  <code className="text-base bg-muted px-2 py-1 rounded font-mono text-primary">tabs</code>
                  <span>Permission</span>
                </CardTitle>
                <CardDescription className="text-base leading-relaxed space-y-2 pt-2">
                  <p>
                    <strong className="text-foreground">Why we need it:</strong> To check the current tab's URL against your whitelist and enable opening the dashboard interface.
                  </p>
                  <p>
                    <strong className="text-foreground">What we actually do:</strong> Read the current tab's URL to determine if the current page matches your whitelist patterns. This is used by the content script to decide whether to scan for magnet links.
                  </p>
                  <p>
                    <strong className="text-foreground">What we never do:</strong> Read tab content, monitor your browsing history, or track which tabs you have open. We only check URLs against your local whitelist.
                  </p>
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/30 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl text-foreground flex items-center gap-2">
                  <code className="text-base bg-muted px-2 py-1 rounded font-mono text-primary">downloads</code>
                  <span>Permission</span>
                </CardTitle>
                <CardDescription className="text-base leading-relaxed space-y-2 pt-2">
                  <p>
                    <strong className="text-foreground">Why we need it:</strong> To enable exporting your magnet link collection to local files (TXT, JSON, CSV formats).
                  </p>
                  <p>
                    <strong className="text-foreground">What we actually do:</strong> Generate export files from your locally stored data and trigger browser downloads to save them to your Downloads folder. All file generation happens in-browser.
                  </p>
                  <p>
                    <strong className="text-foreground">What we never do:</strong> Download content from external sources, access your existing download history, or upload files anywhere.
                  </p>
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/30 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl text-foreground flex items-center gap-2">
                  <code className="text-base bg-muted px-2 py-1 rounded font-mono text-primary">sidePanel</code>
                  <span>Permission</span>
                </CardTitle>
                <CardDescription className="text-base leading-relaxed space-y-2 pt-2">
                  <p>
                    <strong className="text-foreground">Why we need it:</strong> To provide a convenient side panel UI where you can browse and manage your magnet link stash.
                  </p>
                  <p>
                    <strong className="text-foreground">What we actually do:</strong> Register a side panel interface that displays your locally stored magnet links with search, filter, and delete capabilities.
                  </p>
                  <p>
                    <strong className="text-foreground">What we never do:</strong> Access data from other extensions or websites through the side panel.
                  </p>
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/30 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl text-foreground flex items-center gap-2">
                  <code className="text-base bg-muted px-2 py-1 rounded font-mono text-primary">Content Scripts</code>
                  <span>(http://*/* and https://*/*)</span>
                </CardTitle>
                <CardDescription className="text-base leading-relaxed space-y-2 pt-2">
                  <p>
                    <strong className="text-foreground">Why we need it:</strong> To inject a content script that can scan web pages for magnet links.
                  </p>
                  <p>
                    <strong className="text-foreground">What we actually do:</strong> The content script checks if the current page's URL matches your whitelist using <code className="text-sm bg-muted px-1.5 py-0.5 rounded">minimatch</code> pattern matching. If it matches, it uses a MutationObserver to detect magnet links in the DOM and extracts them using site-specific adapters.
                  </p>
                  <p>
                    <strong className="text-foreground">What we never do:</strong> Run on pages that don't match your whitelist. We don't read form data, passwords, cookies, or any other page content—only magnet links (URIs starting with <code className="text-sm bg-muted px-1.5 py-0.5 rounded">magnet:?</code>) and related information.
                  </p>
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Third Party Services */}
      <section className="py-24 px-4 bg-muted/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">Third-Party Services & Network Activity</h2>

          <Card className="border-2">
            <CardContent className="">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-6">Absolutely Zero Network Activity</h3>
                <div className="text-left max-w-2xl mx-auto space-y-4 text-muted-foreground text-base">
                  <p>
                    Magneto makes <strong className="text-foreground">zero network requests</strong>. None. The extension code contains no <code className="text-sm bg-muted px-1.5 py-0.5 rounded">fetch()</code>, <code className="text-sm bg-muted px-1.5 py-0.5 rounded">XMLHttpRequest</code>, or any other network API calls.
                  </p>
                  <p>
                    <strong className="text-foreground">No third-party integrations:</strong> No analytics platforms, no error tracking services, no CDNs, no external fonts, no social media widgets—nothing that could phone home.
                  </p>
                  <p>
                    <strong className="text-foreground">No external dependencies at runtime:</strong> All code runs locally in your browser. While we use open-source libraries during development, they're bundled into the extension and don't make any external calls.
                  </p>
                  <p className="pt-2 border-t">
                    You can verify this yourself by opening your browser's developer tools (F12), going to the Network tab, and monitoring traffic while using Magneto. You'll see zero requests originating from the extension.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Updates to Privacy Policy */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">Policy Updates</h2>

          <Card className="border-2">
            <CardContent className="">
              <p className="text-muted-foreground text-base mb-6">
                Because Magneto collects zero data and makes zero network requests, this privacy policy is unlikely to ever change in a meaningful way. However, if we need to update it:
              </p>
              <ul className="space-y-4 text-muted-foreground text-base">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>We'll update the "Last updated" date at the top of this page</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>Material changes will be announced through the extension's changelog</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <span>We will <strong className="text-foreground">never</strong> compromise our commitment to local-only, zero-tracking operation</span>
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t">
                <p className="text-muted-foreground text-base">
                  All changes to this policy are tracked in our public GitHub repository, so you can see exactly what changed and why.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto max-w-4xl text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Questions About Privacy?</h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Since Magneto is 100% open source, you can review every line of code to verify these privacy claims. If you have questions or concerns, feel free to open an issue on GitHub.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button asChild size="lg" className="px-8 py-6 text-base font-semibold">
              <Link href="/">
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 py-6 text-base font-semibold">
              <Link href="https://github.com/gergogyulai/magneto">
                <Github className="w-5 h-5 mr-2" />
                View Source Code
              </Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Don't trust, verify. All code is available for inspection.
          </p>
        </div>
      </section>
    </div>
  )
}
