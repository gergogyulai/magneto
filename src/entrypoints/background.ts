// background.ts
import type { MagnetRecord, RawMagnetLinkData } from "@/lib/types";
import { handleExportMagnets } from "@/lib/stash-exporter";
import "@/lib/console";

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {
      try {
        if (request.type === "MAGNET_LINKS") {
          console.log("Received magnet links:", request?.magnetLinks);

          const result = await handleNewMagnetLinks(request?.magnetLinks);
          return { success: true, ...result };
        }

        if (request.type === "EXPORT_MAGNETS") {
          console.log("Exporting magnets in format:", request.format);
          const result = await handleExportMagnets(request.format);
          return result;
        }
      } catch (error) {
        console.error("Error handling message:", error);
        return { success: false, error: (error as Error).message };
      }
    }
  );
});

async function handleNewMagnetLinks(newMagnetLinks: RawMagnetLinkData[]): Promise<{ addedCount: number; totalCount: number }> {
  const existingLinks: MagnetRecord[] = await storage.getItem("local:magneto-stash") || [];

  const newLinks = newMagnetLinks.filter((link) => !existingLinks.some((existing) => existing.magnetLink === link.magnetLink));

  if (newLinks.length === 0)
    return { addedCount: 0, totalCount: existingLinks.length };

  const updatedLinks = [...existingLinks, ...newLinks];
  await storage.setItem("local:magneto-stash", updatedLinks);

  const message = {
    type: "MAGNET_LINKS_UPDATED",
    count: updatedLinks.length,
    addedCount: newLinks.length,
    newLinks,
  };

  try {
    await browser.runtime.sendMessage(message);
  } catch {}

  return {
    addedCount: newLinks.length,
    totalCount: updatedLinks.length,
  };
}
