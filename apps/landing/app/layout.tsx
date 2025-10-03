import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { Github } from "lucide-react";

export const metadata: Metadata = {
  title: "Magneto - Privacy-First Magnet Link Manager",
  description:
    "A lightweight, open-source Chrome extension that quietly collects and manages magnet links with complete privacy. Never lose access to torrents again.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
              <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Link href={"/"}>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Database className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xl font-bold text-foreground">
                      Magneto
                    </span>
                  </div>
                </Link>
                <div className="flex items-center space-x-3">
                  {/* <Badge variant="secondary" className="hidden sm:inline-flex">
                    Open Source
                  </Badge>
                  <Badge variant="outline" className="hidden sm:inline-flex">
                    Privacy First
                  </Badge> */}
                  <ThemeToggle />
                </div>
              </div>
            </header>
            {children}
            <footer className="py-12 px-4 border-t bg-muted/30">
              <div className="container mx-auto max-w-5xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <Link href="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Database className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-bold text-foreground text-lg">
                      Magneto
                    </span>
                  </Link>

                  <div className="flex items-center space-x-6 text-sm">
                    <Link
                      href="/sample-magnet-links"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      Sample Magnetlink Generator
                    </Link>
                    <Link
                      href="/privacy"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      Privacy Policy
                    </Link>
                    <Link
                      href="https://github.com/gergogyulai/magneto"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Github className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                  <p>
                    Built with privacy in mind. Open source and proud of it.{" "}
                    {new Date().getFullYear()}
                  </p>
                </div>
              </div>
            </footer>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
