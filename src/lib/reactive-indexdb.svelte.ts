import { tick } from 'svelte';
import Dexie, { liveQuery } from 'dexie';
import type { Subscription } from 'dexie';

type StorageKey = string;

interface KeyValueItem {
	key: string;
	value: any;
}

class KeyValueDB extends Dexie {
	items!: Dexie.Table<KeyValueItem, string>;

	constructor() {
		super('ReactiveStorageDB');
		this.version(1).stores({
			items: 'key'
		});
	}
}

const db = new KeyValueDB();

export class ReactiveStorage<T> {
	#key: string;
	#version = $state(0);
	#listeners = 0;
	#value: T | undefined;
	#loaded = false;
	#initialValue: T | undefined;
	#liveQuerySubscription: Subscription | null = null;

	constructor(key: StorageKey, initial?: T) {
		this.#key = key;
		this.#value = initial;
		this.#initialValue = initial;

		// Load initial value asynchronously
		this.#initialize();
	}

	async #initialize() {
		try {
			const stored = await db.items.get(this.#key);
			if (stored !== undefined) {
				this.#value = stored.value as T;
			} else if (this.#initialValue !== undefined) {
				await db.items.put({ key: this.#key, value: this.#initialValue });
				this.#value = this.#initialValue;
			}
			this.#loaded = true;
			this.#version += 1;
		} catch (error) {
			console.error('Failed to initialize storage:', error);
			this.#loaded = true;
		}
	}

	async #updateStorage(value: T) {
		try {
			await db.items.put({ key: this.#key, value });
		} catch (error) {
			console.error('Failed to update storage:', error);
		}
	}

	get current() {
		this.#version;

		const proxies = new WeakMap();

		const proxy = (value: unknown) => {
			if (typeof value !== 'object' || value === null) {
				return value;
			}

			let p = proxies.get(value);

			if (!p) {
				p = new Proxy(value, {
					get: (target, property) => {
						this.#version;
						return proxy(Reflect.get(target, property));
					},
					set: (target, property, newValue) => {
						this.#version += 1;
						Reflect.set(target, property, newValue);

						// Update storage asynchronously
						this.#updateStorage(this.#value as T);

						return true;
					}
				});

				proxies.set(value, p);
			}

			return p;
		};

		if ($effect.tracking()) {
			$effect(() => {
				if (this.#listeners === 0) {
					// Subscribe to liveQuery for this specific key
					const query = liveQuery(async () => {
						const item = await db.items.get(this.#key);
						return item?.value;
					});

					this.#liveQuerySubscription = query.subscribe((result) => {
						// Only update if the value actually changed and it's different from current
						if (result !== undefined && result !== this.#value) {
							this.#value = result as T;
							this.#version += 1;
						}
					});
				}

				this.#listeners += 1;

				return () => {
					tick().then(() => {
						this.#listeners -= 1;
						if (this.#listeners === 0 && this.#liveQuerySubscription) {
							this.#liveQuerySubscription.unsubscribe();
							this.#liveQuerySubscription = null;
						}
					});
				};
			});
		}

		return proxy(this.#value);
	}

	set current(value) {
		this.#value = value;
		this.#updateStorage(value);
		this.#version += 1;
	}

	// Utility method to check if storage is loaded
	get loaded() {
		return this.#loaded;
	}

	// Clean up resources when no longer needed
	destroy() {
		if (this.#liveQuerySubscription) {
			this.#liveQuerySubscription.unsubscribe();
			this.#liveQuerySubscription = null;
		}
	}
}