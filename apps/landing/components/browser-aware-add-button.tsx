import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Firefox } from "@/components/firefox-logo";
import { Chrome } from "@/components/chrome-logo";
import { storeUrls } from "@/lib/content";

import { headers } from "next/headers";
import { userAgent } from "next/server";

const browserConfig = {
  Chrome: {
    icon: Chrome,
    store: storeUrls.chrome,
  },
  Firefox: {
    icon: Firefox,
    store: storeUrls.firefox,
  },
  Edge: {
    icon: Chrome,
    store: storeUrls.edge,
  },
} as const;

export default async function BrowserAwareAddButton({
  text,
}: {
  text?: string;
}) {
  const headersList = await headers();
  const { browser } = userAgent({ headers: headersList });

  const browserName = (browser.name || "Chrome") as keyof typeof browserConfig;
  const config = browserConfig[browserName] || browserConfig.Chrome;
  const Icon = config.icon;
  const isAvailable = config.store.available;
  const addButtonText = text || `Add to ${browserName}`;

  const buttonContent = (
    <Button
      size="lg"
      className="px-8 py-6 text-base font-semibold text-foreground"
      disabled={!isAvailable}
    >
      <Icon />
      {addButtonText}
    </Button>
  );

  if (!isAvailable) {
    return buttonContent;
  }

  return (
    <Link href={config.store.url} target="_blank" rel="noopener noreferrer">
      {buttonContent}
    </Link>
  );
}
