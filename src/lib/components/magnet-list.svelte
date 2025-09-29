<!-- src/lib/components/magnet-list.svelte -->
<script lang="ts">
  import type { MagnetRecord } from "@/lib/types";
  import { Button } from "@/lib/components/ui/button";
  import { Badge } from "@/lib/components/ui/badge";
  import * as DropdownMenu from "@/lib/components/ui/dropdown-menu";
  import { EllipsisVertical, Magnet, Copy, ExternalLink, Trash2, Globe } from "@lucide/svelte";
  import { toast } from "svelte-sonner";

  let { 
    magnetLinks = [], 
    onDelete 
  } : { 
    magnetLinks: MagnetRecord[],
    onDelete?: (link: MagnetRecord) => void 
  } = $props();
  
  async function handleCopyMagnetUri(link: MagnetRecord) {
    try {
      await navigator.clipboard.writeText(link.magnetLink);
      console.log("Magnet link copied:", link.magnetLink);
      toast.success("Magnet link copied to clipboard");
    } catch (err) {
      console.error("Failed to copy magnet link:", err);
      toast.error("Failed to copy magnet link");
    }
  }

  async function handleDeleteMagnetUri(linkToDelete: MagnetRecord) {
    try {
      if (onDelete) {
        onDelete(linkToDelete);
        toast.success("Magnet link removed from stash");
      } else {
        toast.error("Delete operation not available");
      }
    } catch (err) {
      console.error("Failed to remove magnet link:", err);
      toast.error("Failed to remove magnet link");
    }
  }

  function getHostname(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }
</script>

<div class="space-y-3">
  {#if magnetLinks.length === 0}
    <div class="flex flex-col items-center justify-center py-12 text-center">
      <div class="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
        <Magnet class="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 class="text-lg font-medium text-foreground mb-2">No magnets found</h3>
      <p class="text-sm text-muted-foreground max-w-sm">
        Start browsing supported sites to collect magnet links automatically
      </p>
    </div>
  {:else}
    {#each magnetLinks as link (link.magnetLink)}
      <div class="group relative rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-2">
              <Magnet class="w-4 h-4 text-primary flex-shrink-0" />
              <h4 class="font-medium text-sm leading-tight truncate" title={link.name}>
                {link.name || 'Untitled Magnet'}
              </h4>
            </div>
            
            {#if link.source}
              <div class="flex items-center gap-1.5 mb-2">
                <Globe class="w-3 h-3 text-muted-foreground" />
                <Badge variant="secondary" class="text-xs px-2 py-0.5">
                  {getHostname(link.source)}
                </Badge>
              </div>
            {/if}
            
            <p class="text-xs text-muted-foreground font-mono truncate" title={link.magnetLink}>
              {link.magnetLink}
            </p>
          </div>
          
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              {#snippet child({ props })}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  class="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  {...props}
                >
                  <EllipsisVertical class="w-4 h-4" />
                  <span class="sr-only">Actions for {link.name || 'magnet link'}</span>
                </Button>
              {/snippet}
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end" class="w-48">
              <DropdownMenu.Group>
                <DropdownMenu.Item onclick={() => handleCopyMagnetUri(link)} class="text-sm">
                  <Copy class="w-4 h-4 mr-2" />
                  Copy magnet link
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onclick={() => window.open(link.magnetLink, "_blank")}
                  class="text-sm"
                >
                  <ExternalLink class="w-4 h-4 mr-2" />
                  Open in client
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item
                  onclick={() => handleDeleteMagnetUri(link)}
                  class="text-destructive text-sm"
                >
                  <Trash2 class="w-4 h-4 mr-2" />
                  Remove from stash
                </DropdownMenu.Item>
              </DropdownMenu.Group>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>
    {/each}
  {/if}
</div>
