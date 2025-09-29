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
  import type { MagnetRecord, ExportFormats, MagnetoOptions } from "@/lib/types.new";
  
  let magnetStash = new ReactiveStorage<MagnetRecord[]>(STORAGE_KEYS.STASH, []);
  let optionsStore = new ReactiveStorage<MagnetoOptions>(STORAGE_KEYS.OPTIONS, DEFAULT_OPTIONS);

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
            <Label for="ext-to-adapter">ext.to</Label>
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
            <Label for="wayback-adapter">Knaben</Label>
            <p class="text-sm text-muted-foreground">
              Enable enhanced data collection for knaben.org
            </p>
          </div>
          <Switch
            id="wayback-adapter"
            bind:checked={optionsStore.current!.adapters["knaben.org"]}
            />
        </div>
      </CardContent>
    </Card>
  </div>
</GlobalLayout>