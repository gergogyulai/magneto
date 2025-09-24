// background.ts
import type { MagnetRecord } from '@/lib/types'
import { handleExportMagnets } from '@/lib/stash-exporter'


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
  const existingLinks: MagnetRecord[] = await storage.getItem('local:magnetLinks') || []

  const newLinks = newMagnetLinks.filter(
    (link) => !existingLinks.some((existing) => existing.magnetLink === link.magnetLink)
  )

  if (newLinks.length === 0) return { addedCount: 0, totalCount: existingLinks.length }

  const updatedLinks = [...existingLinks, ...newLinks]
  await storage.setItem('local:magnetLinks', updatedLinks)

  const message = {
    type: 'MAGNET_LINKS_UPDATED',
    count: updatedLinks.length,
    addedCount: newLinks.length,
    newLinks,
  }

  try {
    await browser.runtime.sendMessage(message)
  } catch { }

  return {
    addedCount: newLinks.length,
    totalCount: updatedLinks.length,
  }
}