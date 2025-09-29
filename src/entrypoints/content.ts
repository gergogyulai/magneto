import type {
  MagnetRecord,
  RawMagnetLinkData,
  SourceAdapter,
  CollectionMode,
} from "@/lib/types.new";
import { getAdapter } from "@/lib/adapters";
import { STORAGE_KEYS } from "@/lib/constants";
import { initialize } from "wxt";

export default defineContentScript({
  matches: ["https://*/*", "http://*/*"],
  runAt: "document_end",
  matchAboutBlank: false,
  registration: "manifest",
  main: () => {
    browser.runtime.onMessage.addListener(async (message, sender) => {
      try {
        switch (message.type) {
          case "TOGGLE_COLLECTION":
            return await handleToggle();
          case "COLLECT_MAGNETS":
            return await handleManualCollection();
          default:
            return { success: false, error: "Unknown message type" };
        }
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    storage
      .getItem<boolean>(STORAGE_KEYS.COLLECTION_ENABLED)
      .then((isCollecting) => {
        if (isCollecting) {
          startWatching();
        }
      });

    storage.watch<boolean>(STORAGE_KEYS.COLLECTION_ENABLED, (newValue) => {
      if (newValue) {
        startWatching();
      } else {
        stopWatching();
      }
    });
  },
});

async function handleToggle(): Promise<{ success: boolean }> {
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
  const whitelist =
    (await storage.getItem<string[]>(STORAGE_KEYS.WHITELISTED_HOSTS)) || [];

  if (!whitelist.includes(location.hostname)) {
    return { success: false, error: "Host not in whitelist" };
  }

  const rawData = extractMagnetData(document, location);
  await saveMagnets(rawData);

  return { success: true };
}

let observer: MutationObserver | null = null;

async function startWatching(): Promise<void> {
  const whitelist =
    (await storage.getItem<string[]>(STORAGE_KEYS.WHITELISTED_HOSTS)) || [];

  if (!whitelist.includes(location.hostname)) return;
  if (observer) return;

  observer = new MutationObserver(() => {
    const rawData = extractMagnetData(document, location);
    saveMagnets(rawData);
  });

  observer.observe(document.body, { childList: true, subtree: true });

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
  return adapter(document, location);
}

async function saveMagnets(
  rawMagnetLinkData: RawMagnetLinkData[]
): Promise<void> {
  await browser.runtime.sendMessage({
    type: "MAGNET_LINKS",
    payload: rawMagnetLinkData,
  });
}
