// content-scripts/magnet-extractor.content.ts
import { MagnetRecord, RawMagnetLinkData } from '@/lib/types';
import { parseTorrentName } from '@/lib/utils';
import { sourceAdapters } from '@/lib/adapters';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_end',
  matchAboutBlank: false,
  registration: 'manifest',
  main() {
    console.log('MagnetExtractor content script running');
    initializeMagnetExtractor();
  },
});

// Module state
let observer: MutationObserver | null = null;
let isInitialized = false;

/**
 * Initialize the magnet extractor
 */
async function initializeMagnetExtractor(): Promise<void> {
  if (isInitialized) return;

  console.info('MagnetExtractor initializing');
  isInitialized = true;

  setupMessageListeners();
  await checkInitialState();
}

/**
 * Set up message listeners for communication with background/popup
 */
function setupMessageListeners(): void {
  browser.runtime.onMessage.addListener(async (message, sender) => {
    try {
      switch (message.type) {
        case 'TOGGLE_COLLECTION':
          return await handleToggleCollection(message.isCollecting);
        case 'COLLECT_MAGNETS':
          return await handleManualCollection();
        default:
          return { success: false, error: 'Unknown message type' };
      }
    } catch (error) {
      console.error('Error handling message:', error);
      return { success: false, error: (error as Error).message };
    }
  });
}

/**
 * Check initial state and start observing if needed
 */
async function checkInitialState(): Promise<void> {
  try {
    const { isCollecting } = await browser.storage.sync.get('isCollecting');
    
    if (isCollecting) {
      await startObserving();
      await extractAndSendMagnetLinks(); // Initial extraction
    }
  } catch (error) {
    console.error('Error checking initial state:', error);
  }
}

/**
 * Handle collection toggle message
 */
async function handleToggleCollection(isCollecting: boolean): Promise<{ success: boolean }> {
  console.log('Toggle collection:', isCollecting);

  if (isCollecting) {
    await startObserving();
    await extractAndSendMagnetLinks();
  } else {
    stopObserving();
  }

  return { success: true };
}

/**
 * Handle manual collection request
 */
async function handleManualCollection(): Promise<{ success: boolean; error?: string }> {
  console.log('Manual collection requested');

  const isWhitelisted = await isCurrentHostWhitelisted();
  if (!isWhitelisted) {
    return { success: false, error: 'Host not whitelisted' };
  }

  await extractAndSendMagnetLinks();
  return { success: true };
}

/**
 * Start observing DOM changes for magnet links
 */
async function startObserving(): Promise<void> {
  if (observer) return;

  observer = new MutationObserver(async (mutations) => {
    if (hasMagnetLinkChanges(mutations)) {
      console.log('Relevant DOM changes detected');
      await extractAndSendMagnetLinks();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log('MutationObserver started');
}

/**
 * Stop observing DOM changes
 */
function stopObserving(): void {
  if (observer) {
    observer.disconnect();
    observer = null;
    console.log('MutationObserver stopped');
  }
}

/**
 * Check if mutations contain magnet link changes
 */
function hasMagnetLinkChanges(mutations: MutationRecord[]): boolean {
  return mutations.some(mutation => {
    if (mutation.type !== 'childList') return false;

    return Array.from(mutation.addedNodes).some(node => {
      if (node.nodeType !== Node.ELEMENT_NODE) return false;
      
      const element = node as Element;
      return element.querySelector?.('a[href^="magnet:"]') ||
             (element as HTMLAnchorElement).href?.startsWith('magnet:');
    });
  });
}

/**
 * Main extraction and sending logic
 */
async function extractAndSendMagnetLinks(): Promise<void> {
  try {
    const [isCollectionEnabled, isWhitelisted] = await Promise.all([
      getIsCollectionEnabled(),
      isCurrentHostWhitelisted(),
    ]);

    if (!isCollectionEnabled || !isWhitelisted) {
      console.log('Collection disabled or host not whitelisted');
      return;
    }

    const magnetRecords = extractMagnetLinks();
    
    if (magnetRecords.length > 0) {
      console.log(`Found ${magnetRecords.length} magnet links`);
      await sendMagnetLinks(magnetRecords);
    }
  } catch (error) {
    console.error('Error in extraction process:', error);
  }
}

/**
 * Extract magnet links from the current page
 */
function extractMagnetLinks(): MagnetRecord[] {
  console.log('Extracting magnet links');

  const hostname = window.location.hostname;
  const currentDate = new Date().toISOString();

  try {
    const rawMagnetLinks = getRawMagnetLinks(hostname);
    return processAndDeduplicateLinks(rawMagnetLinks, hostname, currentDate);
  } catch (error) {
    console.error('Error extracting magnet links:', error);
    return [];
  }
}

/**
 * Get raw magnet links using adapters or default method
 */
function getRawMagnetLinks(hostname: string): RawMagnetLinkData[] {
  if (sourceAdapters[hostname]) {
    console.log('Using adapter for', hostname);
    return sourceAdapters[hostname](document, location);
  }

  console.log('Using default extraction method for', hostname);
  const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="magnet:"]');
  
  return Array.from(links)
    .map(link => link.getAttribute('href'))
    .filter((href): href is string => !!href)
    .map(magnetLink => ({
      magnetLink,
      name: parseTorrentName(magnetLink) ?? '',
    }));
}

/**
 * Process and deduplicate magnet links
 */
function processAndDeduplicateLinks(
  rawLinks: RawMagnetLinkData[],
  hostname: string,
  currentDate: string,
): MagnetRecord[] {
  const uniqueRecords: MagnetRecord[] = [];
  const processedLinks = new Set<string>();

  for (const rawLink of rawLinks) {
    if (!rawLink.magnetLink || processedLinks.has(rawLink.magnetLink)) {
      continue;
    }

    processedLinks.add(rawLink.magnetLink);
    
    const magnetLink = enhanceMagnetLink(rawLink);
    const name = rawLink.name || parseTorrentName(magnetLink) || null;

    uniqueRecords.push({
      magnetLink,
      name,
      date: currentDate,
      source: hostname,
    });
  }

  return uniqueRecords;
}

/**
 * Enhance magnet link with display name if missing
 */
function enhanceMagnetLink(rawLink: RawMagnetLinkData): string {
  if (!rawLink.name || rawLink.magnetLink.includes('dn=')) {
    return rawLink.magnetLink;
  }

  const encodedName = encodeURIComponent(rawLink.name);
  return `${rawLink.magnetLink}&dn=${encodedName}`;
}

/**
 * Send magnet links to background script
 */
async function sendMagnetLinks(magnetRecords: MagnetRecord[]): Promise<void> {
  try {
    const response = await browser.runtime.sendMessage({
      type: 'MAGNET_LINKS',
      magnetLinks: magnetRecords,
    });

    console.log('Successfully sent magnet links, response:', response);
  } catch (error) {
    console.error('Error sending magnet links:', error);
  }
}

/**
 * Check if collection is enabled
 */
async function getIsCollectionEnabled(): Promise<boolean> {
  try {
    const { isCollecting } = await browser.storage.sync.get('isCollecting');
    return Boolean(isCollecting);
  } catch {
    return false;
  }
}

/**
 * Check if current host is whitelisted
 */
async function isCurrentHostWhitelisted(): Promise<boolean> {
  try {
    const { whitelistedHosts } = await browser.storage.sync.get('whitelistedHosts');
    const currentHost = window.location.hostname;
    return Array.isArray(whitelistedHosts) && whitelistedHosts.includes(currentHost);
  } catch {
    return false;
  }
}