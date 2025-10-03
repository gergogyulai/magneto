import type { SourceAdapterKey } from "@magneto/adapters";

/**
 * Mode selection for what data is collected/stored.
 * - Minimal: only hash, source, date
 * - Full: full torrent metadata if available
 */
export enum CollectionMode {
  Minimal = "minimal",
  MinimalWithName = "minimal_with_name",
  Full = "full",
}

/**
 * Raw data directly scraped from provider pages.
 * This is messy/unstructured and needs normalization.
 */
export type RawMagnetLinkData = {
  magnetLink: string;
  name?: string;
  size?: string; // e.g. "1.4 GB"
  seeds?: string; // numeric string "1234"
  leechers?: string;
  category?: string;
  source: string; // provider name/domain
  scrapedAt: string; // ISO timestamp
};

/**
 * Core required fields for any record (minimal mode).
 */
export type MinimalMagnetRecord = {
  infoHash: string; // canonical torrent ID
  source: string;
  scrapedAt: string; // ISO timestamp
};

/**
 * Full record extends minimal with optional metadata.
 * If mode is minimal -> only infoHash, source, scrapedAt are populated.
 * If mode is full -> extra fields are filled when available.
 */
export type MagnetRecord = MinimalMagnetRecord & {
  magnetLink?: string;
  name?: string | null;
  sizeBytes?: number | null;
  seeds?: number | null;
  leechers?: number | null;
  category?: string | null;
};

/**
 * Storage payload: since localStorage only saves strings,
 * you'll be serializing arrays of MagnetRecord into JSON.
 */
export type StoredMagnets = MagnetRecord[];

export type ExportFormats = "json" | "csv" | "txt";

export type MagnetoOptions = {
  minimalCollectionMode: { enabled: boolean; collectNames: boolean };
  rollingCollection: { enabled: boolean; limit: number };
  adapters: Partial<Record<SourceAdapterKey, boolean>>;
};

export interface SourceAdapter {
  /** Stable machine‑friendly identifier (e.g. "knaben-org") */
  name: string;

  /** User‑friendly label (e.g. "Knaben.org") */
  displayName: string;

  /** List of hostnames this adapter applies to */
  domains: string[];

  /** Main extractor/handler */
  handler(document: Document, location: Location): RawMagnetLinkData[];
}