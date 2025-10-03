import type { SourceAdapter } from "@magneto/types";

import { ExtToAdapter } from "./ext.to";
import { KnabenOrgAdapter } from "./knaben";
import { GenericAdapter } from "./generic";
import { WaybackMachineAdapter } from "./wayback-machine";

const adapters: SourceAdapter[] = [
  GenericAdapter,
  KnabenOrgAdapter,
  ExtToAdapter,
  WaybackMachineAdapter,
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

export function getAdapter(hostname: string): SourceAdapter {
  return sourceAdapters[hostname] ?? GenericAdapter;
}

export type SourceAdapterKey = keyof typeof sourceAdapters;
export { ExtToAdapter, KnabenOrgAdapter, GenericAdapter, WaybackMachineAdapter };