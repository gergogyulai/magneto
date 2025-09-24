<!-- src/lib/components/magnet-list.svelte -->
<script lang="ts">
  import type { MagnetRecord } from "@/lib/types";
  import { parseTorrentName } from "@/lib/utils";
  import { Button } from "@/lib/components/ui/button";
  import * as DropdownMenu from "@/lib/components/ui/dropdown-menu";
  import { EllipsisVertical } from "@lucide/svelte";
  import { toast } from "svelte-sonner";

  // export let magnetLinks: MagnetRecord[] = [];


  // export let onDelete: (link: MagnetRecord) => void;

  let { magnetLinks = [] } : { magnetLinks: MagnetRecord[] } = $props();
  
  let displayLinks = $derived(magnetLinks.map((link) => ({
    ...link,
    name: parseTorrentName(link.magnetLink) || "Unknown Name",
  })));

  async function handleCopyMagnetUri(link: MagnetRecord) {
    try {
      await navigator.clipboard.writeText(link.magnetLink);
      console.log("Magnet link copied:", link.magnetLink);
      toast.success("Magnet link copied to clipboard");
    } catch (err) {
      console.error("Failed to copy magnet link:", err);
    }
  }

  async function handleDeleteMagnetUri(linkToDelete: MagnetRecord) {
    try {
      const updatedLinks = magnetLinks.filter(link => link.magnetLink !== linkToDelete.magnetLink);
      storage.setItem('local:magnetLinks', updatedLinks);
      toast.success("Magnet link removed from stash");
    } catch (err) {
      console.error("Failed to remove magnet link:", err);
      toast.error("Failed to remove magnet link");
    }
  }
</script>

<div class="space-y-2">
  {#if displayLinks.length === 0}
    <p class="text-center text-muted-foreground py-4">No magnet links found.</p>
  {:else}
    {#each displayLinks as link (link.magnetLink)}
      <div
        class="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-colors"
      >
        <span class="truncate text-sm" title={link.name}>{link.name}</span>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            {#snippet child({ props })}
              <Button variant="ghost" size="icon" {...props}>
                <EllipsisVertical class="w-4 h-4" />
                <span class="sr-only">Actions for {link.name}</span>
              </Button>
            {/snippet}
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.Group>
              <DropdownMenu.Item disabled class="text-xs text-muted-foreground"
                >Source: {link.source}</DropdownMenu.Item
              >
              <DropdownMenu.Separator />
              <DropdownMenu.Item onclick={() => handleCopyMagnetUri(link)}
                >Copy magnet link</DropdownMenu.Item
              >
              <DropdownMenu.Item
                onclick={() => window.open(link.magnetLink, "_blank")}
              >
                Open in client
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onclick={() => handleDeleteMagnetUri(link)}
                class="text-destructive">Delete from stash</DropdownMenu.Item
              >
            </DropdownMenu.Group>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    {/each}
  {/if}
</div>
