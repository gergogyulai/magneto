<script lang="ts">
  import { Button } from "@/lib/components/ui/button";
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/lib/components/ui/card";
  import { Label } from "@/lib/components/ui/label";
  import * as Select from "@/lib/components/ui/select/index.js";
  import Textarea from "@/lib/components/ui/textarea/textarea.svelte";
  import { Switch } from "@/lib/components/ui/switch";
  import { Separator } from "@/lib/components/ui/separator";
  import {
    Trash2,
    Download,
    Palette,
    Database,
    Plug,
  } from "@lucide/svelte";
  import GlobalLayout from "@/lib/components/global-layout.svelte";
  import { setMode, mode } from "mode-watcher";
  import { ReactiveStorage } from "@/lib/reactive-storage.svelte";
  import Input from "@/lib/components/ui/input/input.svelte";
  import { STORAGE_KEYS, DEFAULT_OPTIONS } from "@/lib/constants";
  import type { MagnetRecord, ExportFormats, MagnetoOptions } from "@magneto/types";

  const version = browser.runtime.getManifest().version;
  
  let magnetStash = new ReactiveStorage<MagnetRecord[]>(STORAGE_KEYS.STASH, []);
  let optionsStore = new ReactiveStorage<MagnetoOptions>(STORAGE_KEYS.OPTIONS, DEFAULT_OPTIONS);
  let whitelistedHosts = new ReactiveStorage<string[]>(STORAGE_KEYS.WHITELISTED_HOSTS, ["example.com"]);

  // Local state for whitelist editing
  let whitelistText = $state("");
  let originalWhitelistText = $state("");
  
  // Initialize whitelist text from storage
  $effect(() => {
    if (whitelistedHosts.current) {
      const text = whitelistedHosts.current.join("\n");
      whitelistText = text;
      originalWhitelistText = text;
    }
  });

  // Check if whitelist has changed
  let whitelistChanged = $derived(whitelistText !== originalWhitelistText);

  let themeLabel = $derived(
    mode.current === "light"
      ? "Light"
      : mode.current === "dark"
        ? "Dark"
        : "Auto"
  );

  const themeOptions = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "Auto" },
  ];

  async function exportFullStash(exportFormat: ExportFormats): Promise<void> {
    browser.runtime.sendMessage({
      type: "EXPORT_MAGNETS",
      format: exportFormat,
    });
  }

  async function emptyFullStash(): Promise<void> {
    magnetStash.current = [];
  }

  function handleThemeChange(newMode: string) {
    setMode(newMode as "light" | "dark" | "system");
  }

  function saveWhitelist() {
    const hosts = whitelistText
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    whitelistedHosts.current = hosts;
    
    originalWhitelistText = whitelistText;
  }
</script>

<GlobalLayout>
  <div class="container mx-auto p-6 max-w-2xl space-y-6">
    <div class="flex items-center gap-2 mb-6">
      <div
        class="h-8 w-8 rounded-lg bg-primary flex items-center justify-center"
      >
        <Plug class="h-4 w-4 text-primary-foreground" />
      </div>
      <h1 class="text-2xl font-bold">Extension Settings</h1>
    </div>

    <!-- Theme Settings -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Palette class="h-5 w-5" />
          Appearance
        </CardTitle>
        <CardDescription>Customize the extension's appearance</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex items-center justify-between">
          <Label for="theme-select">Theme</Label>
          <Select.Root
            type="single"
            name="theme"
            value={mode.current}
            onValueChange={handleThemeChange}
          >
            <Select.Trigger class="w-32">
              {themeLabel}
            </Select.Trigger>
            <Select.Content>
              <Select.Group>
                {#each themeOptions as option (option.value)}
                  <Select.Item value={option.value} label={option.label}>
                    {option.label}
                  </Select.Item>
                {/each}
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Palette class="h-5 w-5" />
          Whitelist Management
        </CardTitle>
        <CardDescription>Manage the whitelisted sources</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="whitelist-sources">Whitelisted Hosts</Label>
          <Textarea
            bind:value={whitelistText}
            rows={8}
            id="whitelist-sources"
            placeholder="Enter one host per line, e.g. example.com&#10;Glob match patterns are supported"
            class="w-full max-h-32 font-mono text-xs overflow-x-auto whitespace-nowrap"
          />
          <p class="text-sm text-muted-foreground">
            Enter one host per line. Glob patterns (*, ?) are supported.
          </p>
        </div>
        <Button onclick={saveWhitelist} class="w-full" disabled={!whitelistChanged}>
          Save Whitelist
        </Button>
      </CardContent>
    </Card>

    <!-- Data Management -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Database class="h-5 w-5" />
          Data Management
        </CardTitle>
        <CardDescription>Export or clear your collected data</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex gap-3">
          <Button
            variant="outline"
            onclick={() => exportFullStash("json")}
            class="flex-1"
          >
            <Download class="h-4 w-4 mr-2" />
            Export Full Stash
          </Button>
          <Button
            variant="destructive"
            onclick={() => emptyFullStash()}
            class="flex-1"
          >
            <Trash2 class="h-4 w-4 mr-2" />
            Empty
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Collection Settings -->
    <Card>
      <CardHeader>
        <CardTitle>Collection Mode</CardTitle>
        <CardDescription>
          Configure what data is collected from torrents
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <Label for="minimal-mode">Minimal Collection Mode</Label>
            <p class="text-sm text-muted-foreground">
              Only collect torrent info hashes
            </p>
          </div>
          <Switch id="minimal-mode" bind:checked={optionsStore.current!.minimalCollectionMode.enabled} />
        </div>

        {#if optionsStore.current!.minimalCollectionMode.enabled}
          <div class="pl-4 border-l-2 border-muted">
            <div class="flex items-center justify-between">
              <div class="space-y-1">
                <Label for="collect-names">Collect Torrent Names</Label>
                <p class="text-sm text-muted-foreground">
                  Also collect torrent names in addition to info hashes
                </p>
              </div>
              <Switch id="collect-names" bind:checked={optionsStore.current!.minimalCollectionMode.collectNames} />
            </div>
          </div>
        {/if}

        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <Label for="rolling-collection-enabled">Rolling Collection</Label>
            <p class="text-sm text-muted-foreground">
              Start siscarding old entries past a limit
            </p>
          </div>
          <Switch id="rolling-collection-enabled" bind:checked={optionsStore.current!.rollingCollection.enabled} />
        </div>

        {#if optionsStore.current!.rollingCollection.enabled}
          <div class="pl-4 border-l-2 border-muted">
            <div class="flex items-center justify-between">
              <div class="space-y-1">
                <Label for="rolling-collection-limit">Rolling Collection Limit</Label>
                <p class="text-sm text-muted-foreground">
                  Maximum number of entries to keep in the stash
                </p>
              </div>
              <Input type="number" id="rolling-collection-limit" class="w-32" bind:value={optionsStore.current!.rollingCollection.limit} />
            </div>
          </div>
        {/if}
      </CardContent>
    </Card>

    <!-- Adapters -->
    <Card>
      <CardHeader>
        <CardTitle>Adapters</CardTitle>
        <CardDescription>
          Enable or disable specific site adapters
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <Label for="ext-to-adapter">Ext.to</Label>
            <p class="text-sm text-muted-foreground">
              Enable enhanced data collection for ext.to
            </p>
          </div>
          <Switch
            id="ext-to-adapter"
            bind:checked={optionsStore.current!.adapters["ext.to"]}
            />
        </div>
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <Label for="wayback-adapter">Knaben Database</Label>
            <p class="text-sm text-muted-foreground">
              Enable enhanced data collection for knaben.org
            </p>
          </div>
          <Switch
            id="wayback-adapter"
            bind:checked={optionsStore.current!.adapters["knaben.org"]}
            />
        </div>
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <Label for="wayback-adapter">Wayback Machine</Label>
            <p class="text-sm text-muted-foreground">
              Enable enhanced data collection for web.archive.org 
            </p>
          </div>
          <Switch
              id="wayback-adapter"
              bind:checked={optionsStore.current!.adapters["web.archive.org"]}
            />
        </div>
      </CardContent>
    </Card>

    <div class="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground py-4">
      <div class="flex gap-2">
        <span>v{version}</span>
        |
        <a
          href="https://github.com/gergogyulai/magneto"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-foreground transition-colors"
        >
          GitHub
        </a>
      </div>
      <span class="italic">never lose that magnet link again</span>
    </div>
  </div>
</GlobalLayout>