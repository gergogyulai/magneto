import type { RawMagnetLinkData, SourceAdapter } from "@magneto/types";

function extractMagnetLinkData(
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

export const ExtToAdapter: SourceAdapter = {
  name: "ext-to",
  displayName: "Ext.to",
  domains: ["ext.to", "www.ext.to"],

  handler(document: Document, location: Location): RawMagnetLinkData[] {
    if (!document || !location) return [];

    const rawMagnetLinkData: RawMagnetLinkData[] = [];

    const mainContentBlock = document.querySelector(
      "body > div.container-fluid > div > div > div.col-12.col-md-12.col-xl-10.py-md-3.bd-content.main-block"
    );

    if (mainContentBlock) {
      const cardSections = mainContentBlock.querySelectorAll(
        "div.card.card-nav-tabs.main-raised"
      );

      cardSections.forEach((section) => {
        const categoryAnchor = section.querySelector(
          "div.title-block-with-tabs.card-title-header-block-main.custom-nav-tabs > h4 > a"
        );
        let categoryFromTitle: string | undefined;
        if (categoryAnchor) {
          categoryFromTitle = categoryAnchor.textContent
            ?.replace(" Torrents", "")
            .replace(/\s*<span><\/span>/, "")
            .trim();
        }

        const activeTabPane = section.querySelector(
          ".tab-content > .tab-pane.active"
        );

        if (activeTabPane) {
          const tableElement = activeTabPane.querySelector(
            "table.table.table-striped.table-hover"
          );
          if (tableElement) {
            rawMagnetLinkData.push(
              ...extractMagnetLinkData(
                tableElement as HTMLTableElement,
                categoryFromTitle
              )
            );
          }
        }
      });
    }

    return rawMagnetLinkData;
  }
};
