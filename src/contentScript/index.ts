// content-script.ts
import { MagnetRecord, RawMagnetLinkData } from '../lib/types';
import { sourceAdapters, parseTorrentName } from '../lib/utils';

console.info('contentScript is running');

let observer: MutationObserver | null = null;
let isExtracting = false; // Prevent multiple simultaneous extractions
let lastExtractionTime = 0;
const EXTRACTION_THROTTLE = 100; // Minimum time between extractions (ms)

/**
 * Extracts magnet links from the current page.
 */
function extractMagnetLinks(): MagnetRecord[] {
  console.log('Extracting magnet links');

  const hostname = window.location.hostname;
  const currentDate = new Date().toISOString();
  let rawMagnetLinks: RawMagnetLinkData[] = [];

  try {
    if (sourceAdapters[hostname]) {
      console.log('Using adapter for', hostname);
      rawMagnetLinks = sourceAdapters[hostname](window.document, window.location);
    } else {
      console.log('No adapter found for', hostname, 'using default extraction method');
      const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="magnet:"]');
      links.forEach((link) => {
        const magnetLink = link.getAttribute('href');
        if (magnetLink) {
          rawMagnetLinks.push({
            magnetLink: magnetLink,
            name: parseTorrentName(magnetLink),
          });
        }
      });
    }

    return processAndDeduplicateLinks(rawMagnetLinks, hostname, currentDate);
  } catch (error) {
    console.error('Error extracting magnet links:', error);
    return [];
  }
}

function processAndDeduplicateLinks(
  rawLinks: RawMagnetLinkData[],
  hostname: string,
  currentDate: string,
): MagnetRecord[] {
  const uniqueMagnetRecords: MagnetRecord[] = [];
  const processedMagnetLinks = new Set<string>();

  for (const rawLink of rawLinks) {
    if (rawLink.magnetLink && !processedMagnetLinks.has(rawLink.magnetLink)) {
      let finalMagnetLink = rawLink.magnetLink;
      let finalName = rawLink.name;
      
      processedMagnetLinks.add(rawLink.magnetLink);

      if (rawLink.name && !rawLink.magnetLink.includes("dn=")) {
        const encodedName = encodeURIComponent(rawLink.name);
        finalMagnetLink = `${rawLink.magnetLink}&dn=${encodedName}`;
      }

      uniqueMagnetRecords.push({
        magnetLink: finalMagnetLink,
        name: finalName || parseTorrentName(finalMagnetLink) || null,
        date: currentDate,
        source: hostname,
      });
    }
  }
  return uniqueMagnetRecords;
}

/**
 * Throttled extraction function to prevent excessive processing
 */
async function throttledExtraction() {
  const now = Date.now();
  
  if (isExtracting || (now - lastExtractionTime) < EXTRACTION_THROTTLE) {
    console.log('Extraction throttled');
    return;
  }

  isExtracting = true;
  lastExtractionTime = now;

  try {
    // Check if collection is enabled and host is whitelisted
    const result = await chrome.storage.sync.get(['isCollecting', 'whitelistedHosts']);
    const whitelistedHosts = result.whitelistedHosts || [];
    const currentHost = window.location.hostname;
    const isWhitelisted = whitelistedHosts.includes(currentHost);

    if (result.isCollecting && isWhitelisted) {
      const magnetRecords = extractMagnetLinks();
      
      if (magnetRecords.length > 0) {
        console.log(`Found ${magnetRecords.length} magnet links, sending to background`);
        
        // Send with response handling
        chrome.runtime.sendMessage(
          { 
            type: 'MAGNET_LINKS', 
            magnetLinks: magnetRecords 
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error sending magnet links:', chrome.runtime.lastError.message);
            } else {
              console.log('Successfully sent magnet links, response:', response);
            }
          }
        );
      }
    } else {
      console.log('Collection disabled or host not whitelisted:', { 
        isCollecting: result.isCollecting, 
        isWhitelisted,
        currentHost 
      });
    }
  } catch (error) {
    console.error('Error in throttled extraction:', error);
  } finally {
    isExtracting = false;
  }
}

/**
 * Sets up a MutationObserver to watch for changes in the DOM
 */
function setupMagnetObserver() {
  if (observer) {
    observer.disconnect();
  }

  observer = new MutationObserver(async (mutations) => {
    // Check if any mutations actually added new nodes with potential magnet links
    const hasRelevantChanges = mutations.some(mutation => {
      if (mutation.type === 'childList') {
        const addedNodes = Array.from(mutation.addedNodes);
        return addedNodes.some(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            // Check if the added element or its children might contain magnet links
            return element.querySelector?.('a[href^="magnet:"]') ||
                   (element as HTMLAnchorElement).href?.startsWith('magnet:');
          }
          return false;
        });
      }
      return false;
    });

    if (hasRelevantChanges) {
      console.log('Relevant DOM changes detected, triggering extraction');
      await throttledExtraction();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log('Magnet observer setup complete');
}

/**
 * Disconnects the current MutationObserver if it exists.
 */
function disconnectMagnetObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
    console.log('Magnet observer disconnected');
  }
}

// Listen for messages from the background script or popup.
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  try {
    if (request.type === 'TOGGLE_COLLECTION') {
      console.log('Toggle collection message received:', request.isCollecting);
      
      if (request.isCollecting) {
        await setupMagnetObserver();
        // Trigger initial extraction
        await throttledExtraction();
      } else {
        disconnectMagnetObserver();
      }
      
      sendResponse({ success: true });
      
    } else if (request.type === 'COLLECT_MAGNETS') {
      console.log('Manual collection requested');
      
      const result = await chrome.storage.sync.get(['whitelistedHosts']);
      const whitelistedHosts = result.whitelistedHosts || [];
      const currentHost = window.location.hostname;
      const isWhitelisted = whitelistedHosts.includes(currentHost);

      if (isWhitelisted) {
        await throttledExtraction();
        sendResponse({ success: true });
      } else {
        console.log('Host not whitelisted for manual collection');
        sendResponse({ success: false, error: 'Host not whitelisted' });
      }
    }
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({ success: false, error: error.message });
  }
  
  return true; // Keep message channel open
});

// Initialize observer when content script loads
(async () => {
  try {
    const result = await chrome.storage.sync.get(['isCollecting']);
    console.log('Initial collection state:', result.isCollecting);
    
    if (result.isCollecting) {
      setupMagnetObserver();
      // Give the page a moment to load, then do initial extraction
      setTimeout(() => {
        throttledExtraction();
      }, 2000);
    }
  } catch (error) {
    console.error('Error initializing content script:', error);
  }
})();

// Also extract when page is fully loaded (for SPAs that load content dynamically)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      throttledExtraction();
    }, 1000);
  });
} else {
  setTimeout(() => {
    throttledExtraction();
  }, 1000);
}