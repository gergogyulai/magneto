import { SourceAdapter } from "@/lib/types";
import { extToAdapter } from "@/lib/adapters/ext.to";

export const sourceAdapters: Record<string, SourceAdapter> = {
  "ext.to": extToAdapter,
};
