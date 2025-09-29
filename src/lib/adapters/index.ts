import { SourceAdapter } from "@/lib/types.new";

import { ExtToAdapter } from "@/lib/adapters/ext.to";
import { KnabenOrgAdapter } from "@/lib/adapters/knaben";
import { GenericAdapter } from "@/lib/adapters/generic";

export const sourceAdapters = {
  generic: GenericAdapter,
  "knaben.org": KnabenOrgAdapter,
  "ext.to": ExtToAdapter,
} satisfies Record<string, SourceAdapter>;

export function getAdapter(hostname: string) {
  if ((hostname as SourceAdapterKey) in sourceAdapters) {
    return sourceAdapters[hostname as SourceAdapterKey];
  }
  return sourceAdapters["generic"];
}

export type SourceAdapterKey = keyof typeof sourceAdapters;