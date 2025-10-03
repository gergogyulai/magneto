import type { SourceAdapter } from "@magneto/types";

import { ExtToAdapter } from "./ext.to";
import { KnabenOrgAdapter } from "./knaben";
import { GenericAdapter } from "./generic";
import { ArchiveOrgAdapter } from "./archive.org";

export const sourceAdapters = {
  generic: GenericAdapter,
  "knaben.org": KnabenOrgAdapter,
  "ext.to": ExtToAdapter,
  "web.archive.org": ArchiveOrgAdapter,
  "archive.org": ArchiveOrgAdapter,
} satisfies Record<string, SourceAdapter>;

export function getAdapter(hostname: string) {
  if ((hostname as SourceAdapterKey) in sourceAdapters) {
    return sourceAdapters[hostname as SourceAdapterKey];
  }
  return sourceAdapters["generic"];
}

export type SourceAdapterKey = keyof typeof sourceAdapters;

// Re-export adapters individually
export { ExtToAdapter, KnabenOrgAdapter, GenericAdapter, ArchiveOrgAdapter };