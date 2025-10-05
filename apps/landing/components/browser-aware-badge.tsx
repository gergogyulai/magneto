import { Badge } from "@/components/ui/badge";

import { Firefox } from "@/components/firefox-logo";
import { Chrome } from "@/components/chrome-logo";
import { Edge } from "@/components/edge-logo";

import { storeUrls } from "@/lib/content";

import { headers } from "next/headers";
import { userAgent } from "next/server";

const browserConfig = {
  Chrome: {
    icon: Chrome,
    minimumVersion: 114,
    store: storeUrls.chrome,
  },
  Firefox: {
    icon: Firefox,
    minimumVersion: 134,
    store: storeUrls.firefox,
  },
  Edge: {
    icon: Edge,
    minimumVersion: 114,
    store: storeUrls.edge,
  },
} as const;

export default async function BrowserAwareBadge() {
  const headersList = await headers();
  const { browser } = userAgent({ headers: headersList });

  const browserName = (browser.name || "Chrome") as keyof typeof browserConfig;
  const config = browserConfig[browserName] || browserConfig.Chrome;
  const Icon = config.icon;

  return (
    <Badge variant="secondary" className="mb-6 text-sm px-4 py-1.5">
      <Icon className="w-3.5 h-3.5 mr-1.5 inline" />
      {browserName} Extension • Requires {browserName} {config.minimumVersion}+
    </Badge>
  );
}
