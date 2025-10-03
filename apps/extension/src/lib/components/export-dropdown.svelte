<script lang="ts">
  import * as DropdownMenu from "@/lib/components/ui/dropdown-menu";
  import { Button } from "@/lib/components/ui/button";
  import { Download } from "@lucide/svelte";

  function exportMagnets(format: "TXT" | "JSON" | "CSV") {
    console.log(`Exporting magnet links in ${format} format`);
    browser.runtime.sendMessage({ type: "EXPORT_MAGNETS", format });
  }
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="outline" size="sm" class="flex-1">
        <Download class="w-4 h-4 mr-2" />
        Export
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content class="w-44" align="start">
    <DropdownMenu.Group>
      <DropdownMenu.Label class="text-xs font-medium text-muted-foreground">
        Export Format
      </DropdownMenu.Label>
      <DropdownMenu.Separator />
      <DropdownMenu.Item onclick={() => exportMagnets("TXT")} class="text-sm">
        Plain Text (.txt)
      </DropdownMenu.Item>
      <DropdownMenu.Item onclick={() => exportMagnets("JSON")} class="text-sm">
        JSON (.json)
      </DropdownMenu.Item>
      <DropdownMenu.Item onclick={() => exportMagnets("CSV")} class="text-sm">
        CSV (.csv)
      </DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
