"use client";

import { useState, useEffect } from "react";
import { faker } from "@faker-js/faker";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Link as LinkIcon, Download, Check, Clipboard, Settings, Sparkles } from "lucide-react";
import Link from "next/link";

interface MagnetLink {
  name: string;
  hash: string;
  magnetUrl: string;
  size: string;
}

function formatBytes(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}

function generateRandomSize(): number {
  return faker.number.int({
    min: 100 * 1024 * 1024,
    max: 50 * 1024 * 1024 * 1024,
  });
}

function generateRandomHash(): string {
  const chars = "0123456789abcdef";
  let hash = "";
  for (let i = 0; i < 40; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

function generateRandomName(): string {
  const choices = [
    faker.commerce.productName(),
    faker.system.fileName(),
    faker.music.songName(),
    faker.person.fullName(),
    faker.word.words({ count: { min: 2, max: 5 } }),
  ];
  return faker.helpers.arrayElement(choices).replace(/\s+/g, ".");
}

export default function MagnetLinksGenerator() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialMin = Number(searchParams.get("min")) || 120;
  const initialMax = Number(searchParams.get("max")) || 270;

  const [magnetLinks, setMagnetLinks] = useState<MagnetLink[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [minLinks, setMinLinks] = useState(initialMin);
  const [maxLinks, setMaxLinks] = useState(initialMax);

  const handleCopy = async (magnetUrl: string, index: number) => {
    try {
      await navigator.clipboard.writeText(magnetUrl);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy magnet link:", err);
    }
  };

  const updateSearchParams = (min: number, max: number) => {
    const params = new URLSearchParams();
    params.set("min", String(min));
    params.set("max", String(max));
    router.replace(`?${params.toString()}`);
  };

  const generateMagnetLinks = () => {
    if (minLinks > maxLinks) {
      alert("⚠️ Min cannot be greater than Max");
      return;
    }

    updateSearchParams(minLinks, maxLinks);

    setIsGenerating(true);

    const count = faker.number.int({ min: minLinks, max: maxLinks });
    const links: MagnetLink[] = [];

    for (let i = 0; i < count; i++) {
      const name = generateRandomName();
      const hash = generateRandomHash().toLowerCase();
      const size = formatBytes(generateRandomSize());

      const trackers = [
        "udp://tracker.openbittorrent.com:80",
        "udp://tracker.publicbt.com:80",
        "udp://tracker.ccc.de:80",
      ];

      const magnetUrl = `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(
        name
      )}${trackers.map((tr) => `&tr=${tr}`).join("")}`;

      links.push({ name, hash, magnetUrl, size });
    }

    setMagnetLinks(links);
    setTimeout(() => setIsGenerating(false), 500);
  };

  useEffect(() => {
    generateMagnetLinks();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-8 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto max-w-4xl text-center relative">
          <Badge variant="secondary" className="mb-3 text-sm px-3 py-1">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
            Test Generator
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 text-balance leading-tight">
            Random <span className="text-primary">Magnet Links</span> Generator
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-4 text-pretty max-w-2xl mx-auto">
            Generate realistic fake magnet links for testing Magneto.
          </p>
        </div>
      </section>

      {/* Configuration Section */}
      <section className="py-6 px-4 bg-muted/50">
        <div className="container mx-auto max-w-5xl">
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Left: Icon and Title */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Settings className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-lg font-bold mb-0.5">Configuration</CardTitle>
                    <CardDescription className="text-xs">
                      Customize link generation
                    </CardDescription>
                  </div>
                </div>

                {/* Center: Inputs */}
                <div className="flex gap-3 items-end">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="minLinks" className="text-xs font-medium">
                      Min Links
                    </Label>
                    <Input
                      id="minLinks"
                      type="number"
                      value={minLinks}
                      onChange={(e) => setMinLinks(Number(e.target.value))}
                      className="w-24 text-center h-9"
                      min={1}
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="maxLinks" className="text-xs font-medium">
                      Max Links
                    </Label>
                    <Input
                      id="maxLinks"
                      type="number"
                      value={maxLinks}
                      onChange={(e) => setMaxLinks(Number(e.target.value))}
                      className="w-24 text-center h-9"
                      min={1}
                    />
                  </div>
                </div>

                {/* Center-Right: Badges */}
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <Badge variant="secondary" className="text-xs px-2.5 py-0.5">
                    Generating: <span className="font-bold ml-1">{magnetLinks.length}</span>
                  </Badge>
                  <Badge variant="outline" className="text-xs px-2.5 py-0.5 font-mono">
                    ?min={minLinks}&max={maxLinks}
                  </Badge>
                </div>

                {/* Right: Button */}
                <div className="flex-shrink-0">
                  <Button
                    onClick={generateMagnetLinks}
                    disabled={isGenerating}
                    className="px-6 gap-2"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`}
                    />
                    {isGenerating ? "Generating..." : "Generate"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Generated Links Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Generated Magnet Links
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Click any link to copy it to your clipboard
            </p>
          </div>

          <div className="grid gap-4">
            {magnetLinks.map((link, index) => (
              <Card
                key={index}
                className="border-2 hover:border-primary/50 transition-all hover:shadow-md group"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0 flex gap-4">
                      {/* Icon */}
                      <div className="w-11 h-11 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors mt-0.5">
                        <LinkIcon className="h-5 w-5 text-primary" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Title */}
                        <h3 className="font-semibold text-base text-foreground truncate leading-snug">
                          {link.name}
                        </h3>
                        
                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Download className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="font-medium">{link.size}</span>
                          </div>
                          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="font-mono bg-muted/50 px-2 py-0.5 rounded">
                              {link.hash.substring(0, 8)}...{link.hash.substring(32, 40)}
                            </span>
                          </div>
                          <Badge variant="secondary" className="text-xs px-2 py-0 h-5">
                            #{index + 1}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      <Button
                        variant={copiedIndex === index ? "default" : "outline"}
                        size="sm"
                        className={`gap-2 font-medium min-w-[100px] transition-all ${
                          copiedIndex === index ? "bg-green-600 hover:bg-green-700 border-green-600" : ""
                        }`}
                        onClick={() => handleCopy(link.magnetUrl, index)}
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Clipboard className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 px-4 bg-muted/50">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-muted-foreground text-base">
            Generated <span className="font-bold text-foreground">{magnetLinks.length}</span> magnet links
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            These are randomly generated fake magnet links for testing purposes only
          </p>
          
          <div className="mt-8">
            <Link href="/">
              <Button variant="outline" size="lg" className="px-6 py-5 text-base font-semibold">
                ← Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
