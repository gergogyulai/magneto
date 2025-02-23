<script lang="ts">
  import '../app.css'
  import { onMount } from 'svelte'
  import { Button } from '$lib/components/ui/button'
  import { Switch } from '$lib/components/ui/switch'
  import { Badge } from '$lib/components/ui/badge'
  import { Separator } from '$lib/components/ui/separator'
  import { ScrollArea } from '$lib/components/ui/scroll-area'
  import { MagnetRecord } from '$lib/types'
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from '$lib/components/ui/card'
  import { Settings, Link, AlertCircle, Plus, X, Magnet } from 'lucide-svelte'

  let isCollecting = false
  let whitelistedHosts: string[] = []
  let currentHost = ''
  let collectedMagnetLinks: number = 0
  let collectedMagnetLinksThisSite: number = 0
  let isBuiltInChrome = false // flag for built-in chrome pages
  let tabId: number

  onMount(async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab || typeof tab.id !== 'number') return
    tabId = tab.id

    if (tab.url) {
      // Check if the URL is a built-in Chrome page.
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-devtools://')) {
        isBuiltInChrome = true
      } else {
        currentHost = new URL(tab.url).hostname
      }
    }

    // If it's a built-in Chrome page, exit early.
    if (isBuiltInChrome) {
      return
    }

    const result = await chrome.storage.sync.get(['isCollecting', 'whitelistedHosts'])
    const magnetLinks = await chrome.storage.local.get(['magnetLinks'])
    collectedMagnetLinks = magnetLinks.magnetLinks?.length ?? 0
    collectedMagnetLinksThisSite =
      magnetLinks.magnetLinks?.filter((link: MagnetRecord) => link.source.includes(currentHost))
        .length ?? 0
    isCollecting = result.isCollecting ?? false
    whitelistedHosts = result.whitelistedHosts ?? []
  })

  function toggleCollection() {
    isCollecting = !isCollecting
    chrome.storage.sync.set({ isCollecting })
    chrome.runtime.sendMessage({ type: 'TOGGLE_COLLECTION', isCollecting })
  }

  function addCurrentHost() {
    if (currentHost && !whitelistedHosts.includes(currentHost)) {
      whitelistedHosts = [...whitelistedHosts, currentHost]
      chrome.storage.sync.set({ whitelistedHosts })
    }
  }

  function removeHost(host: string) {
    whitelistedHosts = whitelistedHosts.filter((h) => h !== host)
    chrome.storage.sync.set({ whitelistedHosts })
  }

  function openSidePanel() {
    // Check if the sidePanel API is available
    if (!chrome.sidePanel) {
      console.error("SidePanel API is not available.");
      return;
    }
    // Validate tabId
    if (typeof tabId !== 'number') {
      console.error("Tab ID is not available.");
      return;
    }
    try {
      chrome.sidePanel.open({ tabId });
      window.close();
    } catch (error) {
      console.error("Error opening side panel:", error);
    }
  }
</script>

<div class="select-none">
  {#if isBuiltInChrome}
    <Card class="min-w-80 rounded-none pb-5">
      <CardHeader>
        <CardTitle class="flex items-center gap-2"><Magnet/>Magneto</CardTitle>
        <CardDescription>
          <AlertCircle class="inline-block w-4 h-4 mr-1" />
          Not available on Chrome internal pages
        </CardDescription>
      </CardHeader>
    </Card>
  {:else}
    <Card class="min-w-80 rounded-none">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="flex items-center gap-2"><Magnet/>Magneto</CardTitle>
          <Switch checked={isCollecting} on:click={toggleCollection} />
        </div>
      </CardHeader>

      <CardContent class="flex flex-col gap-6">
        <!-- Stats Section -->
        <div class="grid gap-4">
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-muted-foreground">
              <Link class="w-4 h-4" />
              <span class="text-sm font-medium">Total Magnets</span>
            </div>
            <div class="text-2xl font-bold">{collectedMagnetLinks}</div>
            {#if currentHost}
              <span class="text-sm text-muted-foreground">
                {collectedMagnetLinksThisSite} from this site
              </span>
            {/if}
            <!-- <div class="flex gap-2"> -->
              <Button
                variant="outline"
                size="sm"
                on:click={openSidePanel}
              >
                View Magnets
              </Button>
            <!-- </div> -->
          </div>
        </div>

        <Separator />

        <!-- Current Site Section -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium text-muted-foreground">Current site</h3>
            <Button
              variant="outline"
              size="sm"
              on:click={addCurrentHost}
              disabled={!currentHost || whitelistedHosts.includes(currentHost)}
            >
              <Plus class="w-4 h-4 mr-1" />
              Whitelist
            </Button>
          </div>
          <Badge variant="outline" class="w-full justify-center">
            {currentHost || 'No site detected'}
          </Badge>
        </div>

        <!-- Whitelist Section -->
        <div class="space-y-3">
          <h3 class="text-sm font-medium text-muted-foreground">Whitelisted Sites</h3>
          <Card>
            <ScrollArea class="h-40 w-full rounded-md">
              <div class="p-3 flex flex-col gap-2">
                {#if whitelistedHosts.length === 0}
                  <span class="text-sm text-muted-foreground text-center p-4">
                    No sites whitelisted
                  </span>
                {/if}
                {#each whitelistedHosts as host}
                  <div class="flex items-center justify-between gap-2 group">
                    <Badge variant="secondary" class="truncate flex-1">{host}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-6 w-6"
                      on:click={() => removeHost(host)}
                    >
                      <X class="h-4 w-4" />
                    </Button>
                  </div>
                {/each}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </CardContent>
    </Card>
  {/if}
</div>
