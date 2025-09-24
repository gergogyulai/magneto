<script lang="ts">
  import * as DropdownMenu from "@/lib/components/ui/dropdown-menu";
  import { Button } from "@/lib/components/ui/button";

  function exportMagnets(format: "TXT" | "JSON" | "CSV") {
    console.log(`Exporting magnet links in ${format} format`);
    browser.runtime.sendMessage({ type: 'EXPORT_MAGNETS', format });
  }
</script>
 
<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <Button>Export in</Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Group>
      <DropdownMenu.Item onclick={() => exportMagnets("TXT")}>TXT</DropdownMenu.Item>
      <DropdownMenu.Item onclick={() => exportMagnets("JSON")}>JSON</DropdownMenu.Item>
      <DropdownMenu.Item onclick={() => exportMagnets("CSV")}>CSV</DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
