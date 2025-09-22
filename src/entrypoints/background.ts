// background.ts
import type { MagnetRecord } from '@/lib/types'

export default defineBackground(() => {
  console.log('background is running')

  // Handle messages from popup and content scripts
  browser.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {
      try {
        if (request.type === 'MAGNET_LINKS') {
          console.log(
            'background has received a message from contentScript, and magnet links are ',
            request?.magnetLinks
          )

          const result = await handleNewMagnetLinks(request?.magnetLinks)
          return { success: true, ...result }
        }

        if (request.type === 'EXPORT_MAGNETS') {
          const result = await handleExportMagnets(request.format)
          return result
        }
      } catch (error) {
        console.error('Error handling message:', error)
        return { success: false, error: (error as Error).message }
      }
    }
  )
})

async function handleNewMagnetLinks(
  newMagnetLinks: MagnetRecord[]
): Promise<{ addedCount: number; totalCount: number }> {
  try {
    const existingLinks: MagnetRecord[] =
      (await storage.getItem('local:magnetLinks')) || []

    const filteredNewLinks: MagnetRecord[] = newMagnetLinks.filter(
      (newLink: MagnetRecord) =>
        !existingLinks.some(
          (existingLink) => existingLink.magnetLink === newLink.magnetLink
        )
    )

    if (filteredNewLinks.length > 0) {
      const updatedLinks = [...existingLinks, ...filteredNewLinks]

      await storage.setItem('local:magnetLinks', updatedLinks)

      console.log(
        `Added ${filteredNewLinks.length} new magnet links. Total: ${updatedLinks.length}`
      )

      // Notify all UI components about the update
      const updateMessage = {
        type: 'MAGNET_LINKS_UPDATED',
        count: updatedLinks.length,
        addedCount: filteredNewLinks.length,
        newLinks: filteredNewLinks,
      }

      // Send to all extension contexts (popup, options, etc.)
      try {
        await browser.runtime.sendMessage(updateMessage)
      } catch {
        console.log('No message listeners available (popup might be closed)')
      }

      // Also send individual new link messages for each new link
      for (const link of filteredNewLinks) {
        try {
          await browser.runtime.sendMessage({
            type: 'NEW_MAGNET_LINK',
            count: updatedLinks.length,
            newLink: link,
          })
        } catch {
          // Popup might not be open, that's fine
        }
      }

      return {
        addedCount: filteredNewLinks.length,
        totalCount: updatedLinks.length,
      }
    } else {
      console.log('No new magnet links to add')
      return {
        addedCount: 0,
        totalCount: existingLinks.length,
      }
    }
  } catch (error) {
    console.error('Error handling new magnet links:', error)
    throw error
  }
}

async function handleExportMagnets(format: string) {
  try {
    const magnetLinks: MagnetRecord[] =
      (await storage.getItem('local:magnetLinks')) || []

    const { content, mimeType, extension } = formatMagnetLinks(
      magnetLinks,
      format
    )

    const blob = new Blob([content], { type: mimeType })
    const dataUrl = await blobToDataUrl(blob)

    return new Promise((resolve, reject) => {
      browser.downloads.download(
        {
          url: dataUrl,
          filename: `magnet-links.${extension}`,
          saveAs: true,
        },
        (downloadId) => {
          if (browser.runtime.lastError) {
            reject(new Error(browser.runtime.lastError.message))
          } else {
            resolve({ success: true, downloadId })
          }
        }
      )
    })
  } catch (error) {
    console.error('Error exporting magnets:', error)
    throw error
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Unexpected file reader result type'))
      }
    }
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    reader.readAsDataURL(blob)
  })
}

function formatMagnetLinks(
  links: MagnetRecord[],
  format: string
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
        ...links.map(
          (link) =>
            `"${link.magnetLink}","${(link.name || '').replace(
              /"/g,
              '""'
            )}","${link.date}"`
        ),
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