<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { Button } from '@/lib/components/ui/button'
  import { Badge } from '@/lib/components/ui/badge'
  import { Separator } from '@/lib/components/ui/separator'
  import { ScrollArea } from '@/lib/components/ui/scroll-area'
  import { MagnetRecord } from '@/lib/types'
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/lib/components/ui/card'
  import { Link, Magnet, ChevronsUpDown, Check, Trash2 } from '@lucide/svelte'
  import { Input } from '@/lib/components/ui/input'
  import * as Command from '@/lib/components/ui/command'
  import * as Popover from '@/lib/components/ui/popover'
  import * as AlertDialog from '@/lib/components/ui/alert-dialog'
  import { cn } from '@/lib/utils'
  import ExportDropdown from '@/lib/components/export-dropdown.svelte'
  import MagnetList from '@/lib/components/magnet-list.svelte'

  // WXT imports
  import { browser } from 'wxt/browser'

  // State variables for the component
  let isCollecting = false
  let whitelistedHosts: string[] = []
  let currentHost = ''
  let isBuiltInChrome = false

  // Magnet links and filter/sort state
  let allMagnetLinks: MagnetRecord[] = []
  let searchTerm = ''
  let selectedSourceFilter = ''
  let selectedOrder = ''

  // Popover and dialog open states
  let openSourcePopover = false
  let openOrderPopover = false
  let showDeleteAllDialog = false

  // Real-time update variables
  let messageListener: (() => void) | null = null
  let updateInterval: NodeJS.Timeout | null = null
  let storageWatcher: (() => void) | null = null
  let lastUpdateTime = 0

  // Reactive computed values - these will update automatically when allMagnetLinks changes
  $: collectedMagnetLinks = allMagnetLinks.length
  $: collectedMagnetLinksThisSite = allMagnetLinks.filter((link) =>
    link.source.includes(currentHost),
  ).length

  // Reactive derived states for filter/sort options
  $: availableSources = [...new Set(allMagnetLinks.map((item) => item.source))]
  $: sourceOptions = [
    { value: '', label: 'All sources' },
    ...availableSources.map((src) => ({ value: src, label: src })),
  ]
  
  const orderOptions = [
    { value: '', label: 'No ordering' },
    { value: 'asc', label: 'Date Ascending' },
    { value: 'desc', label: 'Date Descending' },
  ]

  // Reactive computed filtered and ordered magnet links
  $: filteredAndOrderedMagnetLinks = (() => {
    let filtered = allMagnetLinks.filter((link) => {
      const torrentName = (link.name || '').toLowerCase()
      return (
        torrentName.includes(searchTerm.toLowerCase()) &&
        (selectedSourceFilter ? link.source === selectedSourceFilter : true)
      )
    })

    if (selectedOrder === 'asc') {
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    } else if (selectedOrder === 'desc') {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }
    return filtered
  })()

  // --- Utility functions for data handling ---
  async function updateMagnetLinksFromStorage() {
    try {
      const fetchedLinks: MagnetRecord[] = (await storage.getItem('local:magnetLinks')) ?? []

      // Only update if the data has actually changed
      const currentLinksString = JSON.stringify(allMagnetLinks)
      const newLinksString = JSON.stringify(fetchedLinks)
      
      if (currentLinksString !== newLinksString) {
        allMagnetLinks = fetchedLinks.map((link) => ({
          ...link,
          name: link.name || link.magnetLink,
        }))
        
        lastUpdateTime = Date.now()
        console.log(`Updated magnet links: ${allMagnetLinks.length} total`)
      }
    } catch (error) {
      console.error('Error updating magnet links from storage:', error)
    }
  }

  async function saveMagnetLinksToStorage() {
    try {
      await storage.setItem('local:magnetLinks', allMagnetLinks)
      lastUpdateTime = Date.now()
      
      // Notify other instances/tabs about the update
      try {
        await browser.runtime.sendMessage({ 
          type: 'MAGNET_LINKS_UPDATED',
          count: allMagnetLinks.length 
        })
      } catch (error) {
        // Ignore errors if background script isn't ready
        console.log('Could not send update message:', error)
      }
    } catch (error) {
      console.error('Error saving magnet links to storage:', error)
    }
  }

  // --- Real-time update handlers ---
  function setupMessageListener() {
    const messageHandler = (message: any) => {
      if (message.type === 'MAGNET_LINKS_UPDATED') {
        console.log('Received MAGNET_LINKS_UPDATED message')
        updateMagnetLinksFromStorage()
      } else if (message.type === 'NEW_MAGNET_LINK') {
        console.log('Received NEW_MAGNET_LINK message')
        updateMagnetLinksFromStorage()
      }
    }
    
    browser.runtime.onMessage.addListener(messageHandler)
    
    // Return cleanup function
    messageListener = () => {
      browser.runtime.onMessage.removeListener(messageHandler)
    }
  }

  function setupPeriodicRefresh() {
    // Check for updates every 2 seconds when the popup is open
    updateInterval = setInterval(async () => {
      await updateMagnetLinksFromStorage()
    }, 2000)
  }

  function setupStorageWatcher() {
    // Since storage.watch may not be available, we'll rely on message-based updates
    console.log('Storage watcher setup - relying on message updates')
    storageWatcher = () => {
      // Cleanup function placeholder
    }
  }

  function cleanupListeners() {
    if (messageListener) {
      messageListener()
      messageListener = null
    }
    
    if (updateInterval) {
      clearInterval(updateInterval)
      updateInterval = null
    }
    
    if (storageWatcher) {
      storageWatcher()
      storageWatcher = null
    }
  }

  // --- Handlers for component actions ---
  async function handleDeleteMagnet(linkToDelete: MagnetRecord) {
    allMagnetLinks = allMagnetLinks.filter((item) => item.magnetLink !== linkToDelete.magnetLink)
    await saveMagnetLinksToStorage()
  }

  async function handleDeleteAll() {
    allMagnetLinks = []
    await saveMagnetLinksToStorage()
    showDeleteAllDialog = false
    
    // Reset filters since there's nothing to filter
    searchTerm = ''
    selectedSourceFilter = ''
    selectedOrder = ''
  }

  async function handleCopyMagnetLink(link: MagnetRecord) {
    try {
      await navigator.clipboard.writeText(link.magnetLink)
      console.log('Magnet link copied:', link.magnetLink)
    } catch (err) {
      console.error('Failed to copy magnet link:', err)
    }
  }

  // --- Lifecycle Hooks ---
  onMount(async () => {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true })

      if (tab.url) {
        if (tab.url.startsWith('chrome://') || 
            tab.url.startsWith('chrome-devtools://') ||
            tab.url.startsWith('moz-extension://') ||
            tab.url.startsWith('about:')) {
          isBuiltInChrome = true
        } else {
          currentHost = new URL(tab.url).hostname
        }
      }

      if (isBuiltInChrome) {
        return
      }

      // Load initial settings
      isCollecting = (await storage.getItem('sync:isCollecting')) ?? false
      whitelistedHosts = (await storage.getItem('sync:whitelistedHosts')) ?? []

      // Initial load of magnet links
      await updateMagnetLinksFromStorage()

      // Setup all real-time update mechanisms
      setupMessageListener()
      setupStorageWatcher()
      setupPeriodicRefresh()

      console.log('Real-time updates initialized')
    } catch (error) {
      console.error('Error during component initialization:', error)
    }
  })

  onDestroy(() => {
    cleanupListeners()
  })
</script>

<div class="select-none">
  {#if isBuiltInChrome}
    <Card class="min-w-80 rounded-none pb-5">
      <CardHeader>
        <CardTitle class="flex items-center gap-2"><Magnet class="w-5 h-5" />Magneto</CardTitle>
        <CardDescription>Not available on browser internal pages</CardDescription>
      </CardHeader>
    </Card>
  {:else}
    <Card class="min-w-80 rounded-none">
      <CardHeader class="pb-3">
        <div class="flex items-center justify-between">
          <CardTitle class="flex items-center gap-2">
            <Magnet class="w-5 h-5 text-primary" />Magneto
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent class="flex flex-col gap-6">
        <div class="grid gap-4">
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-muted-foreground">
              <Link class="w-4 h-4" />
              <span class="text-sm font-medium">Total Magnets</span>
            </div>
            <div class="text-2xl font-bold">{collectedMagnetLinks}</div>
            {#if currentHost}
              <span class="text-sm text-muted-foreground">
                {collectedMagnetLinksThisSite} from {currentHost}
              </span>
            {/if}
            
            <div class="flex gap-2 mt-2">
              <ExportDropdown>
                <Button variant="outline" size="lg" class="flex-1">Export Magnets</Button>
              </ExportDropdown>
              
              <Button
                variant="outline"
                size="lg"
                class="flex-1 text-destructive hover:text-destructive"
                disabled={collectedMagnetLinks === 0}
                onclick={() => (showDeleteAllDialog = true)}
              >
                <Trash2 class="w-4 h-4 mr-2" />
                Delete All
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <section aria-labelledby="magnet-list-controls">
          <h2 id="magnet-list-controls" class="sr-only">Magnet Link Controls</h2>
          <Input
            type="text"
            placeholder="Search magnet links..."
            bind:value={searchTerm}
            class="mb-3"
            aria-label="Search magnet links"
          />

          <div class="flex gap-2 mb-4 flex-wrap">
            <Popover.Root bind:open={openSourcePopover}>
              <Popover.Trigger>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openSourcePopover}
                  class="w-[150px] justify-between"
                >
                  {selectedSourceFilter
                    ? sourceOptions.find((src) => src.value === selectedSourceFilter)?.label
                    : 'Filter Source'}
                  <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </Popover.Trigger>
              <Popover.Content class="w-[200px] p-0">
                <Command.Root>
                  <Command.Input placeholder="Search sources..." />
                  <Command.Empty>No source found.</Command.Empty>
                  <Command.Group>
                    <Command.List>
                      {#each sourceOptions as src}
                        <Command.Item
                          value={src.label}
                          onSelect={() => {
                            selectedSourceFilter = src.value
                            openSourcePopover = false
                          }}
                        >
                          <Check
                            class={cn(
                              'mr-2 h-4 w-4',
                              selectedSourceFilter === src.value ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          {src.label}
                        </Command.Item>
                      {/each}
                    </Command.List>
                  </Command.Group>
                </Command.Root>
              </Popover.Content>
            </Popover.Root>

            <Popover.Root bind:open={openOrderPopover}>
              <Popover.Trigger>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openOrderPopover}
                  class="w-[180px] justify-between"
                >
                  {selectedOrder
                    ? orderOptions.find((order) => order.value === selectedOrder)?.label
                    : 'Order By Date'}
                  <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </Popover.Trigger>
              <Popover.Content class="w-[200px] p-0">
                <Command.Root>
                  <Command.Group>
                    <Command.List>
                      {#each orderOptions as order}
                        <Command.Item
                          value={order.label}
                          onSelect={() => {
                            selectedOrder = order.value
                            openOrderPopover = false
                          }}
                        >
                          <Check
                            class={cn(
                              'mr-2 h-4 w-4',
                              selectedOrder === order.value ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          {order.label}
                        </Command.Item>
                      {/each}
                    </Command.List>
                  </Command.Group>
                </Command.Root>
              </Popover.Content>
            </Popover.Root>
          </div>
        </section>

        <section aria-labelledby="magnet-links-heading">
          <h2 id="magnet-links-heading" class="sr-only">Collected Magnet Links</h2>
          <MagnetList
            magnetLinks={filteredAndOrderedMagnetLinks}
            onDelete={handleDeleteMagnet}
            onCopy={handleCopyMagnetLink}
          />
        </section>
      </CardContent>
    </Card>

    <AlertDialog.Root bind:open={showDeleteAllDialog}>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Delete All Magnet Links?</AlertDialog.Title>
          <AlertDialog.Description>
            This action cannot be undone. This will permanently delete all {collectedMagnetLinks} magnet links from your collection.
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
          <AlertDialog.Action
            onclick={handleDeleteAll}
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete All
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Root>
  {/if}
</div>
