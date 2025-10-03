import type { StorageKey, MagnetoOptions } from "@magneto/types";

export const STORAGE_KEYS = {
  STASH: "local:magneto-stash",
  WHITELISTED_HOSTS: "sync:magneto-whitelistedHosts",
  COLLECTION_ENABLED: "sync:magneto-collectionEnabled",
  OPTIONS: "sync:magneto-options",
} as const satisfies Record<string, StorageKey>;

export const DEFAULT_OPTIONS: MagnetoOptions = {
  minimalCollectionMode: { enabled: false, collectNames: false },
  rollingCollection: { enabled: false, limit: 1000 },
  adapters: {
    "ext.to": true,
    "knaben.org": true,
    "web.archive.org": true,
  },
};
