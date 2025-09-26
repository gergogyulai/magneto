<script lang="ts">
  import * as DropdownMenu from "@/lib/components/ui/dropdown-menu";
  import { Button } from "@/lib/components/ui/button";

  function exportMagnets(format: "TXT" | "JSON" | "CSV") {
    console.log(`Exporting magnet links in ${format} format`);
    browser.runtime.sendMessage({ type: "EXPORT_MAGNETS", format });
  }
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="outline">Export stash</Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content class="w-56 ml-8">
    <DropdownMenu.Group>
      <DropdownMenu.Label>Export format</DropdownMenu.Label>
      <DropdownMenu.Separator />
      <DropdownMenu.Item onclick={() => exportMagnets("TXT")}>
        TXT
      </DropdownMenu.Item>
      <DropdownMenu.Item onclick={() => exportMagnets("JSON")}>
        JSON
      </DropdownMenu.Item>
      <DropdownMenu.Item onclick={() => exportMagnets("CSV")}
        >CSV
      </DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
