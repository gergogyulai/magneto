import { STORAGE_KEYS, DEFAULT_OPTIONS } from "@/lib/constants";

export function initializeStorage() {
  storage.getItem(STORAGE_KEYS.STASH).then((stash) => {
    if (stash === null) {
      storage.setItem(STORAGE_KEYS.STASH, []);
    }
  });
  storage.getItem(STORAGE_KEYS.WHITELISTED_HOSTS).then((hosts) => {
    if (hosts === null) {
      storage.setItem(STORAGE_KEYS.WHITELISTED_HOSTS, []);
    }
  });
  storage.getItem(STORAGE_KEYS.COLLECTION_ENABLED).then((enabled) => {
    if (enabled === null) {
      storage.setItem(STORAGE_KEYS.COLLECTION_ENABLED, false);
    }
  });
  storage.getItem(STORAGE_KEYS.OPTIONS).then((settings) => {
    if (settings === null) {
      storage.setItem(STORAGE_KEYS.OPTIONS, DEFAULT_OPTIONS);
    }
  });
}
