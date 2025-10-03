import type { MagnetRecord, StoredMagnets, RawMagnetLinkData, MagnetoOptions } from "@magneto/types";
import { CollectionMode } from "@magneto/types";
import { handleExportMagnets } from "@/lib/stash-exporter";
import { STORAGE_KEYS } from "@/lib/constants";
import { initializeStorage } from "@/lib/init";
import { normalizeMagnetData } from "@/lib/normalizer";

type MessageResponse = { success: boolean; error?: string } & Record<
  string,
  any
>;

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(initializeStorage);
  browser.runtime.onMessage.addListener(handleMessage);
});

async function handleMessage(request: any): Promise<MessageResponse> {
  try {
    switch (request.type) {
      case "MAGNET_LINKS":
        return await handleMagnetLinks(request.magnetLinks);
      case "EXPORT_MAGNETS":
        return await handleExportMagnets(request.format);
      case "TOGGLE_COLLECTION":
        return { success: true, message: "Collection toggle message received" };
      default:
        return { success: false, error: "Unknown message type" };
    }
  } catch (error) {
    console.error("Error handling message:", error);
    return { success: false, error: (error as Error).message };
  }
}

async function handleMagnetLinks(newMagnetLinks: RawMagnetLinkData[]): Promise<MessageResponse> {
  if (!Array.isArray(newMagnetLinks) || newMagnetLinks.length === 0) return { success: false, error: "No magnet links" };

  const options = (await storage.getItem<MagnetoOptions>(STORAGE_KEYS.OPTIONS));
  
  const normalizedLinks = newMagnetLinks.map((raw) => normalizeMagnetData(raw, { minimalCollectionMode: options!.minimalCollectionMode }));

  const deduplicatedLinks = Array.from(
    new Map(normalizedLinks.map((link) => [link.infoHash, link])).values()
  );

  const existingLinks = (await storage.getItem<StoredMagnets>(STORAGE_KEYS.STASH)) || [];
  const existingInfoHashes = new Set(existingLinks.map((link) => link.infoHash));
  const uniqueNewLinks = deduplicatedLinks.filter((link) => !existingInfoHashes.has(link.infoHash));
  
  // Todo: consider merging updates to existing links
  
  if (uniqueNewLinks.length === 0) {
    return { success: true, message: "No new unique magnet links to add" };
  }

  const updatedStash = [...existingLinks, ...uniqueNewLinks];
  await storage.setItem(STORAGE_KEYS.STASH, updatedStash);
  
  await broadcastUpdate(updatedStash, uniqueNewLinks);

  return {
    success: true,
  };
}

async function broadcastUpdate(
  updatedLinks: MagnetRecord[],
  newLinks: MagnetRecord[]
): Promise<void> {
  const message = {
    type: "MAGNET_LINKS_UPDATED",
    count: updatedLinks.length,
    addedCount: newLinks.length,
    newLinks,
  };

  try {
    await browser.runtime.sendMessage(message);
  } catch (error) {
    console.debug("Could not broadcast update - UI likely closed");
  }
}
