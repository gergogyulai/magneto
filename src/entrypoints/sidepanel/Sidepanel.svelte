<script lang="ts">
  import type { MagnetRecord } from '@/lib/types';

  import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/lib/components/ui/card';
  import { Input } from '@/lib/components/ui/input';
  import { Separator } from '@/lib/components/ui/separator';
  import { Popover } from '@/lib/components/ui/popover';
  import { Command } from '@/lib/components/ui/command';

  import { Button } from '@/lib/components/ui/button';
  import { Magnet, Link, Trash2 } from '@lucide/svelte';
  import ExportDropdown from '@/lib/components/export-dropdown.svelte';
  import MagnetList from '@/lib/components/magnet-list.svelte';
  import { Toaster } from '@/lib/components/ui/sonner';
  import { createStorageState } from '@/lib/reactive-localstorage.svelte';
  
  const getCurrentHost = () => {
    return window.location.hostname;
  };

  const magnetStash = createStorageState<MagnetRecord[]>('magnetLinks', []);

  let searchTerm = $state<string>('');

  let filteredMagnetLinks = $derived<MagnetRecord[]>(
    !searchTerm.trim() 
      ? magnetStash.value
      : magnetStash.value.filter((link: MagnetRecord) => 
          (link.name || '').toLowerCase().includes(searchTerm.toLowerCase().trim())
        )
  );
  
  let collectedMagnetLinks = $derived<number>(filteredMagnetLinks.length);
  let collectedMagnetLinksThisSite = $derived<number>(
    filteredMagnetLinks.filter((link: MagnetRecord) => link.source === getCurrentHost()).length
  );
  let currentHost = $derived<string | null>(getCurrentHost() || null);
  
  let totalMagnetLinks = $derived<number>(magnetStash.value.length);
  let totalMagnetLinksThisSite = $derived<number>(
    magnetStash.value.filter((link: MagnetRecord) => link.source === getCurrentHost()).length
  );

  let filteringSourceOptions = $derived<Array<{ label: string; value: string | null }>>((
    magnetStash.value
      .map((link: MagnetRecord) => link.source || 'Unknown Source')
      .filter((value, index, self) => self.indexOf(value) === index)
      .map((source) => ({
        label: source === 'Unknown Source' ? source : (new URL(source)).hostname,
        value: source,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
      .concat([{ label: 'All Sources', value: "" }])
  ));
  let filteringSelectedSourceOption = $state<string | null>("");

  let isLoading = $derived(!magnetStash.initialized);
  let isSearching = $derived(searchTerm.trim().length > 0);
</script>

<Toaster />
<div class="select-none">
    <Card class="min-w-80 rounded-none">
      <CardHeader class="pb-3">
        <div class="flex items-center justify-between">
          <CardTitle class="flex items-center gap-2">
            <Magnet class="w-5 h-5 text-primary" />Magneto
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent class="flex flex-col gap-6">
        <div class="grid gap-4">
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-muted-foreground">
              <Link class="w-4 h-4" />
              <span class="text-sm font-medium">Total Magnets</span>
            </div>
            <div class="text-2xl font-bold">{collectedMagnetLinks}</div>
            {#if currentHost}
              <span class="text-sm text-muted-foreground">
                {collectedMagnetLinksThisSite} from {currentHost}
              </span>
            {/if}
            
            <div class="flex gap-2 mt-2">
              <ExportDropdown />
              <Button
                variant="outline"
                size="lg"
                class="flex-1 text-destructive hover:text-destructive"
                disabled={collectedMagnetLinks === 0}
                onclick={() => {
                  if (confirm('Are you sure you want to delete all magnet links?')) {
                    storage.removeItem("local:magnetLinks");
                  }
                }}
              >
                <Trash2 class="w-4 h-4 mr-2" />
                Delete All
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <section aria-labelledby="magnet-list-controls">
          <h2 id="magnet-list-controls" class="sr-only">Magnet Link Controls</h2>
          <Input
            type="text"
            placeholder="Search magnet links..."
            bind:value={searchTerm}
            class="mb-3"
            aria-label="Search magnet links"
          />


          <!-- <div class="flex gap-2 mb-4 flex-wrap">
            <Popover.Root bind:open={openSourcePopover}>
              <Popover.Trigger let:builder>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openSourcePopover}
                  class="w-[150px] justify-between"
                  {...builder}
                >
                  {selectedSourceFilter
                    ? sourceOptions.find((src) => src.value === selectedSourceFilter)?.label
                    : 'Filter Source'}
                  <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </Popover.Trigger>
              <Popover.Content class="w-[200px] p-0">
                <Command.Root>
                  <Command.Input placeholder="Search sources..." />
                  <Command.Empty>No source found.</Command.Empty>
                  <Command.Group>
                    <Command.List>
                      {#each sourceOptions as src}
                        <Command.Item
                          value={src.label}
                          onSelect={() => {
                            selectedSourceFilter = src.value
                            openSourcePopover = false
                          }}
                        >
                          <Check
                            class={cn(
                              'mr-2 h-4 w-4',
                              selectedSourceFilter === src.value ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          {src.label}
                        </Command.Item>
                      {/each}
                    </Command.List>
                  </Command.Group>
                </Command.Root>
              </Popover.Content>
            </Popover.Root>

            <Popover.Root bind:open={openOrderPopover}>
              <Popover.Trigger let:builder>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openOrderPopover}
                  class="w-[180px] justify-between"
                  {...builder}
                >
                  {selectedOrder
                    ? orderOptions.find((order) => order.value === selectedOrder)?.label
                    : 'Order By Date'}
                  <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </Popover.Trigger>
              <Popover.Content class="w-[200px] p-0">
                <Command.Root>
                  <Command.Group>
                    <Command.List>
                      {#each orderOptions as order}
                        <Command.Item
                          value={order.label}
                          onSelect={() => {
                            selectedOrder = order.value
                            openOrderPopover = false
                          }}
                        >
                          <Check
                            class={cn(
                              'mr-2 h-4 w-4',
                              selectedOrder === order.value ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          {order.label}
                        </Command.Item>
                      {/each}
                    </Command.List>
                  </Command.Group>
                </Command.Root>
              </Popover.Content>
            </Popover.Root>
          </div> -->
        </section>

        <section aria-labelledby="magnet-links-heading">
          <h2 id="magnet-links-heading" class="sr-only">Collected Magnet Links</h2>
          <MagnetList
            magnetLinks={filteredMagnetLinks}
          />
        </section>
      </CardContent>
    </Card>
</div>