<script lang="ts">
  import { Button } from "@/lib/components/ui/button";
  import { Switch } from "@/lib/components/ui/switch";
  import { Badge } from "@/lib/components/ui/badge";
  import { Separator } from "@/lib/components/ui/separator";
  import { ScrollArea } from "@/lib/components/ui/scroll-area";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from "@/lib/components/ui/card";
  import {
    AlertCircle,
    Link,
    Magnet,
    Plus,
    X,
    ExternalLink,
    Shield,
    Activity,
    Pause,
  } from "@lucide/svelte";
  import { browser } from "wxt/browser";
  import { createStorageState } from "@/lib/reactive-localstorage.svelte";
  import { currentTab } from "@/lib/current-host.svelte";

  type MagnetRecord = {
    magnetLink: string;
    name: string | null;
    date: string;
    source: string;
  };

  const magnetStash = createStorageState<MagnetRecord[]>(
    "local:magnetLinks",
    []
  );
  const whitelistedHosts = createStorageState<string[]>(
    "sync:whitelistedHosts",
    []
  );
  const isCollecting = createStorageState<boolean>("sync:isCollecting", false);

  let isBuiltInChrome = $derived(
    currentTab.protocol === "chrome:" ||
      currentTab.protocol === "chrome-devtools:"
  );

  let totalMagnetLinks = $derived<number>(magnetStash.value.length);
  let totalMagnetLinksThisSite = $derived<number>(
    magnetStash.value.filter(
      (link: MagnetRecord) => link.source === currentTab.hostname
    ).length
  );
  let isCurrentHostWhitelisted = $derived(
    currentTab.hostname && whitelistedHosts.value.includes(currentTab.hostname)
  );

  async function toggleCollection() {
    try {
      let isCollectingTemp = !isCollecting.value;
      await browser.storage.sync.set({ isCollecting: isCollectingTemp });

      if (isCollecting && currentTab.tabId) {
        await browser.tabs.sendMessage(currentTab.tabId, {
          type: "COLLECT_MAGNETS",
        });
      }
    } catch (error) {
      console.error("Error toggling collection:", error);
    }
  }

  async function addCurrentHost() {
    if (!currentTab.hostname || isCurrentHostWhitelisted) return;

    try {
      await browser.storage.sync.set({
        whitelistedHosts: [...whitelistedHosts.value, currentTab.hostname],
      });

      if (isCollecting && currentTab.tabId) {
        await browser.tabs.sendMessage(currentTab.tabId, {
          type: "COLLECT_MAGNETS",
        });
      }
    } catch (error) {
      console.error("Failed to add host:", error);
    }
  }

  async function removeHost(host: string) {
    try {
      await browser.storage.sync.set({
        whitelistedHosts: whitelistedHosts.value.filter((h) => h !== host),
      });
    } catch (error) {
      console.error("Failed to remove host:", error);
    }
  }

  function openSidePanel() {
    if (!browser.sidePanel) {
      console.error("SidePanel API is not available.");
      return;
    }
    if (typeof currentTab.tabId !== "number") {
      console.error("Tab ID is not available.");
      return;
    }
    try {
      browser.sidePanel.open({ tabId: currentTab.tabId });
      window.close();
    } catch (error) {
      console.error("Error opening side panel:", error);
    }
  }
</script>

<div class="w-80 select-none">
  <Card class="border-0 shadow-none gap-4">
    {#if isBuiltInChrome}
      <CardContent
        class="flex flex-col items-center justify-center py-8 text-center"
      >
        <div class="rounded-full bg-muted p-3 mb-4">
          <AlertCircle class="h-6 w-6 text-muted-foreground" />
          {currentTab.protocol}
        </div>
        <h3 class="font-semibold mb-2">Not Available</h3>
        <p class="text-sm text-muted-foreground leading-relaxed">
          Magneto cannot run on Chrome internal pages.
        </p>
      </CardContent>
    {:else}
      <!-- Header -->
      <CardHeader>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="rounded-lg bg-primary/10 p-2">
              <Magnet class="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle class="text-lg">Magneto</CardTitle>
              <CardDescription class="text-xs">
                Magnet link collector
              </CardDescription>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1.5">
              {#if isCollecting.value}
                <Activity class="h-3 w-3 text-green-500" />
                <span class="text-xs text-muted-foreground">Active</span>
              {:else}
                <Pause class="h-3 w-3 text-orange-500" />
                <span class="text-xs text-muted-foreground">Paused</span>
              {/if}
            </div>
            <Switch
              checked={isCollecting.value}
              onCheckedChange={toggleCollection}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent class="space-y-6">
        <!-- Stats Section -->
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-4 rounded-lg bg-muted/50">
              <div class="text-2xl font-bold text-primary mb-1">
                {totalMagnetLinks}
              </div>
              <div class="text-xs text-muted-foreground">Total magnets</div>
            </div>
            <div class="text-center p-4 rounded-lg bg-muted/50">
              <div class="text-2xl font-bold text-primary mb-1">
                {totalMagnetLinksThisSite}
              </div>
              <div class="text-xs text-muted-foreground">This site</div>
            </div>
          </div>

          <Button onclick={openSidePanel} class="w-full" >
            <ExternalLink class="h-4 w-4" />
            Open Magnet Explorer
          </Button>
        </div>


        <!-- Current Site Section -->
        <div class="space-y-2">
          <div class="flex items-center gap-2 mb-3">
            <Shield class="h-4 w-4 text-muted-foreground" />
            <h3 class="text-sm font-medium">Whitelist Management</h3>
          </div>

          <div
            class="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium truncate">
                {currentTab.hostname || "No site detected"}
              </div>
              <div class="text-xs text-muted-foreground">
                {isCurrentHostWhitelisted ? "Whitelisted site" : "Current site"}
              </div>
            </div>
            <Button
              variant={isCurrentHostWhitelisted ? "secondary" : "outline"}
              size="sm"
              onclick={addCurrentHost}
              disabled={!(currentTab.hostname && !isCurrentHostWhitelisted)}
              class="ml-2 shrink-0"
            >
              {#if isCurrentHostWhitelisted}
                <Shield class="h-4 w-4" />
              {:else}
                <Plus class="h-4 w-4 mr-1" />
                Add
              {/if}
            </Button>
          </div>
        </div>

        <!-- Whitelist Section -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-medium text-muted-foreground">
              Whitelisted Sites ({whitelistedHosts.value.length})
            </h4>
          </div>

          <Card class="border">
            <ScrollArea class="h-32">
              <div class="p-3">
                {#if whitelistedHosts.value.length === 0}
                  <div
                    class="flex flex-col items-center justify-center py-6 text-center"
                  >
                    <Shield class="h-6 w-6 text-muted-foreground mb-2" />
                    <p class="text-sm text-muted-foreground">
                      No sites whitelisted yet
                    </p>
                    <p class="text-xs text-muted-foreground mt-1">
                      Add trusted sites to auto-collect magnets
                    </p>
                  </div>
                {:else}
                  <div class="space-y-2">
                    {#each whitelistedHosts.value as host (host)}
                      <div
                        class="flex items-center justify-between gap-2 group hover:bg-muted/50 rounded-md p-2 -m-2"
                      >
                        <Badge
                          variant="secondary"
                          class="flex-1 justify-start truncate font-normal"
                        >
                          {host}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          class="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onclick={() => removeHost(host)}
                        >
                          <X class="h-3 w-3" />
                        </Button>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </CardContent>
    {/if}
  </Card>
</div>
