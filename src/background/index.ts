import { MagnetRecord, SavedMagnetLinks } from "../lib/types"

console.log('background is running')

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'COUNT') {
    console.log('background has received a message from popup, and count is ', request?.count)
  }
})

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'MAGNET_LINKS') {
    console.log('background has received a message from contentScript, and magnet links are ', request?.magnetLinks);

    chrome.storage.local.get(['magnetLinks'], (result) => {
      const existingLinks: MagnetRecord[] = result.magnetLinks || [];
      const newLinks: MagnetRecord[] = request?.magnetLinks.filter(
        (newLink: MagnetRecord) =>
          !existingLinks.some(existingLink => existingLink.magnetLink === newLink.magnetLink)
      );

      if (newLinks.length > 0) {
        const updatedLinks = [...existingLinks, ...newLinks];
        chrome.storage.local.set({ magnetLinks: updatedLinks }, () => {
          console.log('new magnet links have been appended to storage');
        });
      }
    });
  }
});

function formatMagnetLinks(links: MagnetRecord[], format: string): { content: string; mimeType: string; extension: string } {
  switch (format) {
    case 'JSON':
      return {
        content: JSON.stringify(links, null, 2),
        mimeType: 'application/json',
        extension: 'json'
      };
    case 'CSV':
      const csvContent = [
        'magnetLink,title,timestamp',
        ...links.map(link => `${link.magnetLink},"${link.name || ''}",${link.date}`)
      ].join('\n');
      return {
        content: csvContent,
        mimeType: 'text/csv',
        extension: 'csv'
      };
    default: // TXT
      return {
        content: links.map(link => link.magnetLink).join('\n'),
        mimeType: 'text/plain',
        extension: 'txt'
      };
  }
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === 'EXPORT_MAGNETS') {
    chrome.storage.local.get(['magnetLinks'], (result) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
        return;
      }

      const magnetLinks = result.magnetLinks || [];
      const { content, mimeType, extension } = formatMagnetLinks(magnetLinks, request.format);

      const blob = new Blob([content], { type: mimeType });
      const reader = new FileReader();

      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          chrome.downloads.download({
            url: reader.result,
            filename: `magnet-links.${extension}`,
            saveAs: true
          }, (downloadId) => {
            if (chrome.runtime.lastError) {
              sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
              sendResponse({ success: true, downloadId });
            }
          });
        } else {
          sendResponse({ success: false, error: 'Unexpected file reader result type' });
        }
      };
      reader.readAsDataURL(blob);
    });
    return true;
  }
});
