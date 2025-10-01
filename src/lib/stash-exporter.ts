import type { MagnetRecord } from "@/lib/types";
import { STORAGE_KEYS } from "@/lib/constants";

interface ExportResult {
  success: boolean;
  downloadId?: number;
  error?: string;
}

export async function handleExportMagnets(format: string): Promise<ExportResult> {
  try {
    const magnetLinks: MagnetRecord[] = await storage.getItem(STORAGE_KEYS.STASH) || [];
    
    if (!magnetLinks.length) return { success: false, error: "No magnet links found to export" };

    const { content, mimeType, ext } = formatContent(magnetLinks, format);

    const dataUrl = `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`;
    
    const downloadId = await downloadFile(dataUrl, `magneto-stash-${Date.now()}.${ext}`);
    
    return { success: true, downloadId };
  } catch (error) { return { 
      success: false, 
      error: error instanceof Error ? error.message : "Export failed" 
    };
  }
}

async function downloadFile(url: string, filename: string): Promise<number> {
  if (!browser?.downloads) throw new Error("Downloads API not available");

  return new Promise((resolve, reject) => {
    browser.downloads.download(
      { 
        url, 
        filename, 
        saveAs: true 
      }, 
      (downloadId) => {
        const error = browser.runtime.lastError;
        
        if (error) {
          reject(new Error(error.message));
        } else if (downloadId === undefined) {
          reject(new Error("Download failed - no ID returned"));
        } else {
          resolve(downloadId);
        }
      }
    );
  });
}

type FormatKey = "json" | "csv" | "txt";

function formatContent(links: MagnetRecord[], format: string) {
  const formatters: Record<FormatKey, () => { content: string; mimeType: string; ext: string }> = {
    json: () => ({ 
      content: JSON.stringify(links, null, 2), 
      mimeType: "application/json", 
      ext: "json" 
    }),
    
    csv: () => ({
      content: [
        "magnetLink,title,timestamp",
        ...links.map(l => `"${escape(l.magnetLink)}","${escape(l.name || "")}","${escape(l.date)}"`)
      ].join("\n"),
      mimeType: "text/csv",
      ext: "csv"
    }),
    
    txt: () => ({ 
      content: links.map(l => l.magnetLink).join("\n"), 
      mimeType: "text/plain", 
      ext: "txt" 
    })
  };

  const key = format.toLowerCase() as FormatKey;
  return (formatters[key] ?? formatters.txt)();
}

const escape = (str: string) => str.replace(/"/g, '""');