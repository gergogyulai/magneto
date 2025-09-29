import { tick } from 'svelte';
import { browser } from 'wxt/browser';
import type { StorageKey } from '@/lib/types.new';

export class ReactiveStorage<T> {
  #storageArea: string;
  #key: string;
  #fullKey: StorageKey;
  #version = $state(0);
  #listeners = 0;
  #value: T | undefined;
  #loaded = false;

  #handler = (changes: Record<string, any>, areaName: string) => {
    if (areaName !== this.#storageArea) return;
    if (!changes[this.#key]) return;

    this.#value = changes[this.#key].newValue as T;
    this.#version += 1;
  };

  constructor(key: StorageKey, initial?: T) {
    const colonIndex = key.indexOf(':');
    this.#storageArea = key.slice(0, colonIndex);
    this.#key = key.slice(colonIndex + 1);
    this.#fullKey = key;
    this.#value = initial;

    void this.#initialize();
  }

  async #initialize() {
    try {
      const stored = await storage.getItem(this.#fullKey);
      if (stored !== null) {
        this.#value = stored as T;
      } else if (this.#value !== undefined) {
        await storage.setItem(this.#fullKey, this.#value);
      }
      this.#loaded = true;
      this.#version += 1;
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      this.#loaded = true;
    }
  }

  /**
   * Typed getter for the current value
   */
  get current(): T | undefined {
    this.#version;

    const proxies = new WeakMap<object, any>();

    const proxy = <U>(value: U): U => {
      if (typeof value !== 'object' || value === null) {
        return value;
      }

      let p = proxies.get(value);
      if (!p) {
        p = new Proxy(value as object, {
          get: (target, property) => {
            this.#version; // reactivity tracking
            const result = Reflect.get(
              target,
              property as keyof typeof target,
            );
            return proxy(result);
          },
          set: (target, property, newValue) => {
            this.#version += 1;
            Reflect.set(target, property, newValue);

            storage.setItem(this.#fullKey, this.#value).catch(console.error);
            return true;
          },
        });

        proxies.set(value, p);
      }

      return p as U;
    };

    if ($effect.tracking()) {
      $effect(() => {
        if (this.#listeners === 0) {
          browser.storage.onChanged.addListener(this.#handler);
        }

        this.#listeners += 1;

        return () => {
          tick().then(() => {
            this.#listeners -= 1;
            if (this.#listeners === 0) {
              browser.storage.onChanged.removeListener(this.#handler);
            }
          });
        };
      });
    }

    return this.#value === undefined ? undefined : proxy(this.#value);
  }

  /**
   * Setter keeps the type safe
   */
  set current(value: T | undefined) {
    this.#value = value;
    storage.setItem(this.#fullKey, value).catch(console.error);
    this.#version += 1;
  }

  /**
   * Simple flag to check if storage has loaded
   */
  get loaded(): boolean {
    return this.#loaded;
  }
}