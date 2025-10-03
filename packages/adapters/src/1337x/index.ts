import type { SourceAdapter } from "@magneto/types";
import { extractMagnetLinkData } from "./extractor";

export const Adapter1337x: SourceAdapter = {
  name: "1337x",
  displayName: "1337x",
  domains: [
    "1337x.to",
    "1337x.st",
    "x1337x.ws",
    "x1337x.eu",
    "x1337x.se",
    "x1337x.cc",
  ],

  handler(document, location) {
    if (!document || !location) return [];

    if (location.pathname.startsWith("/torrent/")) {
      return extractMagnetLinkData(
        document.querySelector(
          ".box-info.torrent-detail-page"
        ) as HTMLDivElement
      );
    } else {
      return [];
    }
  },
};


