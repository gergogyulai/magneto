import type { SourceAdapter } from "@magneto/types";
import { extractMagnetLinkData } from "./extractor";

export const KnabenOrgAdapter: SourceAdapter = {
  name: "knaben-org",
  displayName: "Knaben.org",
  domains: ["knaben.org", "www.knaben.org"],

  handler(document, location) {
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
  },
};
