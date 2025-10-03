import type { RawMagnetLinkData } from "@magneto/types";

const isWaybackSnapshot = (loc: Location) =>
	  loc.hostname === "web.archive.org" && /^\/web\/\d{14}\//.test(loc.pathname);

const waybackHostname = (loc: Location): string | null => {
  if (loc.hostname !== "web.archive.org") return null;

  const match = loc.pathname.match(/^\/web\/\d{14}[^/]*\/(.*)$/);
  
  if (!match) return null;

  try {
    const original = new URL(decodeURIComponent(match[1]));
    return original.hostname;
  } catch {
    return null;
  }
};

function waybackMachineLinkToOriginal(link: string): string | null {
  try {
    const url = new URL(link);

    const pathMatch = url.pathname.match(/^\/web\/\d+(?:[^/]*)\/(.+)$/);

    if (pathMatch && pathMatch[1]) {
      return decodeURIComponent(pathMatch[1] + url.search);
    }
    return null;
  } catch {
    return null;
  }
}

function waybackMachineSubAdapter(
  document: Document,
  location: Location
): RawMagnetLinkData[] {
  const rawMagnetLinkData: RawMagnetLinkData[] = [];
  const magnetLinkElements = document.querySelectorAll(
    'a[href^="https://web.archive.org/web/"][href*="magnet:"]'
  );

  magnetLinkElements.forEach((element) => {
    const href = element.getAttribute("href");
    if (href) {
      const originalMagnetLink = waybackMachineLinkToOriginal(href);
      if (originalMagnetLink) {
        rawMagnetLinkData.push({
          magnetLink: originalMagnetLink,
          source: `web.archive.org (${waybackHostname(location) || "unknown"})`,
          scrapedAt: new Date().toISOString(),
        });
      }
    }
  });

  return rawMagnetLinkData;
}

function detailsPageSubAdapter(
  document: Document,
): RawMagnetLinkData[] {
  const rawMagnetLinkData: RawMagnetLinkData[] = [];
  return rawMagnetLinkData;
}

export function ArchiveOrgAdapter(
  document: Document,
  location: Location
): RawMagnetLinkData[] {  
  if (!document || !location) return [];

  if (isWaybackSnapshot(location)) {
    console.log("Detected Wayback Machine snapshot");
    return waybackMachineSubAdapter(document, location);
  } else if (location.pathname.startsWith("/details/")) {
    return detailsPageSubAdapter(document);
  } else {
    return [];
  }
}