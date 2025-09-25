type StorageKey =
  | `local:${string}`
  | `sync:${string}`
  | `session:${string}`
  | `managed:${string}`;

/**
 * Creates a readonly reactive state that syncs with WXT storage.
 *
 * The state's value is initialized from WXT storage on first access,
 * and then automatically updates whenever the corresponding storage item changes.
 *
 * @template T The type of the value stored in the state.
 * @param {StorageKey} key The key used to identify the storage item. This key
 *   must be prefixed with `local:`, `sync:`, `session:`, or `managed:` to
 *   specify the storage area.
 * @param {T} defaultValue The default value to use if the storage item is not
 *   found or is `null`.
 * @returns {{ value: T; initialized: boolean }} An object with two readonly
 *   properties:
 *   - `value`: The current value of the state, synced with storage.
 *   - `initialized`: A boolean indicating whether the state has been
 *     initialized from storage.
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
 * // Note: To update the storage, you would use `storage.setItem` directly.
 * // This `createStorageState` function provides a reactive *read-only* view.
 * // For example, to increment the counter:
 * // await storage.setItem('local:myCounter', counterState.value + 1);
 * ```
 */
export function createStorageState<T>(key: StorageKey, defaultValue: T) {
  let state = $state<{ value: T; initialized: boolean }>({
    value: defaultValue,
    initialized: false,
  });

  let unwatchFn: (() => void) | null = null;

  // Initialize on first access and set up watcher
  $effect(() => {
    (async () => {
      // Get initial value
      const stored = await storage.getItem(`${key}`);
      if (stored !== null) {
        state.value = stored as T;
      }
      state.initialized = true;

      // Set up storage watcher
      // Note: The example uses 'local:${key}' which might be incorrect if `key`
      // already contains the prefix. Assuming `key` already has the correct
      // prefix like 'local:someKey', 'sync:anotherKey', etc.
      // If `key` is always expected to be 'local:${key}', then the storage.watch
      // key should be `${key}`. I'm keeping it as is based on the provided code
      // but flagging this potential discrepancy.
      unwatchFn = storage.watch(`${key}`, (newValue) => {
        if (newValue !== null) {
          state.value = newValue as T;
        } else {
          state.value = defaultValue;
        }
      });
    })();

    // Cleanup function
    return () => {
      unwatchFn?.();
    };
  });

  return {
    get value() {
      return state.value;
    },
    get initialized() {
      return state.initialized;
    },
  };
}