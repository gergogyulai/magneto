import type { SourceAdapter } from "@magneto/types";
import { waybackMachineSubAdapter } from "./extractor";

const isWaybackSnapshot = (loc: Location) =>
	  loc.hostname === "web.archive.org" && /^\/web\/\d{14}\//.test(loc.pathname);

export const WaybackMachineAdapter: SourceAdapter = {
  name: "wayback-machine",
  displayName: "Wayback Machine",
  domains: ["web.archive.org"],
	  handler(document, location) {
    if (!document || !location) return [];

    if (isWaybackSnapshot(location)) {
      console.log("Detected Wayback Machine snapshot");
      return waybackMachineSubAdapter(document, location);
    } else {
      return [];
    }
  }
};