<script lang="ts">
  import type { MagnetRecord } from "@/lib/types";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from "@/lib/components/ui/card";
  import { Input } from "@/lib/components/ui/input";
  import { Separator } from "@/lib/components/ui/separator";
  import { Button } from "@/lib/components/ui/button";
  import { Badge } from "@/lib/components/ui/badge";
  import { Magnet, Search, Link, Trash2, Settings, Download, Globe } from "@lucide/svelte";
  import ExportDropdown from "@/lib/components/export-dropdown.svelte";
  import MagnetList from "@/lib/components/magnet-list.svelte";
  import { Toaster } from "@/lib/components/ui/sonner";
  import { ReactiveStorage } from "@/lib/reactive-storage.svelte";
  import GlobalLayout from "@/lib/components/global-layout.svelte";
  import { STORAGE_KEYS } from "@/lib/constants";
  import { currentTab } from "@/lib/current-host.svelte";

  const magnetStash = new ReactiveStorage<MagnetRecord[]>(
    STORAGE_KEYS.STASH,
    []
  );
  let currentHost = $derived<string | null>(currentTab.hostname);

  console.log(magnetStash.current);

  let searchTerm = $state<string>("");

  let filteredMagnetLinks = $derived<MagnetRecord[]>(
    !searchTerm.trim()
      ? magnetStash.current!
      : magnetStash.current!.filter((link: MagnetRecord) =>
          (link.name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase().trim())
        )
  );

  let collectedMagnetLinks = $derived<number>(filteredMagnetLinks.length);
  let collectedMagnetLinksThisSite = $derived<number>(
    filteredMagnetLinks.filter(
      (link: MagnetRecord) => link.source === currentHost
    ).length
  );

  let totalMagnetLinks = $derived<number>(magnetStash.current!.length);
  let totalMagnetLinksThisSite = $derived<number>(
    magnetStash.current!.filter(
      (link: MagnetRecord) => link.source === currentHost
    ).length
  );

  function handleDeleteMagnet(linkToDelete: MagnetRecord) {
    magnetStash.current! = magnetStash.current!.filter(
      (link) => link.magnetLink !== linkToDelete.magnetLink
    );
  }

  let filteringSourceOptions = $derived<
    Array<{ label: string; value: string | null }>
  >(
    magnetStash
      .current!.map((link: MagnetRecord) => link.source || "Unknown Source")
      .filter((value, index, self) => self.indexOf(value) === index)
      .map((source) => ({
        label: source === "Unknown Source" ? source : new URL(source).hostname,
        value: source,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
      .concat([{ label: "All Sources", value: "" }])
  );
  let filteringSelectedSourceOption = $state<string | null>("");
</script>

<GlobalLayout>
  <Toaster />
  <div class="flex flex-col h-screen bg-background">
    <!-- Header Section -->
    <div class="flex-none border-b bg-card">
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Magnet class="h-5 w-5" />
            </div>
            <div>
              <h1 class="text-xl font-semibold tracking-tight">Magneto</h1>
              <p class="text-sm text-muted-foreground">Magnet link collector</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onclick={() => browser.runtime.openOptionsPage()}
            class="h-9 w-9"
          >
            <Settings class="w-4 h-4" />
            <span class="sr-only">Open settings</span>
          </Button>
        </div>

        <!-- Stats Overview -->
        <div class="grid grid-cols-2 gap-3">
          <Card class="p-4">
            <div class="flex items-center gap-2 mb-2">
              <Link class="w-4 h-4 text-primary" />
              <span class="text-sm font-medium">Total</span>
            </div>
            <div class="text-2xl font-bold">{collectedMagnetLinks}</div>
            <p class="text-xs text-muted-foreground mt-1">Magnet links</p>
          </Card>
          
          <Card class="p-4">
            <div class="flex items-center gap-2 mb-2">
              <Globe class="w-4 h-4 text-primary" />
              <span class="text-sm font-medium">Current Site</span>
            </div>
            <div class="text-2xl font-bold">{collectedMagnetLinksThisSite}</div>
            {#if currentHost}
              <p class="text-xs text-muted-foreground mt-1 truncate" title={currentHost}>
                {currentHost}
              </p>
            {:else}
              <p class="text-xs text-muted-foreground mt-1">No active site</p>
            {/if}
          </Card>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2 mt-4">
          <ExportDropdown />
          <Button
            variant="outline"
            size="sm"
            class="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
            disabled={collectedMagnetLinks === 0}
            onclick={() => {
              if (confirm("Are you sure you want to delete all magnet links?")) {
                magnetStash.current! = [];
              }
            }}
          >
            <Trash2 class="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>
    </div>

    <!-- Search Section -->
    <div class="flex-none p-4 border-b bg-muted/30">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search magnet links..."
          bind:value={searchTerm}
          class="pl-10"
          aria-label="Search magnet links"
        />
      </div>
      {#if searchTerm.trim()}
        <div class="flex items-center gap-2 mt-2">
          <Badge variant="secondary" class="text-xs">
            {collectedMagnetLinks} results
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onclick={() => (searchTerm = "")}
            class="h-6 px-2 text-xs"
          >
            Clear
          </Button>
        </div>
      {/if}
    </div>

    <!-- Content Section -->
    <div class="flex-1 overflow-hidden">
      <div class="h-full overflow-y-auto">
        <div class="p-4">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-medium">
              {#if searchTerm.trim()}
                Search Results
              {:else}
                Your Magnet Collection
              {/if}
            </h2>
            {#if collectedMagnetLinks > 0 && !searchTerm.trim()}
              <Badge variant="outline" class="text-xs">
                {totalMagnetLinks} total
              </Badge>
            {/if}
          </div>
          
          <section aria-labelledby="magnet-links-heading">
            <h3 id="magnet-links-heading" class="sr-only">
              Collected Magnet Links
            </h3>
            <MagnetList
              magnetLinks={filteredMagnetLinks}
              onDelete={handleDeleteMagnet}
            />
          </section>
        </div>
      </div>
    </div>
  </div>
</GlobalLayout>
