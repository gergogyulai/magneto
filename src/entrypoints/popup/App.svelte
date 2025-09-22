<script lang="ts">
  import { onMount } from 'svelte'
  import { Button } from '@/lib/components/ui/button'
  import { Switch } from '@/lib/components/ui/switch'
  import { Badge } from '@/lib/components/ui/badge'
  import { Separator } from '@/lib/components/ui/separator'
  import { ScrollArea } from '@/lib/components/ui/scroll-area'
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from '@/lib/components/ui/card'
  import { 
    AlertCircle, 
    Link, 
    Magnet, 
    Plus, 
    X, 
    ExternalLink,
    Shield,
    Activity,
    Pause
  } from '@lucide/svelte';
  import { browser } from 'wxt/browser'

  type MagnetRecord = {
    magnetLink: string
    name: string | null
    date: string
    source: string
  }

  // Svelte 5 runes - reactive state
  let isCollecting = $state(false)
  let whitelistedHosts = $state<string[]>([])
  let currentHost = $state('')
  let collectedMagnetLinks = $state(0)
  let collectedMagnetLinksThisSite = $state(0)
  let isBuiltInChrome = $state(false)
  let tabId = $state<number | undefined>(undefined)
  let isLoading = $state(false)

  // Derived state
  const isCurrentHostWhitelisted = $derived(
    currentHost && whitelistedHosts.includes(currentHost)
  )

  onMount(async () => {
    try {
      isLoading = true
      
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
      if (!tab || typeof tab.id !== 'number') return
      
      tabId = tab.id

      if (tab.url) {
        // Check if the URL is a built-in Chrome page
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-devtools://')) {
          isBuiltInChrome = true
        } else {
          currentHost = new URL(tab.url).hostname
        }
      }

      if (isBuiltInChrome) {
        return
      }

      // Load data from storage
      const [isCollectingResult, whitelistedHostsResult, magnetLinksResult] = 
        await Promise.all([
          browser.storage.sync.get('isCollecting'),
          browser.storage.sync.get('whitelistedHosts'),
          browser.storage.local.get(['magnetLinks'])
        ])

      // Update state
      isCollecting = isCollectingResult.isCollecting ?? false
      whitelistedHosts = whitelistedHostsResult.whitelistedHosts ?? []
      
      const magnetLinks = magnetLinksResult.magnetLinks || []
      collectedMagnetLinks = magnetLinks.length
      collectedMagnetLinksThisSite = magnetLinks.filter(
        (link: MagnetRecord) => link.source.includes(currentHost)
      ).length

      // Set up message listener
      browser.runtime.onMessage.addListener(handleMessage)
      
    } catch (error) {
      console.error('Error initializing popup:', error)
    } finally {
      isLoading = false
    }
  })

  function handleMessage(message: any) {
    if (message.type === 'MAGNET_LINKS_UPDATED') {
      updateMagnetCounts()
    }
  }

  async function updateMagnetCounts() {
    try {
      const result = await browser.storage.local.get(['magnetLinks'])
      const links = result.magnetLinks || []
      collectedMagnetLinks = links.length
      collectedMagnetLinksThisSite = links.filter(
        (link: MagnetRecord) => link.source.includes(currentHost)
      ).length
    } catch (error) {
      console.error('Error updating magnet counts:', error)
    }
  }

  async function toggleCollection() {
    try {
      isCollecting = !isCollecting
      await browser.storage.sync.set({ isCollecting })

      if (isCollecting && tabId) {
        await browser.tabs.sendMessage(tabId, { type: 'COLLECT_MAGNETS' })
      }
    } catch (error) {
      console.error('Error toggling collection:', error)
      // Revert state on error
      isCollecting = !isCollecting
    }
  }

  async function addCurrentHost() {
    if (!currentHost || isCurrentHostWhitelisted) return
    
    try {
      const newHosts = [...whitelistedHosts, currentHost]
      await browser.storage.sync.set({ whitelistedHosts: newHosts })
      whitelistedHosts = newHosts
      
      if (isCollecting && tabId) {
        await browser.tabs.sendMessage(tabId, { type: 'COLLECT_MAGNETS' })
      }
    } catch (error) {
      console.error('Failed to add host:', error)
      // Fallback to local storage
      try {
        const newHosts = [...whitelistedHosts, currentHost]
        await browser.storage.local.set({ whitelistedHosts: newHosts })
        whitelistedHosts = newHosts
      } catch (localError) {
        console.error('Local storage fallback failed:', localError)
      }
    }
  }

  async function removeHost(host: string) {
    try {
      const newHosts = whitelistedHosts.filter(h => h !== host)
      await browser.storage.sync.set({ whitelistedHosts: newHosts })
      whitelistedHosts = newHosts
    } catch (error) {
      console.error('Failed to remove host:', error)
      // Fallback to local storage
      try {
        const newHosts = whitelistedHosts.filter(h => h !== host)
        await browser.storage.local.set({ whitelistedHosts: newHosts })
        whitelistedHosts = newHosts
      } catch (localError) {
        console.error('Local storage fallback failed:', localError)
      }
    }
  }

  function openSidePanel() {
    if (!browser.sidePanel) {
      console.error('SidePanel API is not available.')
      return
    }
    if (typeof tabId !== 'number') {
      console.error('Tab ID is not available.')
      return
    }
    try {
      browser.sidePanel.open({ tabId })
      window.close()
    } catch (error) {
      console.error('Error opening side panel:', error)
    }
  }
</script>

<div class="w-80 select-none">
  <Card class="border-0 shadow-none">
    {#if isLoading}
      <CardContent class="flex flex-col items-center justify-center py-8 text-center">
        <div class="rounded-full bg-muted p-3 mb-4">
          <Activity class="h-6 w-6 text-muted-foreground animate-spin" />
        </div>
        <p class="text-sm text-muted-foreground">Loading...</p>
      </CardContent>
    {:else if isBuiltInChrome}
      <CardContent class="flex flex-col items-center justify-center py-8 text-center">
        <div class="rounded-full bg-muted p-3 mb-4">
          <AlertCircle class="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 class="font-semibold mb-2">Not Available</h3>
        <p class="text-sm text-muted-foreground leading-relaxed">
          Magneto cannot run on Chrome internal pages for security reasons.
        </p>
      </CardContent>
    {:else}
      <!-- Header -->
      <CardHeader class="pb-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="rounded-lg bg-primary/10 p-2">
              <Magnet class="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle class="text-lg">Magneto</CardTitle>
              <CardDescription class="text-xs">
                Magnet link collector
              </CardDescription>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1.5">
              {#if isCollecting}
                <Activity class="h-3 w-3 text-green-500" />
                <span class="text-xs text-muted-foreground">Active</span>
              {:else}
                <Pause class="h-3 w-3 text-orange-500" />
                <span class="text-xs text-muted-foreground">Paused</span>
              {/if}
            </div>
            <Switch 
              checked={isCollecting}
              onCheckedChange={toggleCollection}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent class="space-y-6">
        <!-- Stats Section -->
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-4 rounded-lg bg-muted/50">
              <div class="text-2xl font-bold text-primary mb-1">
                {collectedMagnetLinks}
              </div>
              <div class="text-xs text-muted-foreground">
                Total magnets
              </div>
            </div>
            <div class="text-center p-4 rounded-lg bg-muted/50">
              <div class="text-2xl font-bold text-primary mb-1">
                {collectedMagnetLinksThisSite}
              </div>
              <div class="text-xs text-muted-foreground">
                This site
              </div>
            </div>
          </div>
          
          <Button 
            onclick={openSidePanel}
            class="w-full" 
            size="sm"
          >
            <ExternalLink class="h-4 w-4 mr-2" />
            Open Magnet Explorer
          </Button>
        </div>

        <Separator />

        <!-- Current Site Section -->
        <div class="space-y-3">
          <div class="flex items-center gap-2 mb-3">
            <Shield class="h-4 w-4 text-muted-foreground" />
            <h3 class="text-sm font-medium">Site Management</h3>
          </div>
          
          <div class="flex items-center justify-between p-3 rounded-lg border bg-card">
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium truncate">
                {currentHost || 'No site detected'}
              </div>
              <div class="text-xs text-muted-foreground">
                {isCurrentHostWhitelisted ? 'Whitelisted site' : 'Current site'}
              </div>
            </div>
            <Button
              variant={isCurrentHostWhitelisted ? "secondary" : "outline"}
              size="sm"
              onclick={addCurrentHost}
              disabled={!(currentHost && !isCurrentHostWhitelisted)}
              class="ml-2 shrink-0"
            >
              {#if isCurrentHostWhitelisted}
                <Shield class="h-4 w-4" />
              {:else}
                <Plus class="h-4 w-4 mr-1" />
                Add
              {/if}
            </Button>
          </div>
        </div>

        <!-- Whitelist Section -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-medium text-muted-foreground">
              Whitelisted Sites ({whitelistedHosts.length})
            </h4>
          </div>
          
          <Card class="border">
            <ScrollArea class="h-32">
              <div class="p-3">
                {#if whitelistedHosts.length === 0}
                  <div class="flex flex-col items-center justify-center py-6 text-center">
                    <Shield class="h-6 w-6 text-muted-foreground mb-2" />
                    <p class="text-sm text-muted-foreground">
                      No sites whitelisted yet
                    </p>
                    <p class="text-xs text-muted-foreground mt-1">
                      Add trusted sites to auto-collect magnets
                    </p>
                  </div>
                {:else}
                  <div class="space-y-2">
                    {#each whitelistedHosts as host (host)}
                      <div class="flex items-center justify-between gap-2 group hover:bg-muted/50 rounded-md p-2 -m-2">
                        <Badge 
                          variant="secondary" 
                          class="flex-1 justify-start truncate font-normal"
                        >
                          {host}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          class="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onclick={() => removeHost(host)}
                        >
                          <X class="h-3 w-3" />
                        </Button>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </CardContent>
    {/if}
  </Card>
</div>