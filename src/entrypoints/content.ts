// content-scripts/magnet-extractor.content.ts
import { MagnetRecord, RawMagnetLinkData } from '@/lib/types';
import { parseTorrentName } from '@/lib/utils';
import { sourceAdapters } from '@/lib/adapters';
import "@/lib/console";

export default defineContentScript({
  matches: ['https://*/*', 'http://*/*'],
  runAt: 'document_end',
  matchAboutBlank: false,
  registration: 'manifest',
  main: initializeExtractor,
});

let observer: MutationObserver | null = null;

async function initializeExtractor(): Promise<void> {
  console.log('Initializing extractor...');
  
  setupMessageHandler();
  
  const isCollecting = await storage.getItem<boolean>('sync:magneto-isCollecting');
  
  if (isCollecting) startCollection();

  console.log('Extractor initialized');
}

function setupMessageHandler(): void {
  console.log('Setting up message handler...');
  browser.runtime.onMessage.addListener(async (message) => {
    switch (message.type) {
      case 'TOGGLE_COLLECTION':
        return handleToggle(message.isCollecting);
      case 'COLLECT_MAGNETS':
        return handleManualCollection();
      default:
        return { success: false, error: 'Unknown message type' };
    }
  });
  console.log('Message handler set up');
}

async function handleToggle(isCollecting: boolean): Promise<{ success: boolean }> {
  if (isCollecting) {
    startCollection();
    console.log('Collection started');
  } else {
    stopCollection();
    console.log('Collection stopped');
  }
  return { success: true };
}

async function handleManualCollection(): Promise<{ success: boolean; error?: string }> {
  console.log('Handling manual collection...');
  const isWhitelisted = await checkWhitelist();

  if (!isWhitelisted) {
    console.log('Host not whitelisted');
    return { success: false, error: 'Host not whitelisted' };
  }

  console.log('Manual collection triggered');
  extractAndSend();
  console.log('Manual collection completed');
  return { success: true };
}

function startCollection(): void {
  if (observer) return;

  
  observer = new MutationObserver(() => {
    if (document.querySelector('a[href^="magnet:"]')) {
      console.log('Magnet link found');
      console.log('Extracting and sending magnet links...');
      extractAndSend();
      console.log('Extraction and sending completed');
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  extractAndSend();
}

function stopCollection(): void {
  observer?.disconnect();
  observer = null;
}

async function extractAndSend(): Promise<void> {
  console.log('Extracting and sending magnet links...');
  const [isCollecting, isWhitelisted] = await Promise.all([
    storage.getItem<boolean>('sync:magneto-isCollecting'),
    checkWhitelist(),
  ]);
  console.log(`isCollecting: ${isCollecting}, isWhitelisted: ${isWhitelisted}`);
  
  if (!isCollecting || !isWhitelisted) return;
  
  const magnetLinks = extractMagnetLinks();
  if (magnetLinks.length === 0) return;
  
  console.log(`Found ${magnetLinks.length} magnet links`);
  
  try {
    await browser.runtime.sendMessage({
      type: 'MAGNET_LINKS',
      magnetLinks,
    });
  } catch (error) {
    console.error('Failed to send magnet links:', error);
  }
}

function extractMagnetLinks(): MagnetRecord[] {
  const hostname = window.location.hostname;
  const adapter = sourceAdapters[hostname];
  
  const rawLinks = adapter 
    ? adapter(document, location)
    : getDefaultMagnetLinks();

  return deduplicateAndPreprocess(rawLinks, hostname);
}

function getDefaultMagnetLinks(): RawMagnetLinkData[] {
  const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="magnet:"]');
  
  return Array.from(links, link => ({
    magnetLink: link.href,
    name: parseTorrentName(link.href) ?? '',
  }));
}

function deduplicateAndPreprocess(
  rawLinks: RawMagnetLinkData[], 
  hostname: string
): MagnetRecord[] {
  const seen = new Set<string>();
  const currentDate = new Date().toISOString();
  
  return rawLinks
    .filter(({ magnetLink }) => magnetLink && !seen.has(magnetLink) && seen.add(magnetLink))
    .map(({ magnetLink, name }) => ({
      magnetLink: enhanceMagnetLink(magnetLink, name),
      name: name || parseTorrentName(magnetLink),
      date: currentDate,
      source: hostname,
    }));
}

function enhanceMagnetLink(magnetLink: string, name?: string): string {
  if (!name || magnetLink.includes('dn=')) {
    return magnetLink;
  }
  
  return `${magnetLink}&dn=${encodeURIComponent(name)}`;
}

async function checkWhitelist(): Promise<boolean> {
  const whitelistedHosts = await storage.getItem<string[]>('sync:magneto-whitelistedHosts') || [];
  return Array.isArray(whitelistedHosts) && 
         whitelistedHosts.includes(window.location.hostname);
}