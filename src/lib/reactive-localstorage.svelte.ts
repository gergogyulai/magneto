/**
 * Creates a readonly reactive state that syncs with WXT storage
 */
export function createStorageState<T>(key: string, defaultValue: T) {
  let state = $state<{ value: T; initialized: boolean }>({
    value: defaultValue,
    initialized: false
  });

  let unwatchFn: (() => void) | null = null;

  // Initialize on first access and set up watcher
  $effect(() => {
    (async () => {
      // Get initial value
      const stored = await storage.getItem(`local:${key}`);
      if (stored !== null) {
        state.value = stored as T;
      }
      state.initialized = true;

      // Set up storage watcher
      unwatchFn = storage.watch(`local:${key}`, (newValue) => {
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
    }
  };
}