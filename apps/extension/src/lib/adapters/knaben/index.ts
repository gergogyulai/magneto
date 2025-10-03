import type { RawMagnetLinkData } from "@magneto/types";

function extractMagnetLinkData(
  tableElement: HTMLTableElement
): RawMagnetLinkData[] {
  const rawMagnetLinkData: RawMagnetLinkData[] = [];
  const rows = tableElement.querySelectorAll("tbody tr");

  rows.forEach((row) => {
    const categoryElement = row.querySelector("td:nth-child(1) a");
    const titleElement = row.querySelector("td:nth-child(2) a:nth-child(1)");
    const sizeElement = row.querySelector("td:nth-child(3)");
    const seedersElement = row.querySelector("td:nth-child(5)");
    const leechersElement = row.querySelector("td:nth-child(6)");
    const originalSourceElement = row.querySelector("td:nth-child(7) a");
    const magnetLinkElement = row.querySelector(
      "td:nth-child(2) a[href^='magnet:']"
    );

    const scrapedAt = new Date().toISOString();

    if (
      categoryElement &&
      titleElement &&
      sizeElement &&
      seedersElement &&
      leechersElement &&
      originalSourceElement
    ) {
      const category = categoryElement.textContent?.trim();
      const name = titleElement.textContent?.trim();
      const size = sizeElement.textContent?.trim();
      const seeds = seedersElement.textContent?.trim();
      const leechers = leechersElement.textContent?.trim();
      const originalSource = originalSourceElement.textContent?.trim();

      const source = originalSource
        ? `knaben.org (${originalSource})`
        : "knaben.org";

      const magnetLink = magnetLinkElement
        ? magnetLinkElement.getAttribute("href") || ""
        : "";

      rawMagnetLinkData.push({
        name,
        magnetLink,
        size,
        seeds,
        leechers,
        category,
        source,
        scrapedAt,
      });
    }
  });

  return rawMagnetLinkData;
}

export function KnabenOrgAdapter(
  document: Document,
  location: Location
): RawMagnetLinkData[] {
  if (!document || !location) return [];

  if (location.pathname.startsWith("/browse/")) {
    return extractMagnetLinkData(
      document.querySelector(
        "body > section:nth-child(2) > div > div:nth-child(7) > table"
      )!
    );
  } else if (location.pathname.startsWith("/search/")) {
    return extractMagnetLinkData(
      document.querySelector(
        "body > section:nth-child(2) > div > div.p-3 > table"
      )!
    );
  } else {
    return [];
  }
}
