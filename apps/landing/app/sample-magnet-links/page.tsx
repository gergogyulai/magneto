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
import { RefreshCw, Link, Download, Check, Clipboard } from "lucide-react";

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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
              <Download className="h-8 w-8" />
              Random Magnet Links Generator
            </CardTitle>
            <CardDescription className="text-lg">
              Generates {magnetLinks.length} random magnet links
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 justify-center">
              <div className="flex flex-col">
                <Label htmlFor="minLinks">Min Links</Label>
                <Input
                  id="minLinks"
                  type="number"
                  value={minLinks}
                  onChange={(e) => setMinLinks(Number(e.target.value))}
                  className="w-24 text-center"
                  min={1}
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="maxLinks">Max Links</Label>
                <Input
                  id="maxLinks"
                  type="number"
                  value={maxLinks}
                  onChange={(e) => setMaxLinks(Number(e.target.value))}
                  className="w-24 text-center"
                  min={1}
                />
              </div>
            </div>
            <div className="text-center">
              <Button
                onClick={generateMagnetLinks}
                disabled={isGenerating}
                size="lg"
                className="gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`}
                />
                {isGenerating ? "Generating..." : "Generate New Links"}
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-3">
          {magnetLinks.map((link, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <h3 className="font-medium truncate">{link.name}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Size: {link.size}</span>
                      <span className="font-mono text-xs">
                        Hash: {link.hash.substring(0, 16)}...
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0 bg-transparent gap-2"
                    onClick={() => handleCopy(link.magnetUrl, index)}
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="h-3 w-3 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Clipboard className="h-3 w-3" />
                        Copy Magnet
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Generated {magnetLinks.length} magnet links • Refresh or click the
            button to generate new ones
          </p>
          <p className="mt-1">
            Current config:{" "}
            <code>
              ?min={minLinks}&max={maxLinks}
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
