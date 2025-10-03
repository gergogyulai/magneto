import type {
  MagnetRecord,
  RawMagnetLinkData,
  SourceAdapter,
  CollectionMode,
} from "@magneto/types";
import { getAdapter } from "@magneto/adapters";
import { STORAGE_KEYS } from "@/lib/constants";
import { checkWhitelist } from "@/lib/utils";

console.log("Content script loaded");

export default defineContentScript({
  matches: ["https://*/*", "http://*/*"],
  runAt: "document_end",
  matchAboutBlank: false,
  registration: "manifest",
  main: () => {
    console.log("Content script main function executing");
    browser.runtime.onMessage.addListener(async (message, sender) => {
      try {
        switch (message.type) {
          case "TOGGLE_COLLECTION":
            console.log("Toggling collection");
            return await handleToggle();
          case "COLLECT_MAGNETS":
            console.log("Manual collection triggered");
            return await handleManualCollection();
          default:
            return { success: false, error: "Unknown message type" };
        }
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });
    console.log("Setting up storage listener");
    storage
      .getItem<boolean>(STORAGE_KEYS.COLLECTION_ENABLED)
      .then((isCollecting) => {
        console.log("Initial collection state:", isCollecting);
        if (isCollecting) {
          startWatching();
        }
      });

    storage.watch<boolean>(STORAGE_KEYS.COLLECTION_ENABLED, (newValue) => {
      console.log("Collection enabled changed to:", newValue);
      if (newValue) {
        startWatching();
      } else {
        stopWatching();
      }
    });
  },
});

async function handleToggle(): Promise<{
  success: boolean;
  error?: string;
}> {
    if (!checkWhitelist(location.href)) {
    return { success: false, error: "Host not in whitelist" };
  }
  const current =
    (await storage.getItem<boolean>(STORAGE_KEYS.COLLECTION_ENABLED)) || false;
  const newValue = !current;
  await storage.setItem(STORAGE_KEYS.COLLECTION_ENABLED, newValue);
  newValue ? await startWatching() : await stopWatching();
  return { success: true };
}

async function handleManualCollection(): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!checkWhitelist(location.href)) {
    return { success: false, error: "Host not in whitelist" };
  }

  const rawData = extractMagnetData(document, location);
  await saveMagnets(rawData);

  return { success: true };
}

let observer: MutationObserver | null = null;

async function startWatching(): Promise<void> {
  console.log("Starting to watch for magnet links...");

  if (!checkWhitelist(location.href)) {
    console.log("Hostname not in whitelist, not watching");
    return;
  }
  if (observer) {
    console.log("Observer already exists");
    return;
  }

  console.log("Setting up mutation observer");
  observer = new MutationObserver(() => {
    console.log("DOM mutation detected, extracting magnets");
    const rawData = extractMagnetData(document, location);
    saveMagnets(rawData);
  });

  observer.observe(document.body, { childList: true, subtree: true });

  console.log("Performing initial magnet extraction");
  const rawData = extractMagnetData(document, location);
  saveMagnets(rawData);
}

function stopWatching(): void {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

/**
 * ---- Adapter Extraction ----
 */
function extractMagnetData(
  document: Document,
  location: Location
): RawMagnetLinkData[] {
  const adapter = getAdapter(location.hostname);
  return adapter.handler(document, location);
}

async function saveMagnets(
  rawMagnetLinkData: RawMagnetLinkData[]
): Promise<void> {
  console.log("Saving magnets:", rawMagnetLinkData.length, "found");
  if (rawMagnetLinkData.length > 0) {
    await browser.runtime.sendMessage({
      type: "MAGNET_LINKS",
      magnetLinks: rawMagnetLinkData,
    });
  }
}
