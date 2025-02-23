<script lang="ts">
  import '../app.css'
  import { onMount } from 'svelte'
  import type { SavedMagnetLinks, MagnetRecord } from '$lib/types'
  import { parseTorrentName, parseTorrentSize } from '$lib/utils'
  import { createTable, Render, Subscribe } from 'svelte-headless-table'
  import { readable } from 'svelte/store'
  import * as Table from '$lib/components/ui/table'

  export let magnetLinks: MagnetRecord[] = []
  console.log('magnetLinks:', magnetLinks)

  const table = createTable(readable(magnetLinks))

  const columns = table.createColumns([
    table.column({
      accessor: 'magnetLink',
      header: 'Magnet Link',
    }),
    table.column({
      accessor: 'date',
      header: 'Date',
    }),
    table.column({
      accessor: 'source',
      header: 'Source',
    }),
  ])

  const { headerRows, pageRows, tableAttrs, tableBodyAttrs } = table.createViewModel(columns)

  // magnetLink
  // date
  // source
</script>

<div class="rounded-md border">
  <Table.Root {...$tableAttrs}>
    <Table.Header>
      {#each $headerRows as headerRow}
        <Subscribe rowAttrs={headerRow.attrs()}>
          <Table.Row>
            {#each headerRow.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs props={cell.props()}>
                <Table.Head {...attrs}>
                  <Render of={cell.render()} />
                </Table.Head>
              </Subscribe>
            {/each}
          </Table.Row>
        </Subscribe>
      {/each}
    </Table.Header>
    <Table.Body {...$tableBodyAttrs}>
      {#each $pageRows as row (row.id)}
        <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
          <Table.Row {...rowAttrs}>
            {#each row.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs>
                <Table.Cell {...attrs}>
                  {#if cell.id === 'magnetLink'}
                    <div class="w-32 truncate">
                      <Render of={cell.render()} />
                    </div>
                  {:else if cell.id === 'date'}
                    <Render of={cell.render()} />
                  {:else if cell.id === 'source'}
                    <Render of={cell.render()} />
                  {:else}
                    <Render of={cell.render()} />
                  {/if}
                </Table.Cell>
              </Subscribe>
            {/each}
          </Table.Row>
        </Subscribe>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
