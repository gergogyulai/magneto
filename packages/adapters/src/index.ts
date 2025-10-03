import type { SourceAdapter } from "@magneto/types";

import { ExtToAdapter } from "./ext.to";
import { KnabenOrgAdapter } from "./knaben";
import { GenericAdapter } from "./generic";
import { WaybackMachineAdapter } from "./wayback-machine";
import { Adapter1337x } from "./1337x";

const adapters: SourceAdapter[] = [
  GenericAdapter,
  KnabenOrgAdapter,
  ExtToAdapter,
  WaybackMachineAdapter,
  Adapter1337x,
];

export const sourceAdapters: Record<string, SourceAdapter> = adapters.reduce(
  (acc, adapter) => {
    adapter.domains.forEach((domain) => {
      acc[domain] = adapter;
    });
    return acc;
  },
  {} as Record<string, SourceAdapter>
);

export function getAdapter(
  hostname: string,
  adapterOptions?: Partial<Record<SourceAdapterKey, boolean>>
): SourceAdapter {
  const adapter = sourceAdapters[hostname] ?? GenericAdapter;

  if (adapterOptions && adapter.name in adapterOptions) {
    const enabled = adapterOptions[adapter.name as SourceAdapterKey];
    if (enabled === false) {
      return GenericAdapter;
    }
  }

  return adapter;
}

export type SourceAdapterKey = keyof typeof sourceAdapters;
export {
  ExtToAdapter,
  KnabenOrgAdapter,
  GenericAdapter,
  WaybackMachineAdapter,
};
