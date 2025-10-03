import type { SourceAdapter } from "@/lib/types";

import { ExtToAdapter } from "@/lib/adapters/ext.to";
import { KnabenOrgAdapter } from "@/lib/adapters/knaben";
import { GenericAdapter } from "@/lib/adapters/generic";
import { ArchiveOrgAdapter } from "@/lib/adapters/archive.org";

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