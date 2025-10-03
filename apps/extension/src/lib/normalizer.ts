import type {
  RawMagnetLinkData,
  MagnetRecord,
  MinimalMagnetRecord,
  MinimalCollectionModeOptions,
} from "@magneto/types";
import { CollectionMode } from "@magneto/types";
import { extractNameFromMagnet } from "@/lib/utils";

export function extractInfoHash(magnetLink: string): string {
  const match = magnetLink.match(/urn:btih:([a-zA-Z0-9]+)/i);
  if (!match) return "";
  return match[1].toLowerCase();
}

export function parseSize(sizeStr?: string): number | null {
  if (!sizeStr) return null;

  const match = sizeStr
    .toUpperCase()
    .trim()
    .match(/^([\d.]+)\s*(B|KB|MB|GB|TB)$/);

  if (!match) return null;

  const value = parseFloat(match[1]);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
  };

  return Math.round(value * multipliers[unit]);
}

export function parseIntSafe(numStr?: string): number | null {
  if (!numStr) return null;
  const parsed = parseInt(numStr.replace(/,/g, ""), 10);
  return isNaN(parsed) ? null : parsed;
}


export function normalizeMagnetData(
  raw: RawMagnetLinkData,
  options: { minimalCollectionMode: MinimalCollectionModeOptions }
): MagnetRecord {
  const { minimalCollectionMode } = options;
  const infoHash = extractInfoHash(raw.magnetLink);

  const embeddedName = extractNameFromMagnet(raw.magnetLink);
  const bestName = raw.name ?? embeddedName ?? null;

  const base: MinimalMagnetRecord = {
    infoHash,
    source: raw.source,
    scrapedAt: raw.scrapedAt,
  };

  if (minimalCollectionMode.enabled) {
    return base;
  }
  if (minimalCollectionMode.enabled && minimalCollectionMode.collectNames) {
    return {
      ...base,
      name: bestName,
    };
  }

  return {
    ...base,
    magnetLink: raw.magnetLink,
    name: bestName,
    sizeBytes: parseSize(raw.size),
    seeds: parseIntSafe(raw.seeds),
    leechers: parseIntSafe(raw.leechers),
    category: raw.category ?? null,
  };
}