import type { RawMagnetLinkData } from "@magneto/types";

export function extractMagnetLinkData(
  tableElement: HTMLTableElement,
  categoryFromTitle: string | undefined
): RawMagnetLinkData[] {
  const rawMagnetLinkData: RawMagnetLinkData[] = [];
  const rows = tableElement.querySelectorAll("tbody tr");

  rows.forEach((row) => {
    const titleElement = row.querySelector("td.text-left a b");
    const magnetLinkElement = row.querySelector(
      "td.text-left a[href^='magnet:']"
    );
    const sizeElement = row.querySelector("td:nth-child(2) span:nth-child(2)");
    const seedersElement = row.querySelector(
      "td:nth-child(5) span.text-success"
    );
    const leechersElement = row.querySelector(
      "td:nth-child(6) span.text-danger"
    );
    const scrapedAt = new Date().toISOString();

    if (
      titleElement &&
      magnetLinkElement &&
      sizeElement &&
      seedersElement &&
      leechersElement
    ) {
      const name = titleElement.textContent?.trim();
      const magnetLink = magnetLinkElement.getAttribute("href") || "";
      const size = sizeElement.textContent?.trim();
      const seeds = seedersElement.textContent?.trim();
      const leechers = leechersElement.textContent?.trim();
      const category = categoryFromTitle ? categoryFromTitle : "Unknown";
      const source = "ext.to";

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
