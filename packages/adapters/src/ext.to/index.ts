import type { RawMagnetLinkData, SourceAdapter } from "@magneto/types";
import { extractMagnetLinkData } from "./extractor";

export const ExtToAdapter: SourceAdapter = {
  name: "ext-to",
  displayName: "Ext.to",
  domains: ["ext.to", "www.ext.to"],
  handler(document, location) {
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
  },
};
