<!-- src/lib/components/magnet-list.svelte -->
<script lang="ts">
  import { MagnetRecord } from '$lib/types'
  import { parseTorrentName } from '$lib/utils'
  import { Button } from '$lib/components/ui/button'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import { EllipsisVertical } from 'lucide-svelte'
  import SvelteVirtualList from '@humanspeak/svelte-virtual-list'

  export let magnetLinks: MagnetRecord[] = []

  // Events to propagate actions to the parent
  export let onDelete: (link: MagnetRecord) => void
  export let onCopy: (link: MagnetRecord) => void

  $: displayLinks = magnetLinks.map((link) => ({
    ...link,
    name: parseTorrentName(link.magnetLink) || 'Unknown Name',
  }))
</script>

<div class="space-y-2">
  {#if displayLinks.length === 0}
    <p class="text-center text-muted-foreground py-4">No magnet links found.</p>
  {:else}
   {#each displayLinks as link (link.magnetLink)}
      <div class="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-colors">
        <span class="truncate text-sm" title={link.name}>{link.name}</span>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild let:builder>
            <Button variant="ghost" size="icon" builders={[builder]}>
              <EllipsisVertical class="w-4 h-4" />
              <span class="sr-only">Actions for {link.name}</span>
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.Group>
              <DropdownMenu.Item disabled class="text-xs text-muted-foreground"
                >Source: {link.source}</DropdownMenu.Item
              >
              <DropdownMenu.Separator />
              <DropdownMenu.Item on:click={() => onCopy(link)}>Copy magnet link</DropdownMenu.Item>
              <!-- Potentially open in client, but requires a way to handle the magnet URI scheme -->
              <DropdownMenu.Item href={link.magnetLink} target="_blank">Open in client</DropdownMenu.Item>
              <DropdownMenu.Item on:click={() => onDelete(link)} class="text-destructive"
                >Remove</DropdownMenu.Item
              >
            </DropdownMenu.Group>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    {/each}
  {/if}
</div>