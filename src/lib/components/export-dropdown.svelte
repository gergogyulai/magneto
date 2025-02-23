<script lang="ts">
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

  function exportMagnets(format: "TXT" | "JSON" | "CSV") {
    console.log(`Exporting magnet links in ${format} format`);
    chrome.runtime.sendMessage({ type: 'EXPORT_MAGNETS', format });
  }
</script>
 
<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <slot/>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Group>
      <DropdownMenu.Item on:click={() => exportMagnets("TXT")}>TXT</DropdownMenu.Item>
      <DropdownMenu.Item on:click={() => exportMagnets("JSON")}>JSON</DropdownMenu.Item>
      <DropdownMenu.Item on:click={() => exportMagnets("CSV")}>CSV</DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
