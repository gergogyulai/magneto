<script lang="ts">
  import { Button } from "@/lib/components/ui/button";
  import { Switch } from "@/lib/components/ui/switch";
  import { Badge } from "@/lib/components/ui/badge";
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
    Globe,
    Settings,
  } from "@lucide/svelte";
  import { browser } from "wxt/browser";
  import { currentTab } from "@/lib/current-host.svelte";
  import GlobalLayout from "@/lib/components/global-layout.svelte";
  import { STORAGE_KEYS } from "@/lib/constants";
  import type { MagnetRecord } from "@magneto/types";
  import { ReactiveStorage } from "@/lib/reactive-storage.svelte";
  import { checkWhitelist, minimatchPatternHostname } from "@/lib/utils";

  let magnetStash = new ReactiveStorage<MagnetRecord[]>(STORAGE_KEYS.STASH, []);
  let whitelistedHosts = new ReactiveStorage<string[]>(STORAGE_KEYS.WHITELISTED_HOSTS, ["example.com"]);
  let collectionEnabled = new ReactiveStorage<boolean>(STORAGE_KEYS.COLLECTION_ENABLED, true);

  $effect(() => {
    if (currentTab.tabId) {
      browser.tabs.sendMessage(currentTab.tabId, {
        type: "TOGGLE_COLLECTION",
      }).catch(error => {
        console.error("Error triggering collection:", error);
      });
    }
  });

  let isBuiltInChrome = $derived(
    currentTab.protocol === "chrome:" ||
      currentTab.protocol === "chrome-devtools:"
  );

  let totalMagnetLinks = $derived<number>(magnetStash.current!.length);
  let totalMagnetLinksThisSite = $derived<number>(
    magnetStash.current!.filter(
      (link: MagnetRecord) => link.source === currentTab.hostname
    ).length
  );
  let isCurrentHostWhitelisted = currentTab.hostname && checkWhitelist(currentTab.url)

  async function addCurrentHost() {
    if (!currentTab.hostname || isCurrentHostWhitelisted) return;

    try {
      const newHost = `{http,https}://${currentTab.hostname}/**`;
      whitelistedHosts.current = [...whitelistedHosts.current!, newHost];
      if (collectionEnabled.current) {
        manualCollect();
      }
    } catch (error) {
      console.error("Failed to add host:", error);
    }
  }

  async function removeHost(host: string) {
    try {
      whitelistedHosts.current = whitelistedHosts.current!.filter((h:string) => h !== host);
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

  async function manualCollect() {
    if (!currentTab.tabId) {
      console.error("Tab ID is not available.");
      return;
    }
    try {
      await browser.tabs.sendMessage(currentTab.tabId, {
        type: "COLLECT_MAGNETS",
      });
    } catch (error) {
      console.error("Error triggering manual collection:", error);
    }
  }
</script>

<GlobalLayout>
  <div class="w-80 select-none bg-background max-h-[580px] overflow-hidden">
    {#if isBuiltInChrome}
      <!-- Error State for Chrome Internal Pages -->
      <div class="p-4">
        <Card class="border">
          <CardContent class="flex flex-col items-center justify-center py-6 text-center">
            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-muted mb-3">
              <AlertCircle class="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 class="font-semibold mb-2">Not Available</h3>
            <p class="text-sm text-muted-foreground">
              Magneto cannot run on Chrome internal pages.
            </p>
          </CardContent>
        </Card>
      </div>
    {:else}
      <!-- Header Section -->
      <div class="border-b bg-card p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2.5">
            <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
              <Magnet class="h-4 w-4" />
            </div>
            <div>
              <h1 class="text-base font-semibold">Magneto</h1>
              <p class="text-xs text-muted-foreground">Magnet link collector</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1.5">
              {#if collectionEnabled.current}
                <Activity class="h-3 w-3 text-green-500" />
                <span class="text-xs text-muted-foreground">Active</span>
              {:else}
                <Pause class="h-3 w-3 text-orange-500" />
                <span class="text-xs text-muted-foreground">Paused</span>
              {/if}
            </div>
            <Switch bind:checked={collectionEnabled.current} />
          </div>
        </div>

        <!-- Stats Overview -->
        <div class="grid grid-cols-2 gap-3 mb-3">
          <div class="text-center p-3 rounded-lg border bg-muted/50">
            <div class="text-xl font-bold text-primary mb-1">{totalMagnetLinks}</div>
            <div class="text-xs text-muted-foreground">Total magnets</div>
          </div>
          <div class="text-center p-3 rounded-lg border bg-muted/50">
            <div class="text-xl font-bold text-primary mb-1">{totalMagnetLinksThisSite}</div>
            <div class="text-xs text-muted-foreground">This site</div>
          </div>
        </div>

        <!-- Main Action Button -->
        <div class="grid grid-cols-2 gap-2">
          <Button onclick={openSidePanel} class="flex-1">
            <ExternalLink class="h-4 w-4 mr-2" />
            Open Explorer
          </Button>
          <Button onclick={manualCollect} variant="outline" class="flex-1">
            <Activity class="h-4 w-4 mr-2" />
            Collect Now
          </Button>
        </div>
      </div>

      <!-- Current Site Management -->
      <div class="p-4 border-b bg-muted/20">
        <div class="flex items-center gap-2 mb-3">
          <Shield class="h-4 w-4 text-muted-foreground" />
          <span class="text-sm font-medium">Whitelist Management</span>
        </div>

        <div class="flex items-center justify-between p-3 rounded-lg border bg-card">
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
      <div class="p-4">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium">Whitelisted Sites</span>
          <Badge variant="outline" class="text-xs">
            {whitelistedHosts.current!.length}
          </Badge>
        </div>

        <Card class="border">
          <ScrollArea class="h-28">
            <div class="p-3">
              {#if whitelistedHosts.current!.length === 0}
                <div class="flex flex-col items-center justify-center py-3 text-center">
                  <div class="flex items-center justify-center w-8 h-8 rounded-full bg-muted mb-2">
                    <Shield class="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p class="text-sm text-muted-foreground">No sites whitelisted yet</p>
                  <p class="text-xs text-muted-foreground mt-1">
                    Add trusted sites to auto-collect magnets
                  </p>
                </div>
              {:else}
                <div class="space-y-2">
                  {#each whitelistedHosts.current! as host (host)}
                    <div class="flex items-center justify-between gap-2 group hover:bg-muted/50 rounded-md p-2 -m-2">
                      <Badge variant="secondary" class="flex-1 justify-start truncate font-normal">
                        {minimatchPatternHostname(host)}
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
    {/if}
  </div>
</GlobalLayout>
