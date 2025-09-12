// background.ts or background.js
import { MagnetRecord } from '../lib/types'

console.log('background is running')

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'COUNT') {
    console.log('background has received a message from popup, and count is ', request?.count)
    sendResponse({ success: true })
    return true
  }

  if (request.type === 'MAGNET_LINKS') {
    console.log(
      'background has received a message from contentScript, and magnet links are ',
      request?.magnetLinks,
    )

    // Handle async storage operations properly
    handleNewMagnetLinks(request?.magnetLinks)
      .then((result) => {
        sendResponse({ success: true, ...result })
      })
      .catch((error) => {
        console.error('Error handling magnet links:', error)
        sendResponse({ success: false, error: error.message })
      })
    
    return true // Keep message channel open for async response
  }

  if (request.type === 'EXPORT_MAGNETS') {
    handleExportMagnets(request.format)
      .then((result) => {
        sendResponse(result)
      })
      .catch((error) => {
        console.error('Error exporting magnets:', error)
        sendResponse({ success: false, error: error.message })
      })
    
    return true // Keep message channel open for async response
  }
})

async function handleNewMagnetLinks(newMagnetLinks: MagnetRecord[]) {
  return new Promise<{ addedCount: number; totalCount: number }>((resolve, reject) => {
    chrome.storage.local.get(['magnetLinks'], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
        return
      }

      const existingLinks: MagnetRecord[] = result.magnetLinks || []
      const filteredNewLinks: MagnetRecord[] = newMagnetLinks.filter(
        (newLink: MagnetRecord) =>
          !existingLinks.some((existingLink) => existingLink.magnetLink === newLink.magnetLink),
      )

      if (filteredNewLinks.length > 0) {
        const updatedLinks = [...existingLinks, ...filteredNewLinks]
        
        chrome.storage.local.set({ magnetLinks: updatedLinks }, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message))
            return
          }

          console.log(`Added ${filteredNewLinks.length} new magnet links. Total: ${updatedLinks.length}`)
          
          // Notify all UI components about the update with consistent property names
          const updateMessage = {
            type: 'MAGNET_LINKS_UPDATED',
            count: updatedLinks.length, // Use 'count' not 'totalCount'
            addedCount: filteredNewLinks.length,
            newLinks: filteredNewLinks
          }
          
          // Send to all extension contexts (popup, options, etc.)
          chrome.runtime.sendMessage(updateMessage).catch(() => {
            // It's fine if no listeners are available (popup closed)
            console.log('No message listeners available (popup might be closed)')
          })

          // Also send individual new link messages for each new link
          filteredNewLinks.forEach(link => {
            chrome.runtime.sendMessage({
              type: 'NEW_MAGNET_LINK',
              count: updatedLinks.length,
              newLink: link
            }).catch(() => {
              // Popup might not be open, that's fine
            })
          })

          resolve({ 
            addedCount: filteredNewLinks.length, 
            totalCount: updatedLinks.length 
          })
        })
      } else {
        console.log('No new magnet links to add')
        resolve({ 
          addedCount: 0, 
          totalCount: existingLinks.length 
        })
      }
    })
  })
}

async function handleExportMagnets(format: string) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['magnetLinks'], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
        return
      }

      const magnetLinks = result.magnetLinks || []
      const { content, mimeType, extension } = formatMagnetLinks(magnetLinks, format)

      const blob = new Blob([content], { type: mimeType })
      const reader = new FileReader()

      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          chrome.downloads.download(
            {
              url: reader.result,
              filename: `magnet-links.${extension}`,
              saveAs: true,
            },
            (downloadId) => {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message))
              } else {
                resolve({ success: true, downloadId })
              }
            },
          )
        } else {
          reject(new Error('Unexpected file reader result type'))
        }
      }

      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }

      reader.readAsDataURL(blob)
    })
  })
}

function formatMagnetLinks(
  links: MagnetRecord[],
  format: string,
): { content: string; mimeType: string; extension: string } {
  switch (format) {
    case 'JSON':
      return {
        content: JSON.stringify(links, null, 2),
        mimeType: 'application/json',
        extension: 'json',
      }
    case 'CSV':
      const csvContent = [
        'magnetLink,title,timestamp',
        ...links.map((link) => `"${link.magnetLink}","${(link.name || '').replace(/"/g, '""')}","${link.date}"`),
      ].join('\n')
      return {
        content: csvContent,
        mimeType: 'text/csv',
        extension: 'csv',
      }
    default: // TXT
      return {
        content: links.map((link) => link.magnetLink).join('\n'),
        mimeType: 'text/plain',
        extension: 'txt',
      }
  }
}