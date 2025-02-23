import { MagnetRecord } from '../lib/types'
import { parseTorrentName } from '../lib/utils'

console.info('contentScript is running')

function extractMagnetLinks(): MagnetRecord[] {
  console.log('extracting magnet links')
  const magnetRecords: MagnetRecord[] = []
  const links = document.querySelectorAll('a[href^="magnet:"]')

  links.forEach((link) => {
    const magnetLink = link.getAttribute('href')
    if (magnetLink) {
      const existingRecord = magnetRecords.find((record) => record.magnetLink === magnetLink)
      if (!existingRecord) {
        const magnetRecord: MagnetRecord = {
          magnetLink: magnetLink,
          name: parseTorrentName(magnetLink),
          date: new Date().toISOString(),
          source: window.location.hostname,
        }
        magnetRecords.push(magnetRecord)
      }
    }
  })

  return magnetRecords
}

let observer: MutationObserver | null = null

function setupMagnetObserver() {
  if (observer) {
    observer.disconnect()
  }

  observer = new MutationObserver((mutations) => {
    chrome.storage.sync.get(['isCollecting', 'whitelistedHosts'], (result) => {
      const whitelistedHosts = result.whitelistedHosts || []
      const currentHost = window.location.hostname
      const isWhitelisted = whitelistedHosts.includes(currentHost)

      if (result.isCollecting && isWhitelisted) {
        const magnetRecords = extractMagnetLinks()
        if (magnetRecords.length > 0) {
          chrome.runtime.sendMessage({ type: 'MAGNET_LINKS', magnetLinks: magnetRecords })
        }
      }
    })
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
}

// Update the message listener to handle collection state changes
chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'TOGGLE_COLLECTION') {
    if (request.isCollecting) {
      setupMagnetObserver()
    } else if (observer) {
      observer.disconnect()
      observer = null
    }
  }
})

// Initialize observer if collection is enabled
chrome.storage.sync.get(['isCollecting'], (result) => {
  if (result.isCollecting) {
    setupMagnetObserver()
  }
})

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'COLLECT_MAGNETS') {
    chrome.storage.sync.get(['whitelistedHosts'], (result) => {
      const whitelistedHosts = result.whitelistedHosts || []
      const currentHost = window.location.hostname
      const isWhitelisted = whitelistedHosts.includes(currentHost)

      if (isWhitelisted) {
        const magnetRecords = extractMagnetLinks()
        console.log('magnet records:', magnetRecords)
        chrome.runtime.sendMessage({ type: 'MAGNET_LINKS', magnetLinks: magnetRecords })
      }
    })
  }
})
