<script lang="ts">
  import '../app.css'
  import { onMount, onDestroy } from 'svelte'
  import { Button } from '$lib/components/ui/button'
  import { Badge } from '$lib/components/ui/badge'
  import { Separator } from '$lib/components/ui/separator'
  import { ScrollArea } from '$lib/components/ui/scroll-area'
  import { MagnetRecord } from '$lib/types'
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card'
  import { Link, Magnet, ChevronsUpDown, Check, Trash2 } from 'lucide-svelte'
  import Input from '$lib/components/ui/input/input.svelte'
  import * as Command from '$lib/components/ui/command/index.js'
  import * as Popover from '$lib/components/ui/popover/index.js'
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js'
  import { cn } from '$lib/utils.js'
  import ExportDropdown from '$lib/components/export-dropdown.svelte'
  import MagnetList from '$lib/components/magnet-list.svelte'

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
  let messageListener: ((message: any) => void) | null = null
  let updateInterval: NodeJS.Timeout | null = null
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
      const result = await chrome.storage.local.get(['magnetLinks'])
      const fetchedLinks: MagnetRecord[] = result.magnetLinks || []

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
      await chrome.storage.local.set({ magnetLinks: allMagnetLinks })
      lastUpdateTime = Date.now()
      
      // Notify other instances/tabs about the update
      chrome.runtime.sendMessage({ 
        type: 'MAGNET_LINKS_UPDATED',
        count: allMagnetLinks.length 
      }).catch(() => {
        // Ignore errors if background script isn't ready
      })
    } catch (error) {
      console.error('Error saving magnet links to storage:', error)
    }
  }

  // --- Real-time update handlers ---
  function setupMessageListener() {
    messageListener = (message) => {
      if (message.type === 'MAGNET_LINKS_UPDATED' || message.type === 'NEW_MAGNET_LINK') {
        console.log('Received update message:', message.type)
        updateMagnetLinksFromStorage()
      }
    }
    
    chrome.runtime.onMessage.addListener(messageListener)
  }

  function setupPeriodicRefresh() {
    // Check for updates every 2 seconds when the popup is open
    updateInterval = setInterval(async () => {
      await updateMagnetLinksFromStorage()
    }, 2000)
  }

  function cleanupListeners() {
    if (messageListener) {
      chrome.runtime.onMessage.removeListener(messageListener)
      messageListener = null
    }
    
    if (updateInterval) {
      clearInterval(updateInterval)
      updateInterval = null
    }
  }

  // --- Storage change listener for even more real-time updates ---
  function setupStorageListener() {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local' && changes.magnetLinks) {
        console.log('Storage changed, updating links')
        updateMagnetLinksFromStorage()
      }
    })
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
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    if (tab.url) {
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-devtools://')) {
        isBuiltInChrome = true
      } else {
        currentHost = new URL(tab.url).hostname
      }
    }

    if (isBuiltInChrome) {
      return
    }

    // Load initial settings
    const result = await chrome.storage.sync.get(['isCollecting', 'whitelistedHosts'])
    isCollecting = result.isCollecting ?? false
    whitelistedHosts = result.whitelistedHosts ?? []

    // Initial load of magnet links
    await updateMagnetLinksFromStorage()

    // Setup all real-time update mechanisms
    setupMessageListener()
    setupStorageListener()
    setupPeriodicRefresh()

    console.log('Real-time updates initialized')
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
        <CardDescription>Not available on Chrome internal pages</CardDescription>
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
                on:click={() => (showDeleteAllDialog = true)}
              >
                <Trash2 class="w-4 h-4 mr-2" />
                Delete All
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <!-- Search, filter & order controls -->
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
            <!-- Source Filter Dropdown -->
            <Popover.Root bind:open={openSourcePopover}>
              <Popover.Trigger asChild let:builder>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openSourcePopover}
                  class="w-[150px] justify-between"
                  builders={[builder]}
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

            <!-- Order By Dropdown -->
            <Popover.Root bind:open={openOrderPopover}>
              <Popover.Trigger asChild let:builder>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openOrderPopover}
                  class="w-[180px] justify-between"
                  builders={[builder]}
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

        <!-- Magnet Link List -->
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

    <!-- Delete All Confirmation Dialog -->
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
            on:click={handleDeleteAll}
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete All
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Root>
  {/if}
</div>