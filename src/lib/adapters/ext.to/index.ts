import { RawMagnetLinkData } from "@/lib/types";

function extractMagnetLinkData(tableElement: HTMLTableElement): RawMagnetLinkData[] {
  const rawMagnetLinkData: RawMagnetLinkData [] = [];
  const rows = tableElement.querySelectorAll("tbody tr");

  rows.forEach((row) => {
    const torrentNameElement = row.querySelector(".float-left a b");
    const magnetLinkElement = row.querySelector(
      "a.dwn-btn.torrent-dwn[href^='magnet:']"
    );

    if (torrentNameElement && magnetLinkElement) {
      const name = torrentNameElement.textContent?.trim() || "";
      const magnetLink = magnetLinkElement.getAttribute("href") || "";
      rawMagnetLinkData.push({ name, magnetLink });
    }
  });

  return rawMagnetLinkData;
}

export function extToAdapter(document: Document, location: Location): RawMagnetLinkData[] {
  if (!document || !location) return [];
  if (location.pathname == "/") {
    return extractMagnetLinkData(document.querySelector("table.table-striped.table-hover")!);
  } else if (location.pathname.startsWith("/browse/")) {
    return extractMagnetLinkData(document.querySelector("table.table-striped.table-hover.search-table")!);
  } else { return [] } 
}