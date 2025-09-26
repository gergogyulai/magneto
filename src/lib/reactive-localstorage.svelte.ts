type StorageKey =
  | `local:${string}`
  | `sync:${string}`
  | `session:${string}`
  | `managed:${string}`;

/**
 * Creates a reactive state that syncs with WXT storage.
 *
 * The state's value is initialized from WXT storage on first access,
 * and automatically updates whenever the corresponding storage item changes.
 * You can both read from and write to the state, with writes automatically
 * syncing to the underlying storage.
 *
 * @template T The type of the value stored in the state.
 * @param {StorageKey} key The key used to identify the storage item. This key
 *   must be prefixed with `local:`, `sync:`, `session:`, or `managed:` to
 *   specify the storage area.
 * @param {T} defaultValue The default value to use if the storage item is not
 *   found or is `null`.
 * @returns A reactive state object that can be used directly in Svelte components.
 *
 * @example
 * ```typescript
 * import { createStorageState } from './createStorageState';
 *
 * // Create a state that syncs with 'local:myCounter' in WXT storage,
 * // defaulting to 0.
 * const counterState = createStorageState('local:myCounter', 0);
 *
 * // Access the current value
 * console.log(counterState.value); // Might be 0 or a previously stored value
 *
 * // Check if the state has been initialized from storage
 * console.log(counterState.initialized); // true after initialization
 *
 * // Update the value - this will automatically sync to storage
 * counterState.value = counterState.value + 1;
 * ```
 */
export function createStorageState<T>(key: StorageKey, defaultValue: T) {
  const state = $state({
    value: defaultValue,
    initialized: false,
  });

  let unwatchFn: (() => void) | null = null;
  let isUpdatingFromStorage = false;

  // Initialize on first access and set up watcher
  $effect(() => {
    (async () => {
      // Get initial value
      const stored = await storage.getItem(key);
      if (stored !== null) {
        isUpdatingFromStorage = true;
        state.value = stored as T;
        isUpdatingFromStorage = false;
      }
      state.initialized = true;

      // Set up storage watcher
      unwatchFn = storage.watch(key, (newValue) => {
        isUpdatingFromStorage = true;
        if (newValue !== null) {
          state.value = newValue as T;
        } else {
          state.value = defaultValue;
        }
        isUpdatingFromStorage = false;
      });
    })();

    // Cleanup function
    return () => {
      unwatchFn?.();
    };
  });

  // Watch for local state changes and sync to storage
  $effect(() => {
    // Only sync to storage if the change didn't come from storage
    // and the state has been initialized
    if (!isUpdatingFromStorage && state.initialized) {
      storage.setItem(key, state.value);
    }
  });

  return state;
}