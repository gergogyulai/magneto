import type { StorageKey, MagnetoOptions } from "@magneto/types";

export const STORAGE_KEYS = {
  STASH: "local:magneto-stash",
  WHITELISTED_HOSTS: "local:magneto-whitelistedHosts",
  COLLECTION_ENABLED: "local:magneto-collectionEnabled",
  OPTIONS: "local:magneto-options",
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
