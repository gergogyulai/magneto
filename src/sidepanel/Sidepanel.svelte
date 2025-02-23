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
  import { EllipsisVertical, Link, Magnet, Check, ChevronsUpDown } from 'lucide-svelte';
  import { parseTorrentName } from '$lib/utils'
  import Input from '$lib/components/ui/input/input.svelte'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import { tick } from "svelte";
  import * as Command from "$lib/components/ui/command/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { cn } from "$lib/utils.js";
  import ExportDropdown from "$lib/components/export-dropdown.svelte";

  let isCollecting = false
  let whitelistedHosts: string[] = []
  let currentHost = ''
  let collectedMagnetLinks: number = 0
  let collectedMagnetLinksThisSite: number = 0
  let isBuiltInChrome = false

  // New state variables for handling magnet links, search, filter and order.
  let magnetLinksArray: MagnetRecord[] = []
  let searchTerm = ''
  let selectedSourceFilter = ''
  let selectedOrder = ''

  // Compute available sources for filter.
  $: availableSources = [...new Set(magnetLinksArray.map(item => item.source))]

  // Filter and order magnet links.
  $: filteredMagnetLinks = (() => {
    let filtered = magnetLinksArray.filter(link => {
      const torrentName = (parseTorrentName(link.magnetLink) || '').toLowerCase()
      return torrentName.includes(searchTerm.toLowerCase()) && (selectedSourceFilter ? link.source === selectedSourceFilter : true)
    })
    if (selectedOrder === 'asc') {
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    } else if (selectedOrder === 'desc') {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }
    return filtered
  })()

  // New state for popovers and ordering options
  let openSource = false;
  let openOrder = false;
  const orderOptions = [
    { value: '', label: 'No ordering' },
    { value: 'asc', label: 'Date Ascending' },
    { value: 'desc', label: 'Date Descending' }
  ];
  $: sourceOptions = [{ value: '', label: 'All sources' }, ...availableSources.map(src => ({ value: src, label: src }))];

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

    const result = await chrome.storage.sync.get(['isCollecting', 'whitelistedHosts'])
    const magnetLinks = await chrome.storage.local.get(['magnetLinks'])
    collectedMagnetLinks = magnetLinks.magnetLinks?.length ?? 0
    collectedMagnetLinksThisSite =
      magnetLinks.magnetLinks?.filter((link: MagnetRecord) => link.source.includes(currentHost))
        .length ?? 0
    isCollecting = result.isCollecting ?? false
    whitelistedHosts = result.whitelistedHosts ?? []
    // Save full list into local state.
    magnetLinksArray = magnetLinks.magnetLinks ?? []

    // Add listener for magnet link updates
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'MAGNET_LINKS_UPDATED') {
        chrome.storage.local.get(['magnetLinks'], (result) => {
          magnetLinksArray = result.magnetLinks || [];
          collectedMagnetLinks = magnetLinksArray.length;
          collectedMagnetLinksThisSite = magnetLinksArray.filter(
            (link) => link.source.includes(currentHost)
          ).length;
        });
      }
    });
  })

  // New function to delete a magnet link.
  async function deleteMagnet(link: MagnetRecord) {
    magnetLinksArray = magnetLinksArray.filter((item) => item !== link)
    collectedMagnetLinks = magnetLinksArray.length
    collectedMagnetLinksThisSite = magnetLinksArray.filter((item) =>
      item.source.includes(currentHost),
    ).length
    await chrome.storage.local.set({ magnetLinks: magnetLinksArray })
  }

  async function copyMagnetLink(link: MagnetRecord) {
    await navigator.clipboard.writeText(link.magnetLink)
  }
</script>

<div class=" select-none">
  {#if isBuiltInChrome}
    <Card class="min-w-80 rounded-none pb-5">
      <CardHeader>
        <CardTitle class="flex items-center gap-2"><Magnet />Magneto</CardTitle>
        <CardDescription>Not available on Chrome internal pages</CardDescription>
      </CardHeader>
    </Card>
  {:else}
    <Card class="min-w-80 min-h-screen rounded-none">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="flex items-center gap-2"><Magnet />Magneto</CardTitle>
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
                {collectedMagnetLinksThisSite} from this site
              </span>
            {/if}
            <ExportDropdown>
              <Button variant="outline" size="lg" class="w-full">Export Magnets</Button>
            </ExportDropdown>
          </div>
        </div>

        <Separator />

        <!-- New section: Search, filter & order magnet links -->
        <div class="mt-4">
          <Input
            type="text"
            placeholder="Search magnet links"
            bind:value={searchTerm}
            class="mb-4"
          />
          <ul class="space-y-2">
            {#each filteredMagnetLinks as link, idx}
            <li class="flex items-center justify-between">
              <span class="truncate">{parseTorrentName(link.magnetLink)}</span>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <Button variant="ghost" size="icon">
                    <EllipsisVertical/>
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Group>
                    <DropdownMenu.Item disabled>source: {link.source}</DropdownMenu.Item>
                    <DropdownMenu.Item on:click={() => copyMagnetLink(link)}>Copy magnet link</DropdownMenu.Item>
                    <!-- <DropdownMenu.Item href={link.magnetLink}>Open in client</DropdownMenu.Item> -->
                    <DropdownMenu.Item on:click={() => deleteMagnet(link)}>Remove</DropdownMenu.Item>
                  </DropdownMenu.Group>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </li>
            {/each}
          </ul>
        </div>
      </CardContent>
    </Card>
  {/if}
</div>
