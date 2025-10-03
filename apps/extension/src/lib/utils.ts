import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { minimatch } from "minimatch";
import { STORAGE_KEYS } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function extractNameFromMagnet(magnetLink: string): string | null {
  try {
    const url = new URL(magnetLink);
    const dn = url.searchParams.get("dn");
    return dn ? decodeURIComponent(dn.replace(/\+/g, " ")) : null;
  } catch {
    return null;
  }
}

export async function checkWhitelist(url: string): Promise<boolean> {
  const whitelist =
    (await storage.getItem<string[]>(STORAGE_KEYS.WHITELISTED_HOSTS)) || [];

  return whitelist.some((pattern) => minimatch(url, pattern, { nocase: true }));
}

export function minimatchPatternHostname(host: string): string {
    // Detect URL‑like pattern
    const urlLikePattern = /^\{?https?,?https?\}?:\/\/([^/]+)(\/.*)?$/i;
    const match = host.match(urlLikePattern);

    if (match) {
      const hostname = match[1];

      // If hostname contains wildcards, keep full pattern
      if (hostname.includes("*")) {
        return host;
      }

      // Otherwise just return the hostname part
      return hostname;
    }

    // Not a URL-ish pattern → return full
    return host;
  }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
