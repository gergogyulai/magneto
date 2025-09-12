import { MagnetRecord, RawMagnetLinkData } from '../lib/types';
import { sourceAdapters, parseTorrentName } from '../lib/utils';

console.info('contentScript is running');

/**
 * Extracts magnet links from the current page.
 * It uses a source-specific adapter if available, otherwise, it falls back to a default method.
 * @returns An array of unique and processed MagnetRecord objects.
 */
function extractMagnetLinks(): MagnetRecord[] {
  console.log('Extracting magnet links');

  const hostname = window.location.hostname;
  const currentDate = new Date().toISOString();
  let rawMagnetLinks: RawMagnetLinkData[] = [];

  if (sourceAdapters[hostname]) {
    console.log('Using adapter for', hostname);
    rawMagnetLinks = sourceAdapters[hostname](window.document, window.location);
  } else {
    console.log(
      'No adapter found for',
      hostname,
      'using default extraction method',
    );
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

let observer: MutationObserver | null = null;

/**
 * Sets up a MutationObserver to watch for changes in the DOM and extract magnet links
 * if collection is enabled and the host is whitelisted.
 * If an observer already exists, it will be disconnected and a new one created.
 */
function setupMagnetObserver() {
  if (observer) {
    observer.disconnect();
  }

  observer = new MutationObserver(async (mutations) => {
    const result = await chrome.storage.sync.get(['isCollecting', 'whitelistedHosts']);
    const whitelistedHosts = result.whitelistedHosts || [];
    const currentHost = window.location.hostname;
    const isWhitelisted = whitelistedHosts.includes(currentHost);

    if (result.isCollecting && isWhitelisted) {
      const magnetRecords = extractMagnetLinks();
      if (magnetRecords.length > 0) {
        chrome.runtime.sendMessage({ type: 'MAGNET_LINKS', magnetLinks: magnetRecords });
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

/**
 * Disconnects the current MutationObserver if it exists.
 */
function disconnectMagnetObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

// Listen for messages from the background script or popup.
chrome.runtime.onMessage.addListener(async (request) => {
  if (request.type === 'TOGGLE_COLLECTION') {
    if (request.isCollecting) {
      setupMagnetObserver();
    } else {
      disconnectMagnetObserver();
    }
  } else if (request.type === 'COLLECT_MAGNETS') {
    const result = await chrome.storage.sync.get(['whitelistedHosts']);
    const whitelistedHosts = result.whitelistedHosts || [];
    const currentHost = window.location.hostname;
    const isWhitelisted = whitelistedHosts.includes(currentHost);

    if (isWhitelisted) {
      const magnetRecords = extractMagnetLinks();
      console.log('Magnet records:', magnetRecords);
      chrome.runtime.sendMessage({ type: 'MAGNET_LINKS', magnetLinks: magnetRecords });
    }
  }
});

// Initialize observer if collection is enabled when the content script loads.
chrome.storage.sync.get(['isCollecting'], (result) => {
  if (result.isCollecting) {
    setupMagnetObserver();
  }
});