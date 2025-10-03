import type { RawMagnetLinkData, SourceAdapter } from "@magneto/types";
import { extractNameFromMagnet } from "./utils.js";

export const GenericAdapter: SourceAdapter = {
  name: "generic",
  displayName: "Generic",
  domains: [],

  handler(document: Document, location: Location): RawMagnetLinkData[] {
    if (!document || !location) return [];

    const magnetLinks: RawMagnetLinkData[] = [];
    const anchorElements = Array.from(
      document.querySelectorAll('a[href^="magnet:"]')
    ) as HTMLAnchorElement[];

    anchorElements.forEach((anchor) => {
      const href = anchor.href;
      if (href && href.startsWith("magnet:")) {
        const name = extractNameFromMagnet(href);
        magnetLinks.push({
          magnetLink: href,
          source: location.hostname,
          name: name || undefined,
          scrapedAt: new Date().toISOString()
        });
      }
    });

    return magnetLinks;
  }
};
