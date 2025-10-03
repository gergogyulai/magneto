import { RawMagnetLinkData } from "@magneto/types";
import { extractNameFromMagnet } from "../utils";

export function extractMagnetLinkData(
  boxInfo: HTMLDivElement,
): RawMagnetLinkData[] {
  const rawMagnetLinkData: RawMagnetLinkData[] = [];
  const magnetLinks = boxInfo.querySelectorAll('a[href^="magnet:"]');

  magnetLinks.forEach((element) => {
    const magnetLink = element.getAttribute("href");
    if (magnetLink && magnetLink.startsWith("magnet:")) {
      rawMagnetLinkData.push({
        magnetLink: magnetLink,
        source: "1337x",
        name: extractNameFromMagnet(magnetLink) || undefined,
        scrapedAt: new Date().toISOString(),
      });
    }
  });
  
  return rawMagnetLinkData;
}