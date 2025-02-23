import { MagnetRecord, SavedMagnetLinks } from "../lib/types";
import { parseTorrentName, parseTorrentSize } from "../lib/utils"

console.info('contentScript is running');

function extractMagnetLinks(): MagnetRecord[] {
  console.log('extracting magnet links');
  const magnetRecords: MagnetRecord[] = [];
  const links = document.querySelectorAll('a[href^="magnet:"]');

  links.forEach(link => {
    const magnetLink = link.getAttribute('href');
    if (magnetLink) {
      const existingRecord = magnetRecords.find(record => record.magnetLink === magnetLink);
      if (!existingRecord) {
        const magnetRecord: MagnetRecord = {
          magnetLink: magnetLink,
          name: parseTorrentName(magnetLink),
          date: new Date().toISOString(),
          source: window.location.hostname
        };
        magnetRecords.push(magnetRecord);
      }
    }
  });

  return magnetRecords;
}

chrome.storage.sync.get(['isCollecting'], (result) => {
  console.log('isCollecting:', result.isCollecting);
  if (result.isCollecting) {
    chrome.storage.sync.get(['whitelistedHosts'], (result) => {
      console.log('whitelistedHosts:', result.whitelistedHosts);
      const whitelistedHosts = result.whitelistedHosts || [];
      const currentHost = window.location.hostname;
      const isWhitelisted = whitelistedHosts.includes(currentHost);
      if (isWhitelisted) {
        const magnetRecords = extractMagnetLinks();
        console.log('magnet records:', magnetRecords);

        chrome.runtime.sendMessage({ type: 'MAGNET_LINKS', magnetLinks: magnetRecords });
      }
    });
  }
});
