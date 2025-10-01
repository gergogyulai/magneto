var background = (function() {
  "use strict";
  function defineBackground(arg) {
    if (arg == null || typeof arg === "function") return { main: arg };
    return arg;
  }
  const browser$1 = globalThis.browser?.runtime?.id ? globalThis.browser : globalThis.chrome;
  const browser = browser$1;
  var has = Object.prototype.hasOwnProperty;
  function dequal(foo, bar) {
    var ctor, len;
    if (foo === bar) return true;
    if (foo && bar && (ctor = foo.constructor) === bar.constructor) {
      if (ctor === Date) return foo.getTime() === bar.getTime();
      if (ctor === RegExp) return foo.toString() === bar.toString();
      if (ctor === Array) {
        if ((len = foo.length) === bar.length) {
          while (len-- && dequal(foo[len], bar[len])) ;
        }
        return len === -1;
      }
      if (!ctor || typeof foo === "object") {
        len = 0;
        for (ctor in foo) {
          if (has.call(foo, ctor) && ++len && !has.call(bar, ctor)) return false;
          if (!(ctor in bar) || !dequal(foo[ctor], bar[ctor])) return false;
        }
        return Object.keys(bar).length === len;
      }
    }
    return foo !== foo && bar !== bar;
  }
  const E_CANCELED = new Error("request for lock canceled");
  var __awaiter$2 = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result2) {
        result2.done ? resolve(result2.value) : adopt(result2.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  class Semaphore {
    constructor(_value, _cancelError = E_CANCELED) {
      this._value = _value;
      this._cancelError = _cancelError;
      this._queue = [];
      this._weightedWaiters = [];
    }
    acquire(weight = 1, priority = 0) {
      if (weight <= 0)
        throw new Error(`invalid weight ${weight}: must be positive`);
      return new Promise((resolve, reject) => {
        const task = { resolve, reject, weight, priority };
        const i = findIndexFromEnd(this._queue, (other) => priority <= other.priority);
        if (i === -1 && weight <= this._value) {
          this._dispatchItem(task);
        } else {
          this._queue.splice(i + 1, 0, task);
        }
      });
    }
    runExclusive(callback_1) {
      return __awaiter$2(this, arguments, void 0, function* (callback, weight = 1, priority = 0) {
        const [value, release] = yield this.acquire(weight, priority);
        try {
          return yield callback(value);
        } finally {
          release();
        }
      });
    }
    waitForUnlock(weight = 1, priority = 0) {
      if (weight <= 0)
        throw new Error(`invalid weight ${weight}: must be positive`);
      if (this._couldLockImmediately(weight, priority)) {
        return Promise.resolve();
      } else {
        return new Promise((resolve) => {
          if (!this._weightedWaiters[weight - 1])
            this._weightedWaiters[weight - 1] = [];
          insertSorted(this._weightedWaiters[weight - 1], { resolve, priority });
        });
      }
    }
    isLocked() {
      return this._value <= 0;
    }
    getValue() {
      return this._value;
    }
    setValue(value) {
      this._value = value;
      this._dispatchQueue();
    }
    release(weight = 1) {
      if (weight <= 0)
        throw new Error(`invalid weight ${weight}: must be positive`);
      this._value += weight;
      this._dispatchQueue();
    }
    cancel() {
      this._queue.forEach((entry) => entry.reject(this._cancelError));
      this._queue = [];
    }
    _dispatchQueue() {
      this._drainUnlockWaiters();
      while (this._queue.length > 0 && this._queue[0].weight <= this._value) {
        this._dispatchItem(this._queue.shift());
        this._drainUnlockWaiters();
      }
    }
    _dispatchItem(item) {
      const previousValue = this._value;
      this._value -= item.weight;
      item.resolve([previousValue, this._newReleaser(item.weight)]);
    }
    _newReleaser(weight) {
      let called = false;
      return () => {
        if (called)
          return;
        called = true;
        this.release(weight);
      };
    }
    _drainUnlockWaiters() {
      if (this._queue.length === 0) {
        for (let weight = this._value; weight > 0; weight--) {
          const waiters = this._weightedWaiters[weight - 1];
          if (!waiters)
            continue;
          waiters.forEach((waiter) => waiter.resolve());
          this._weightedWaiters[weight - 1] = [];
        }
      } else {
        const queuedPriority = this._queue[0].priority;
        for (let weight = this._value; weight > 0; weight--) {
          const waiters = this._weightedWaiters[weight - 1];
          if (!waiters)
            continue;
          const i = waiters.findIndex((waiter) => waiter.priority <= queuedPriority);
          (i === -1 ? waiters : waiters.splice(0, i)).forEach(((waiter) => waiter.resolve()));
        }
      }
    }
    _couldLockImmediately(weight, priority) {
      return (this._queue.length === 0 || this._queue[0].priority < priority) && weight <= this._value;
    }
  }
  function insertSorted(a, v) {
    const i = findIndexFromEnd(a, (other) => v.priority <= other.priority);
    a.splice(i + 1, 0, v);
  }
  function findIndexFromEnd(a, predicate) {
    for (let i = a.length - 1; i >= 0; i--) {
      if (predicate(a[i])) {
        return i;
      }
    }
    return -1;
  }
  var __awaiter$1 = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result2) {
        result2.done ? resolve(result2.value) : adopt(result2.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  class Mutex {
    constructor(cancelError) {
      this._semaphore = new Semaphore(1, cancelError);
    }
    acquire() {
      return __awaiter$1(this, arguments, void 0, function* (priority = 0) {
        const [, releaser] = yield this._semaphore.acquire(1, priority);
        return releaser;
      });
    }
    runExclusive(callback, priority = 0) {
      return this._semaphore.runExclusive(() => callback(), 1, priority);
    }
    isLocked() {
      return this._semaphore.isLocked();
    }
    waitForUnlock(priority = 0) {
      return this._semaphore.waitForUnlock(1, priority);
    }
    release() {
      if (this._semaphore.isLocked())
        this._semaphore.release();
    }
    cancel() {
      return this._semaphore.cancel();
    }
  }
  const storage = createStorage();
  function createStorage() {
    const drivers = {
      local: createDriver("local"),
      session: createDriver("session"),
      sync: createDriver("sync"),
      managed: createDriver("managed")
    };
    const getDriver = (area) => {
      const driver = drivers[area];
      if (driver == null) {
        const areaNames = Object.keys(drivers).join(", ");
        throw Error(`Invalid area "${area}". Options: ${areaNames}`);
      }
      return driver;
    };
    const resolveKey = (key) => {
      const deliminatorIndex = key.indexOf(":");
      const driverArea = key.substring(0, deliminatorIndex);
      const driverKey = key.substring(deliminatorIndex + 1);
      if (driverKey == null)
        throw Error(
          `Storage key should be in the form of "area:key", but received "${key}"`
        );
      return {
        driverArea,
        driverKey,
        driver: getDriver(driverArea)
      };
    };
    const getMetaKey = (key) => key + "$";
    const mergeMeta = (oldMeta, newMeta) => {
      const newFields = { ...oldMeta };
      Object.entries(newMeta).forEach(([key, value]) => {
        if (value == null) delete newFields[key];
        else newFields[key] = value;
      });
      return newFields;
    };
    const getValueOrFallback = (value, fallback) => value ?? fallback ?? null;
    const getMetaValue = (properties) => typeof properties === "object" && !Array.isArray(properties) ? properties : {};
    const getItem = async (driver, driverKey, opts) => {
      const res = await driver.getItem(driverKey);
      return getValueOrFallback(res, opts?.fallback ?? opts?.defaultValue);
    };
    const getMeta = async (driver, driverKey) => {
      const metaKey = getMetaKey(driverKey);
      const res = await driver.getItem(metaKey);
      return getMetaValue(res);
    };
    const setItem = async (driver, driverKey, value) => {
      await driver.setItem(driverKey, value ?? null);
    };
    const setMeta = async (driver, driverKey, properties) => {
      const metaKey = getMetaKey(driverKey);
      const existingFields = getMetaValue(await driver.getItem(metaKey));
      await driver.setItem(metaKey, mergeMeta(existingFields, properties));
    };
    const removeItem = async (driver, driverKey, opts) => {
      await driver.removeItem(driverKey);
      if (opts?.removeMeta) {
        const metaKey = getMetaKey(driverKey);
        await driver.removeItem(metaKey);
      }
    };
    const removeMeta = async (driver, driverKey, properties) => {
      const metaKey = getMetaKey(driverKey);
      if (properties == null) {
        await driver.removeItem(metaKey);
      } else {
        const newFields = getMetaValue(await driver.getItem(metaKey));
        [properties].flat().forEach((field) => delete newFields[field]);
        await driver.setItem(metaKey, newFields);
      }
    };
    const watch = (driver, driverKey, cb) => {
      return driver.watch(driverKey, cb);
    };
    const storage2 = {
      getItem: async (key, opts) => {
        const { driver, driverKey } = resolveKey(key);
        return await getItem(driver, driverKey, opts);
      },
      getItems: async (keys) => {
        const areaToKeyMap = /* @__PURE__ */ new Map();
        const keyToOptsMap = /* @__PURE__ */ new Map();
        const orderedKeys = [];
        keys.forEach((key) => {
          let keyStr;
          let opts;
          if (typeof key === "string") {
            keyStr = key;
          } else if ("getValue" in key) {
            keyStr = key.key;
            opts = { fallback: key.fallback };
          } else {
            keyStr = key.key;
            opts = key.options;
          }
          orderedKeys.push(keyStr);
          const { driverArea, driverKey } = resolveKey(keyStr);
          const areaKeys = areaToKeyMap.get(driverArea) ?? [];
          areaToKeyMap.set(driverArea, areaKeys.concat(driverKey));
          keyToOptsMap.set(keyStr, opts);
        });
        const resultsMap = /* @__PURE__ */ new Map();
        await Promise.all(
          Array.from(areaToKeyMap.entries()).map(async ([driverArea, keys2]) => {
            const driverResults = await drivers[driverArea].getItems(keys2);
            driverResults.forEach((driverResult) => {
              const key = `${driverArea}:${driverResult.key}`;
              const opts = keyToOptsMap.get(key);
              const value = getValueOrFallback(
                driverResult.value,
                opts?.fallback ?? opts?.defaultValue
              );
              resultsMap.set(key, value);
            });
          })
        );
        return orderedKeys.map((key) => ({
          key,
          value: resultsMap.get(key)
        }));
      },
      getMeta: async (key) => {
        const { driver, driverKey } = resolveKey(key);
        return await getMeta(driver, driverKey);
      },
      getMetas: async (args) => {
        const keys = args.map((arg) => {
          const key = typeof arg === "string" ? arg : arg.key;
          const { driverArea, driverKey } = resolveKey(key);
          return {
            key,
            driverArea,
            driverKey,
            driverMetaKey: getMetaKey(driverKey)
          };
        });
        const areaToDriverMetaKeysMap = keys.reduce((map, key) => {
          map[key.driverArea] ??= [];
          map[key.driverArea].push(key);
          return map;
        }, {});
        const resultsMap = {};
        await Promise.all(
          Object.entries(areaToDriverMetaKeysMap).map(async ([area, keys2]) => {
            const areaRes = await browser$1.storage[area].get(
              keys2.map((key) => key.driverMetaKey)
            );
            keys2.forEach((key) => {
              resultsMap[key.key] = areaRes[key.driverMetaKey] ?? {};
            });
          })
        );
        return keys.map((key) => ({
          key: key.key,
          meta: resultsMap[key.key]
        }));
      },
      setItem: async (key, value) => {
        const { driver, driverKey } = resolveKey(key);
        await setItem(driver, driverKey, value);
      },
      setItems: async (items) => {
        const areaToKeyValueMap = {};
        items.forEach((item) => {
          const { driverArea, driverKey } = resolveKey(
            "key" in item ? item.key : item.item.key
          );
          areaToKeyValueMap[driverArea] ??= [];
          areaToKeyValueMap[driverArea].push({
            key: driverKey,
            value: item.value
          });
        });
        await Promise.all(
          Object.entries(areaToKeyValueMap).map(async ([driverArea, values]) => {
            const driver = getDriver(driverArea);
            await driver.setItems(values);
          })
        );
      },
      setMeta: async (key, properties) => {
        const { driver, driverKey } = resolveKey(key);
        await setMeta(driver, driverKey, properties);
      },
      setMetas: async (items) => {
        const areaToMetaUpdatesMap = {};
        items.forEach((item) => {
          const { driverArea, driverKey } = resolveKey(
            "key" in item ? item.key : item.item.key
          );
          areaToMetaUpdatesMap[driverArea] ??= [];
          areaToMetaUpdatesMap[driverArea].push({
            key: driverKey,
            properties: item.meta
          });
        });
        await Promise.all(
          Object.entries(areaToMetaUpdatesMap).map(
            async ([storageArea, updates]) => {
              const driver = getDriver(storageArea);
              const metaKeys = updates.map(({ key }) => getMetaKey(key));
              const existingMetas = await driver.getItems(metaKeys);
              const existingMetaMap = Object.fromEntries(
                existingMetas.map(({ key, value }) => [key, getMetaValue(value)])
              );
              const metaUpdates = updates.map(({ key, properties }) => {
                const metaKey = getMetaKey(key);
                return {
                  key: metaKey,
                  value: mergeMeta(existingMetaMap[metaKey] ?? {}, properties)
                };
              });
              await driver.setItems(metaUpdates);
            }
          )
        );
      },
      removeItem: async (key, opts) => {
        const { driver, driverKey } = resolveKey(key);
        await removeItem(driver, driverKey, opts);
      },
      removeItems: async (keys) => {
        const areaToKeysMap = {};
        keys.forEach((key) => {
          let keyStr;
          let opts;
          if (typeof key === "string") {
            keyStr = key;
          } else if ("getValue" in key) {
            keyStr = key.key;
          } else if ("item" in key) {
            keyStr = key.item.key;
            opts = key.options;
          } else {
            keyStr = key.key;
            opts = key.options;
          }
          const { driverArea, driverKey } = resolveKey(keyStr);
          areaToKeysMap[driverArea] ??= [];
          areaToKeysMap[driverArea].push(driverKey);
          if (opts?.removeMeta) {
            areaToKeysMap[driverArea].push(getMetaKey(driverKey));
          }
        });
        await Promise.all(
          Object.entries(areaToKeysMap).map(async ([driverArea, keys2]) => {
            const driver = getDriver(driverArea);
            await driver.removeItems(keys2);
          })
        );
      },
      clear: async (base) => {
        const driver = getDriver(base);
        await driver.clear();
      },
      removeMeta: async (key, properties) => {
        const { driver, driverKey } = resolveKey(key);
        await removeMeta(driver, driverKey, properties);
      },
      snapshot: async (base, opts) => {
        const driver = getDriver(base);
        const data = await driver.snapshot();
        opts?.excludeKeys?.forEach((key) => {
          delete data[key];
          delete data[getMetaKey(key)];
        });
        return data;
      },
      restoreSnapshot: async (base, data) => {
        const driver = getDriver(base);
        await driver.restoreSnapshot(data);
      },
      watch: (key, cb) => {
        const { driver, driverKey } = resolveKey(key);
        return watch(driver, driverKey, cb);
      },
      unwatch() {
        Object.values(drivers).forEach((driver) => {
          driver.unwatch();
        });
      },
      defineItem: (key, opts) => {
        const { driver, driverKey } = resolveKey(key);
        const {
          version: targetVersion = 1,
          migrations = {},
          onMigrationComplete,
          debug = false
        } = opts ?? {};
        if (targetVersion < 1) {
          throw Error(
            "Storage item version cannot be less than 1. Initial versions should be set to 1, not 0."
          );
        }
        const migrate = async () => {
          const driverMetaKey = getMetaKey(driverKey);
          const [{ value }, { value: meta }] = await driver.getItems([
            driverKey,
            driverMetaKey
          ]);
          if (value == null) return;
          const currentVersion = meta?.v ?? 1;
          if (currentVersion > targetVersion) {
            throw Error(
              `Version downgrade detected (v${currentVersion} -> v${targetVersion}) for "${key}"`
            );
          }
          if (currentVersion === targetVersion) {
            return;
          }
          if (debug === true) {
            console.debug(
              `[@wxt-dev/storage] Running storage migration for ${key}: v${currentVersion} -> v${targetVersion}`
            );
          }
          const migrationsToRun = Array.from(
            { length: targetVersion - currentVersion },
            (_, i) => currentVersion + i + 1
          );
          let migratedValue = value;
          for (const migrateToVersion of migrationsToRun) {
            try {
              migratedValue = await migrations?.[migrateToVersion]?.(migratedValue) ?? migratedValue;
              if (debug === true) {
                console.debug(
                  `[@wxt-dev/storage] Storage migration processed for version: v${migrateToVersion}`
                );
              }
            } catch (err) {
              throw new MigrationError(key, migrateToVersion, {
                cause: err
              });
            }
          }
          await driver.setItems([
            { key: driverKey, value: migratedValue },
            { key: driverMetaKey, value: { ...meta, v: targetVersion } }
          ]);
          if (debug === true) {
            console.debug(
              `[@wxt-dev/storage] Storage migration completed for ${key} v${targetVersion}`,
              { migratedValue }
            );
          }
          onMigrationComplete?.(migratedValue, targetVersion);
        };
        const migrationsDone = opts?.migrations == null ? Promise.resolve() : migrate().catch((err) => {
          console.error(
            `[@wxt-dev/storage] Migration failed for ${key}`,
            err
          );
        });
        const initMutex = new Mutex();
        const getFallback = () => opts?.fallback ?? opts?.defaultValue ?? null;
        const getOrInitValue = () => initMutex.runExclusive(async () => {
          const value = await driver.getItem(driverKey);
          if (value != null || opts?.init == null) return value;
          const newValue = await opts.init();
          await driver.setItem(driverKey, newValue);
          return newValue;
        });
        migrationsDone.then(getOrInitValue);
        return {
          key,
          get defaultValue() {
            return getFallback();
          },
          get fallback() {
            return getFallback();
          },
          getValue: async () => {
            await migrationsDone;
            if (opts?.init) {
              return await getOrInitValue();
            } else {
              return await getItem(driver, driverKey, opts);
            }
          },
          getMeta: async () => {
            await migrationsDone;
            return await getMeta(driver, driverKey);
          },
          setValue: async (value) => {
            await migrationsDone;
            return await setItem(driver, driverKey, value);
          },
          setMeta: async (properties) => {
            await migrationsDone;
            return await setMeta(driver, driverKey, properties);
          },
          removeValue: async (opts2) => {
            await migrationsDone;
            return await removeItem(driver, driverKey, opts2);
          },
          removeMeta: async (properties) => {
            await migrationsDone;
            return await removeMeta(driver, driverKey, properties);
          },
          watch: (cb) => watch(
            driver,
            driverKey,
            (newValue, oldValue) => cb(newValue ?? getFallback(), oldValue ?? getFallback())
          ),
          migrate
        };
      }
    };
    return storage2;
  }
  function createDriver(storageArea) {
    const getStorageArea = () => {
      if (browser$1.runtime == null) {
        throw Error(
          [
            "'wxt/storage' must be loaded in a web extension environment",
            "\n - If thrown during a build, see https://github.com/wxt-dev/wxt/issues/371",
            " - If thrown during tests, mock 'wxt/browser' correctly. See https://wxt.dev/guide/go-further/testing.html\n"
          ].join("\n")
        );
      }
      if (browser$1.storage == null) {
        throw Error(
          "You must add the 'storage' permission to your manifest to use 'wxt/storage'"
        );
      }
      const area = browser$1.storage[storageArea];
      if (area == null)
        throw Error(`"browser.storage.${storageArea}" is undefined`);
      return area;
    };
    const watchListeners = /* @__PURE__ */ new Set();
    return {
      getItem: async (key) => {
        const res = await getStorageArea().get(key);
        return res[key];
      },
      getItems: async (keys) => {
        const result2 = await getStorageArea().get(keys);
        return keys.map((key) => ({ key, value: result2[key] ?? null }));
      },
      setItem: async (key, value) => {
        if (value == null) {
          await getStorageArea().remove(key);
        } else {
          await getStorageArea().set({ [key]: value });
        }
      },
      setItems: async (values) => {
        const map = values.reduce(
          (map2, { key, value }) => {
            map2[key] = value;
            return map2;
          },
          {}
        );
        await getStorageArea().set(map);
      },
      removeItem: async (key) => {
        await getStorageArea().remove(key);
      },
      removeItems: async (keys) => {
        await getStorageArea().remove(keys);
      },
      clear: async () => {
        await getStorageArea().clear();
      },
      snapshot: async () => {
        return await getStorageArea().get();
      },
      restoreSnapshot: async (data) => {
        await getStorageArea().set(data);
      },
      watch(key, cb) {
        const listener = (changes) => {
          const change = changes[key];
          if (change == null) return;
          if (dequal(change.newValue, change.oldValue)) return;
          cb(change.newValue ?? null, change.oldValue ?? null);
        };
        getStorageArea().onChanged.addListener(listener);
        watchListeners.add(listener);
        return () => {
          getStorageArea().onChanged.removeListener(listener);
          watchListeners.delete(listener);
        };
      },
      unwatch() {
        watchListeners.forEach((listener) => {
          getStorageArea().onChanged.removeListener(listener);
        });
        watchListeners.clear();
      }
    };
  }
  class MigrationError extends Error {
    constructor(key, version, options) {
      super(`v${version} migration failed for "${key}"`, options);
      this.key = key;
      this.version = version;
    }
  }
  var CollectionMode$1 = /* @__PURE__ */ ((CollectionMode2) => {
    CollectionMode2["Minimal"] = "minimal";
    CollectionMode2["MinimalWithName"] = "minimal_with_name";
    CollectionMode2["Full"] = "full";
    return CollectionMode2;
  })(CollectionMode$1 || {});
  const STORAGE_KEYS = {
    STASH: "local:magneto-stash",
    WHITELISTED_HOSTS: "sync:magneto-whitelistedHosts",
    COLLECTION_ENABLED: "sync:magneto-collectionEnabled",
    OPTIONS: "sync:magneto-options"
  };
  const DEFAULT_OPTIONS = {
    minimalCollectionMode: { enabled: false, collectNames: false },
    rollingCollection: { enabled: false, limit: 1e3 },
    adapters: {
      "ext.to": true,
      "knaben.org": true
    }
  };
  async function handleExportMagnets(format) {
    try {
      const magnetLinks = await storage.getItem(STORAGE_KEYS.STASH) || [];
      if (!magnetLinks.length) return { success: false, error: "No magnet links found to export" };
      const { content, mimeType, ext } = formatContent(magnetLinks, format);
      const dataUrl = `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`;
      const downloadId = await downloadFile(dataUrl, `magneto-stash-${Date.now()}.${ext}`);
      return { success: true, downloadId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Export failed"
      };
    }
  }
  async function downloadFile(url, filename) {
    if (!browser?.downloads) throw new Error("Downloads API not available");
    return new Promise((resolve, reject) => {
      browser.downloads.download(
        {
          url,
          filename,
          saveAs: true
        },
        (downloadId) => {
          const error = browser.runtime.lastError;
          if (error) {
            reject(new Error(error.message));
          } else if (downloadId === void 0) {
            reject(new Error("Download failed - no ID returned"));
          } else {
            resolve(downloadId);
          }
        }
      );
    });
  }
  function formatContent(links, format) {
    const formatters = {
      json: () => ({
        content: JSON.stringify(links, null, 2),
        mimeType: "application/json",
        ext: "json"
      }),
      csv: () => ({
        content: [
          "magnetLink,title,timestamp",
          ...links.map((l) => `"${escape(l.magnetLink)}","${escape(l.name || "")}","${escape(l.date)}"`)
        ].join("\n"),
        mimeType: "text/csv",
        ext: "csv"
      }),
      txt: () => ({
        content: links.map((l) => l.magnetLink).join("\n"),
        mimeType: "text/plain",
        ext: "txt"
      })
    };
    const key = format.toLowerCase();
    return (formatters[key] ?? formatters.txt)();
  }
  const escape = (str) => str.replace(/"/g, '""');
  function initializeStorage() {
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
  function extractNameFromMagnet(magnetLink) {
    try {
      const url = new URL(magnetLink);
      const dn = url.searchParams.get("dn");
      return dn ? decodeURIComponent(dn.replace(/\+/g, " ")) : null;
    } catch {
      return null;
    }
  }
  function extractInfoHash(magnetLink) {
    const match = magnetLink.match(/urn:btih:([a-zA-Z0-9]+)/i);
    if (!match) return "";
    return match[1].toLowerCase();
  }
  function parseSize(sizeStr) {
    if (!sizeStr) return null;
    const match = sizeStr.toUpperCase().trim().match(/^([\d.]+)\s*(B|KB|MB|GB|TB)$/);
    if (!match) return null;
    const value = parseFloat(match[1]);
    const unit = match[2];
    const multipliers = {
      B: 1,
      KB: 1024,
      MB: 1024 ** 2,
      GB: 1024 ** 3,
      TB: 1024 ** 4
    };
    return Math.round(value * multipliers[unit]);
  }
  function parseIntSafe(numStr) {
    if (!numStr) return null;
    const parsed = parseInt(numStr.replace(/,/g, ""), 10);
    return isNaN(parsed) ? null : parsed;
  }
  function normalizeMagnetData(raw, options) {
    const { mode } = options;
    const infoHash = extractInfoHash(raw.magnetLink);
    const embeddedName = extractNameFromMagnet(raw.magnetLink);
    const bestName = raw.name ?? embeddedName ?? null;
    const base = {
      infoHash,
      source: raw.source,
      scrapedAt: raw.scrapedAt
    };
    if (mode === CollectionMode.Minimal) {
      return base;
    }
    if (mode === CollectionMode.MinimalWithName) {
      return {
        ...base,
        name: bestName
      };
    }
    return {
      ...base,
      magnetLink: raw.magnetLink,
      name: bestName,
      sizeBytes: parseSize(raw.size),
      seeds: parseIntSafe(raw.seeds),
      leechers: parseIntSafe(raw.leechers),
      category: raw.category ?? null
    };
  }
  const definition = defineBackground(() => {
    browser.runtime.onInstalled.addListener(initializeStorage);
    browser.runtime.onMessage.addListener(handleMessage);
  });
  async function handleMessage(request) {
    try {
      switch (request.type) {
        case "MAGNET_LINKS":
          return await handleMagnetLinks(request.magnetLinks);
        case "EXPORT_MAGNETS":
          return await handleExportMagnets(request.format);
        case "TOGGLE_COLLECTION":
          return { success: true, message: "Collection toggle message received" };
        default:
          return { success: false, error: "Unknown message type" };
      }
    } catch (error) {
      console.error("Error handling message:", error);
      return { success: false, error: error.message };
    }
  }
  async function handleMagnetLinks(newMagnetLinks) {
    if (!Array.isArray(newMagnetLinks) || newMagnetLinks.length === 0) return { success: false, error: "No magnet links" };
    const normalizedLinks = newMagnetLinks.map(
      (raw) => normalizeMagnetData(raw, { mode: CollectionMode$1.Full })
    );
    const deduplicatedLinks = Array.from(
      new Map(normalizedLinks.map((link) => [link.infoHash, link])).values()
    );
    const existingLinks = await storage.getItem(STORAGE_KEYS.STASH) || [];
    const existingInfoHashes = new Set(existingLinks.map((link) => link.infoHash));
    const uniqueNewLinks = deduplicatedLinks.filter((link) => !existingInfoHashes.has(link.infoHash));
    if (uniqueNewLinks.length === 0) {
      return { success: true, message: "No new unique magnet links to add" };
    }
    const updatedStash = [...existingLinks, ...uniqueNewLinks];
    await storage.setItem(STORAGE_KEYS.STASH, updatedStash);
    await broadcastUpdate(updatedStash, uniqueNewLinks);
    return {
      success: true
    };
  }
  async function broadcastUpdate(updatedLinks, newLinks) {
    const message = {
      type: "MAGNET_LINKS_UPDATED",
      count: updatedLinks.length,
      addedCount: newLinks.length,
      newLinks
    };
    try {
      await browser.runtime.sendMessage(message);
    } catch (error) {
      console.debug("Could not broadcast update - UI likely closed");
    }
  }
  function initPlugins() {
  }
  var _MatchPattern = class {
    constructor(matchPattern) {
      if (matchPattern === "<all_urls>") {
        this.isAllUrls = true;
        this.protocolMatches = [..._MatchPattern.PROTOCOLS];
        this.hostnameMatch = "*";
        this.pathnameMatch = "*";
      } else {
        const groups = /(.*):\/\/(.*?)(\/.*)/.exec(matchPattern);
        if (groups == null)
          throw new InvalidMatchPattern(matchPattern, "Incorrect format");
        const [_, protocol, hostname, pathname] = groups;
        validateProtocol(matchPattern, protocol);
        validateHostname(matchPattern, hostname);
        this.protocolMatches = protocol === "*" ? ["http", "https"] : [protocol];
        this.hostnameMatch = hostname;
        this.pathnameMatch = pathname;
      }
    }
    includes(url) {
      if (this.isAllUrls)
        return true;
      const u = typeof url === "string" ? new URL(url) : url instanceof Location ? new URL(url.href) : url;
      return !!this.protocolMatches.find((protocol) => {
        if (protocol === "http")
          return this.isHttpMatch(u);
        if (protocol === "https")
          return this.isHttpsMatch(u);
        if (protocol === "file")
          return this.isFileMatch(u);
        if (protocol === "ftp")
          return this.isFtpMatch(u);
        if (protocol === "urn")
          return this.isUrnMatch(u);
      });
    }
    isHttpMatch(url) {
      return url.protocol === "http:" && this.isHostPathMatch(url);
    }
    isHttpsMatch(url) {
      return url.protocol === "https:" && this.isHostPathMatch(url);
    }
    isHostPathMatch(url) {
      if (!this.hostnameMatch || !this.pathnameMatch)
        return false;
      const hostnameMatchRegexs = [
        this.convertPatternToRegex(this.hostnameMatch),
        this.convertPatternToRegex(this.hostnameMatch.replace(/^\*\./, ""))
      ];
      const pathnameMatchRegex = this.convertPatternToRegex(this.pathnameMatch);
      return !!hostnameMatchRegexs.find((regex) => regex.test(url.hostname)) && pathnameMatchRegex.test(url.pathname);
    }
    isFileMatch(url) {
      throw Error("Not implemented: file:// pattern matching. Open a PR to add support");
    }
    isFtpMatch(url) {
      throw Error("Not implemented: ftp:// pattern matching. Open a PR to add support");
    }
    isUrnMatch(url) {
      throw Error("Not implemented: urn:// pattern matching. Open a PR to add support");
    }
    convertPatternToRegex(pattern) {
      const escaped = this.escapeForRegex(pattern);
      const starsReplaced = escaped.replace(/\\\*/g, ".*");
      return RegExp(`^${starsReplaced}$`);
    }
    escapeForRegex(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
  };
  var MatchPattern = _MatchPattern;
  MatchPattern.PROTOCOLS = ["http", "https", "file", "ftp", "urn"];
  var InvalidMatchPattern = class extends Error {
    constructor(matchPattern, reason) {
      super(`Invalid match pattern "${matchPattern}": ${reason}`);
    }
  };
  function validateProtocol(matchPattern, protocol) {
    if (!MatchPattern.PROTOCOLS.includes(protocol) && protocol !== "*")
      throw new InvalidMatchPattern(
        matchPattern,
        `${protocol} not a valid protocol (${MatchPattern.PROTOCOLS.join(", ")})`
      );
  }
  function validateHostname(matchPattern, hostname) {
    if (hostname.includes(":"))
      throw new InvalidMatchPattern(matchPattern, `Hostname cannot include a port`);
    if (hostname.includes("*") && hostname.length > 1 && !hostname.startsWith("*."))
      throw new InvalidMatchPattern(
        matchPattern,
        `If using a wildcard (*), it must go at the start of the hostname`
      );
  }
  function print(method, ...args) {
    if (typeof args[0] === "string") {
      const message = args.shift();
      method(`[wxt] ${message}`, ...args);
    } else {
      method("[wxt]", ...args);
    }
  }
  const logger = {
    debug: (...args) => print(console.debug, ...args),
    log: (...args) => print(console.log, ...args),
    warn: (...args) => print(console.warn, ...args),
    error: (...args) => print(console.error, ...args)
  };
  let ws;
  function getDevServerWebSocket() {
    if (ws == null) {
      const serverUrl = "ws://localhost:3000";
      logger.debug("Connecting to dev server @", serverUrl);
      ws = new WebSocket(serverUrl, "vite-hmr");
      ws.addWxtEventListener = ws.addEventListener.bind(ws);
      ws.sendCustom = (event, payload) => ws?.send(JSON.stringify({ type: "custom", event, payload }));
      ws.addEventListener("open", () => {
        logger.debug("Connected to dev server");
      });
      ws.addEventListener("close", () => {
        logger.debug("Disconnected from dev server");
      });
      ws.addEventListener("error", (event) => {
        logger.error("Failed to connect to dev server", event);
      });
      ws.addEventListener("message", (e) => {
        try {
          const message = JSON.parse(e.data);
          if (message.type === "custom") {
            ws?.dispatchEvent(
              new CustomEvent(message.event, { detail: message.data })
            );
          }
        } catch (err) {
          logger.error("Failed to handle message", err);
        }
      });
    }
    return ws;
  }
  function keepServiceWorkerAlive() {
    setInterval(async () => {
      await browser.runtime.getPlatformInfo();
    }, 5e3);
  }
  function reloadContentScript(payload) {
    const manifest = browser.runtime.getManifest();
    if (manifest.manifest_version == 2) {
      void reloadContentScriptMv2();
    } else {
      void reloadContentScriptMv3(payload);
    }
  }
  async function reloadContentScriptMv3({
    registration,
    contentScript
  }) {
    if (registration === "runtime") {
      await reloadRuntimeContentScriptMv3(contentScript);
    } else {
      await reloadManifestContentScriptMv3(contentScript);
    }
  }
  async function reloadManifestContentScriptMv3(contentScript) {
    const id = `wxt:${contentScript.js[0]}`;
    logger.log("Reloading content script:", contentScript);
    const registered = await browser.scripting.getRegisteredContentScripts();
    logger.debug("Existing scripts:", registered);
    const existing = registered.find((cs) => cs.id === id);
    if (existing) {
      logger.debug("Updating content script", existing);
      await browser.scripting.updateContentScripts([
        {
          ...contentScript,
          id,
          css: contentScript.css ?? []
        }
      ]);
    } else {
      logger.debug("Registering new content script...");
      await browser.scripting.registerContentScripts([
        {
          ...contentScript,
          id,
          css: contentScript.css ?? []
        }
      ]);
    }
    await reloadTabsForContentScript(contentScript);
  }
  async function reloadRuntimeContentScriptMv3(contentScript) {
    logger.log("Reloading content script:", contentScript);
    const registered = await browser.scripting.getRegisteredContentScripts();
    logger.debug("Existing scripts:", registered);
    const matches = registered.filter((cs) => {
      const hasJs = contentScript.js?.find((js) => cs.js?.includes(js));
      const hasCss = contentScript.css?.find((css) => cs.css?.includes(css));
      return hasJs || hasCss;
    });
    if (matches.length === 0) {
      logger.log(
        "Content script is not registered yet, nothing to reload",
        contentScript
      );
      return;
    }
    await browser.scripting.updateContentScripts(matches);
    await reloadTabsForContentScript(contentScript);
  }
  async function reloadTabsForContentScript(contentScript) {
    const allTabs = await browser.tabs.query({});
    const matchPatterns = contentScript.matches.map(
      (match) => new MatchPattern(match)
    );
    const matchingTabs = allTabs.filter((tab) => {
      const url = tab.url;
      if (!url) return false;
      return !!matchPatterns.find((pattern) => pattern.includes(url));
    });
    await Promise.all(
      matchingTabs.map(async (tab) => {
        try {
          await browser.tabs.reload(tab.id);
        } catch (err) {
          logger.warn("Failed to reload tab:", err);
        }
      })
    );
  }
  async function reloadContentScriptMv2(_payload) {
    throw Error("TODO: reloadContentScriptMv2");
  }
  {
    try {
      const ws2 = getDevServerWebSocket();
      ws2.addWxtEventListener("wxt:reload-extension", () => {
        browser.runtime.reload();
      });
      ws2.addWxtEventListener("wxt:reload-content-script", (event) => {
        reloadContentScript(event.detail);
      });
      if (true) {
        ws2.addEventListener(
          "open",
          () => ws2.sendCustom("wxt:background-initialized")
        );
        keepServiceWorkerAlive();
      }
    } catch (err) {
      logger.error("Failed to setup web socket connection with dev server", err);
    }
    browser.commands.onCommand.addListener((command) => {
      if (command === "wxt:reload-extension") {
        browser.runtime.reload();
      }
    });
  }
  let result;
  try {
    initPlugins();
    result = definition.main();
    if (result instanceof Promise) {
      console.warn(
        "The background's main() function return a promise, but it must be synchronous"
      );
    }
  } catch (err) {
    logger.error("The background crashed on startup!");
    throw err;
  }
  const result$1 = result;
  return result$1;
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2RlZmluZS1iYWNrZ3JvdW5kLm1qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Ad3h0LWRldi9icm93c2VyL3NyYy9pbmRleC5tanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvd3h0L2Rpc3QvYnJvd3Nlci5tanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZGVxdWFsL2xpdGUvaW5kZXgubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2FzeW5jLW11dGV4L2luZGV4Lm1qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Ad3h0LWRldi9zdG9yYWdlL2Rpc3QvaW5kZXgubWpzIiwiLi4vLi4vc3JjL2xpYi90eXBlcy50cyIsIi4uLy4uL3NyYy9saWIvY29uc3RhbnRzLnRzIiwiLi4vLi4vc3JjL2xpYi9zdGFzaC1leHBvcnRlci50cyIsIi4uLy4uL3NyYy9saWIvaW5pdC50cyIsIi4uLy4uL3NyYy9saWIvdXRpbHMudHMiLCIuLi8uLi9zcmMvbGliL25vcm1hbGl6ZXIudHMiLCIuLi8uLi9zcmMvZW50cnlwb2ludHMvYmFja2dyb3VuZC50cyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9Ad2ViZXh0LWNvcmUvbWF0Y2gtcGF0dGVybnMvbGliL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBkZWZpbmVCYWNrZ3JvdW5kKGFyZykge1xuICBpZiAoYXJnID09IG51bGwgfHwgdHlwZW9mIGFyZyA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4geyBtYWluOiBhcmcgfTtcbiAgcmV0dXJuIGFyZztcbn1cbiIsIi8vICNyZWdpb24gc25pcHBldFxuZXhwb3J0IGNvbnN0IGJyb3dzZXIgPSBnbG9iYWxUaGlzLmJyb3dzZXI/LnJ1bnRpbWU/LmlkXG4gID8gZ2xvYmFsVGhpcy5icm93c2VyXG4gIDogZ2xvYmFsVGhpcy5jaHJvbWU7XG4vLyAjZW5kcmVnaW9uIHNuaXBwZXRcbiIsImltcG9ydCB7IGJyb3dzZXIgYXMgX2Jyb3dzZXIgfSBmcm9tIFwiQHd4dC1kZXYvYnJvd3NlclwiO1xuZXhwb3J0IGNvbnN0IGJyb3dzZXIgPSBfYnJvd3NlcjtcbmV4cG9ydCB7fTtcbiIsInZhciBoYXMgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG5leHBvcnQgZnVuY3Rpb24gZGVxdWFsKGZvbywgYmFyKSB7XG5cdHZhciBjdG9yLCBsZW47XG5cdGlmIChmb28gPT09IGJhcikgcmV0dXJuIHRydWU7XG5cblx0aWYgKGZvbyAmJiBiYXIgJiYgKGN0b3I9Zm9vLmNvbnN0cnVjdG9yKSA9PT0gYmFyLmNvbnN0cnVjdG9yKSB7XG5cdFx0aWYgKGN0b3IgPT09IERhdGUpIHJldHVybiBmb28uZ2V0VGltZSgpID09PSBiYXIuZ2V0VGltZSgpO1xuXHRcdGlmIChjdG9yID09PSBSZWdFeHApIHJldHVybiBmb28udG9TdHJpbmcoKSA9PT0gYmFyLnRvU3RyaW5nKCk7XG5cblx0XHRpZiAoY3RvciA9PT0gQXJyYXkpIHtcblx0XHRcdGlmICgobGVuPWZvby5sZW5ndGgpID09PSBiYXIubGVuZ3RoKSB7XG5cdFx0XHRcdHdoaWxlIChsZW4tLSAmJiBkZXF1YWwoZm9vW2xlbl0sIGJhcltsZW5dKSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbGVuID09PSAtMTtcblx0XHR9XG5cblx0XHRpZiAoIWN0b3IgfHwgdHlwZW9mIGZvbyA9PT0gJ29iamVjdCcpIHtcblx0XHRcdGxlbiA9IDA7XG5cdFx0XHRmb3IgKGN0b3IgaW4gZm9vKSB7XG5cdFx0XHRcdGlmIChoYXMuY2FsbChmb28sIGN0b3IpICYmICsrbGVuICYmICFoYXMuY2FsbChiYXIsIGN0b3IpKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRcdGlmICghKGN0b3IgaW4gYmFyKSB8fCAhZGVxdWFsKGZvb1tjdG9yXSwgYmFyW2N0b3JdKSkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIE9iamVjdC5rZXlzKGJhcikubGVuZ3RoID09PSBsZW47XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGZvbyAhPT0gZm9vICYmIGJhciAhPT0gYmFyO1xufVxuIiwiY29uc3QgRV9USU1FT1VUID0gbmV3IEVycm9yKCd0aW1lb3V0IHdoaWxlIHdhaXRpbmcgZm9yIG11dGV4IHRvIGJlY29tZSBhdmFpbGFibGUnKTtcbmNvbnN0IEVfQUxSRUFEWV9MT0NLRUQgPSBuZXcgRXJyb3IoJ211dGV4IGFscmVhZHkgbG9ja2VkJyk7XG5jb25zdCBFX0NBTkNFTEVEID0gbmV3IEVycm9yKCdyZXF1ZXN0IGZvciBsb2NrIGNhbmNlbGVkJyk7XG5cbnZhciBfX2F3YWl0ZXIkMiA9ICh1bmRlZmluZWQgJiYgdW5kZWZpbmVkLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuY2xhc3MgU2VtYXBob3JlIHtcbiAgICBjb25zdHJ1Y3RvcihfdmFsdWUsIF9jYW5jZWxFcnJvciA9IEVfQ0FOQ0VMRUQpIHtcbiAgICAgICAgdGhpcy5fdmFsdWUgPSBfdmFsdWU7XG4gICAgICAgIHRoaXMuX2NhbmNlbEVycm9yID0gX2NhbmNlbEVycm9yO1xuICAgICAgICB0aGlzLl9xdWV1ZSA9IFtdO1xuICAgICAgICB0aGlzLl93ZWlnaHRlZFdhaXRlcnMgPSBbXTtcbiAgICB9XG4gICAgYWNxdWlyZSh3ZWlnaHQgPSAxLCBwcmlvcml0eSA9IDApIHtcbiAgICAgICAgaWYgKHdlaWdodCA8PSAwKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIHdlaWdodCAke3dlaWdodH06IG11c3QgYmUgcG9zaXRpdmVgKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRhc2sgPSB7IHJlc29sdmUsIHJlamVjdCwgd2VpZ2h0LCBwcmlvcml0eSB9O1xuICAgICAgICAgICAgY29uc3QgaSA9IGZpbmRJbmRleEZyb21FbmQodGhpcy5fcXVldWUsIChvdGhlcikgPT4gcHJpb3JpdHkgPD0gb3RoZXIucHJpb3JpdHkpO1xuICAgICAgICAgICAgaWYgKGkgPT09IC0xICYmIHdlaWdodCA8PSB0aGlzLl92YWx1ZSkge1xuICAgICAgICAgICAgICAgIC8vIE5lZWRzIGltbWVkaWF0ZSBkaXNwYXRjaCwgc2tpcCB0aGUgcXVldWVcbiAgICAgICAgICAgICAgICB0aGlzLl9kaXNwYXRjaEl0ZW0odGFzayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9xdWV1ZS5zcGxpY2UoaSArIDEsIDAsIHRhc2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcnVuRXhjbHVzaXZlKGNhbGxiYWNrXzEpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlciQyKHRoaXMsIGFyZ3VtZW50cywgdm9pZCAwLCBmdW5jdGlvbiogKGNhbGxiYWNrLCB3ZWlnaHQgPSAxLCBwcmlvcml0eSA9IDApIHtcbiAgICAgICAgICAgIGNvbnN0IFt2YWx1ZSwgcmVsZWFzZV0gPSB5aWVsZCB0aGlzLmFjcXVpcmUod2VpZ2h0LCBwcmlvcml0eSk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCBjYWxsYmFjayh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICByZWxlYXNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICB3YWl0Rm9yVW5sb2NrKHdlaWdodCA9IDEsIHByaW9yaXR5ID0gMCkge1xuICAgICAgICBpZiAod2VpZ2h0IDw9IDApXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgd2VpZ2h0ICR7d2VpZ2h0fTogbXVzdCBiZSBwb3NpdGl2ZWApO1xuICAgICAgICBpZiAodGhpcy5fY291bGRMb2NrSW1tZWRpYXRlbHkod2VpZ2h0LCBwcmlvcml0eSkpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5fd2VpZ2h0ZWRXYWl0ZXJzW3dlaWdodCAtIDFdKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLl93ZWlnaHRlZFdhaXRlcnNbd2VpZ2h0IC0gMV0gPSBbXTtcbiAgICAgICAgICAgICAgICBpbnNlcnRTb3J0ZWQodGhpcy5fd2VpZ2h0ZWRXYWl0ZXJzW3dlaWdodCAtIDFdLCB7IHJlc29sdmUsIHByaW9yaXR5IH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaXNMb2NrZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl92YWx1ZSA8PSAwO1xuICAgIH1cbiAgICBnZXRWYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICAgIH1cbiAgICBzZXRWYWx1ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICAgICAgICB0aGlzLl9kaXNwYXRjaFF1ZXVlKCk7XG4gICAgfVxuICAgIHJlbGVhc2Uod2VpZ2h0ID0gMSkge1xuICAgICAgICBpZiAod2VpZ2h0IDw9IDApXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgd2VpZ2h0ICR7d2VpZ2h0fTogbXVzdCBiZSBwb3NpdGl2ZWApO1xuICAgICAgICB0aGlzLl92YWx1ZSArPSB3ZWlnaHQ7XG4gICAgICAgIHRoaXMuX2Rpc3BhdGNoUXVldWUoKTtcbiAgICB9XG4gICAgY2FuY2VsKCkge1xuICAgICAgICB0aGlzLl9xdWV1ZS5mb3JFYWNoKChlbnRyeSkgPT4gZW50cnkucmVqZWN0KHRoaXMuX2NhbmNlbEVycm9yKSk7XG4gICAgICAgIHRoaXMuX3F1ZXVlID0gW107XG4gICAgfVxuICAgIF9kaXNwYXRjaFF1ZXVlKCkge1xuICAgICAgICB0aGlzLl9kcmFpblVubG9ja1dhaXRlcnMoKTtcbiAgICAgICAgd2hpbGUgKHRoaXMuX3F1ZXVlLmxlbmd0aCA+IDAgJiYgdGhpcy5fcXVldWVbMF0ud2VpZ2h0IDw9IHRoaXMuX3ZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9kaXNwYXRjaEl0ZW0odGhpcy5fcXVldWUuc2hpZnQoKSk7XG4gICAgICAgICAgICB0aGlzLl9kcmFpblVubG9ja1dhaXRlcnMoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBfZGlzcGF0Y2hJdGVtKGl0ZW0pIHtcbiAgICAgICAgY29uc3QgcHJldmlvdXNWYWx1ZSA9IHRoaXMuX3ZhbHVlO1xuICAgICAgICB0aGlzLl92YWx1ZSAtPSBpdGVtLndlaWdodDtcbiAgICAgICAgaXRlbS5yZXNvbHZlKFtwcmV2aW91c1ZhbHVlLCB0aGlzLl9uZXdSZWxlYXNlcihpdGVtLndlaWdodCldKTtcbiAgICB9XG4gICAgX25ld1JlbGVhc2VyKHdlaWdodCkge1xuICAgICAgICBsZXQgY2FsbGVkID0gZmFsc2U7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoY2FsbGVkKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNhbGxlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnJlbGVhc2Uod2VpZ2h0KTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgX2RyYWluVW5sb2NrV2FpdGVycygpIHtcbiAgICAgICAgaWYgKHRoaXMuX3F1ZXVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgZm9yIChsZXQgd2VpZ2h0ID0gdGhpcy5fdmFsdWU7IHdlaWdodCA+IDA7IHdlaWdodC0tKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgd2FpdGVycyA9IHRoaXMuX3dlaWdodGVkV2FpdGVyc1t3ZWlnaHQgLSAxXTtcbiAgICAgICAgICAgICAgICBpZiAoIXdhaXRlcnMpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIHdhaXRlcnMuZm9yRWFjaCgod2FpdGVyKSA9PiB3YWl0ZXIucmVzb2x2ZSgpKTtcbiAgICAgICAgICAgICAgICB0aGlzLl93ZWlnaHRlZFdhaXRlcnNbd2VpZ2h0IC0gMV0gPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHF1ZXVlZFByaW9yaXR5ID0gdGhpcy5fcXVldWVbMF0ucHJpb3JpdHk7XG4gICAgICAgICAgICBmb3IgKGxldCB3ZWlnaHQgPSB0aGlzLl92YWx1ZTsgd2VpZ2h0ID4gMDsgd2VpZ2h0LS0pIHtcbiAgICAgICAgICAgICAgICBjb25zdCB3YWl0ZXJzID0gdGhpcy5fd2VpZ2h0ZWRXYWl0ZXJzW3dlaWdodCAtIDFdO1xuICAgICAgICAgICAgICAgIGlmICghd2FpdGVycylcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgY29uc3QgaSA9IHdhaXRlcnMuZmluZEluZGV4KCh3YWl0ZXIpID0+IHdhaXRlci5wcmlvcml0eSA8PSBxdWV1ZWRQcmlvcml0eSk7XG4gICAgICAgICAgICAgICAgKGkgPT09IC0xID8gd2FpdGVycyA6IHdhaXRlcnMuc3BsaWNlKDAsIGkpKVxuICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaCgod2FpdGVyID0+IHdhaXRlci5yZXNvbHZlKCkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBfY291bGRMb2NrSW1tZWRpYXRlbHkod2VpZ2h0LCBwcmlvcml0eSkge1xuICAgICAgICByZXR1cm4gKHRoaXMuX3F1ZXVlLmxlbmd0aCA9PT0gMCB8fCB0aGlzLl9xdWV1ZVswXS5wcmlvcml0eSA8IHByaW9yaXR5KSAmJlxuICAgICAgICAgICAgd2VpZ2h0IDw9IHRoaXMuX3ZhbHVlO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGluc2VydFNvcnRlZChhLCB2KSB7XG4gICAgY29uc3QgaSA9IGZpbmRJbmRleEZyb21FbmQoYSwgKG90aGVyKSA9PiB2LnByaW9yaXR5IDw9IG90aGVyLnByaW9yaXR5KTtcbiAgICBhLnNwbGljZShpICsgMSwgMCwgdik7XG59XG5mdW5jdGlvbiBmaW5kSW5kZXhGcm9tRW5kKGEsIHByZWRpY2F0ZSkge1xuICAgIGZvciAobGV0IGkgPSBhLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGlmIChwcmVkaWNhdGUoYVtpXSkpIHtcbiAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbn1cblxudmFyIF9fYXdhaXRlciQxID0gKHVuZGVmaW5lZCAmJiB1bmRlZmluZWQuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5jbGFzcyBNdXRleCB7XG4gICAgY29uc3RydWN0b3IoY2FuY2VsRXJyb3IpIHtcbiAgICAgICAgdGhpcy5fc2VtYXBob3JlID0gbmV3IFNlbWFwaG9yZSgxLCBjYW5jZWxFcnJvcik7XG4gICAgfVxuICAgIGFjcXVpcmUoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIkMSh0aGlzLCBhcmd1bWVudHMsIHZvaWQgMCwgZnVuY3Rpb24qIChwcmlvcml0eSA9IDApIHtcbiAgICAgICAgICAgIGNvbnN0IFssIHJlbGVhc2VyXSA9IHlpZWxkIHRoaXMuX3NlbWFwaG9yZS5hY3F1aXJlKDEsIHByaW9yaXR5KTtcbiAgICAgICAgICAgIHJldHVybiByZWxlYXNlcjtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJ1bkV4Y2x1c2l2ZShjYWxsYmFjaywgcHJpb3JpdHkgPSAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZW1hcGhvcmUucnVuRXhjbHVzaXZlKCgpID0+IGNhbGxiYWNrKCksIDEsIHByaW9yaXR5KTtcbiAgICB9XG4gICAgaXNMb2NrZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZW1hcGhvcmUuaXNMb2NrZWQoKTtcbiAgICB9XG4gICAgd2FpdEZvclVubG9jayhwcmlvcml0eSA9IDApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbWFwaG9yZS53YWl0Rm9yVW5sb2NrKDEsIHByaW9yaXR5KTtcbiAgICB9XG4gICAgcmVsZWFzZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuX3NlbWFwaG9yZS5pc0xvY2tlZCgpKVxuICAgICAgICAgICAgdGhpcy5fc2VtYXBob3JlLnJlbGVhc2UoKTtcbiAgICB9XG4gICAgY2FuY2VsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2VtYXBob3JlLmNhbmNlbCgpO1xuICAgIH1cbn1cblxudmFyIF9fYXdhaXRlciA9ICh1bmRlZmluZWQgJiYgdW5kZWZpbmVkLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuZnVuY3Rpb24gd2l0aFRpbWVvdXQoc3luYywgdGltZW91dCwgdGltZW91dEVycm9yID0gRV9USU1FT1VUKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYWNxdWlyZTogKHdlaWdodE9yUHJpb3JpdHksIHByaW9yaXR5KSA9PiB7XG4gICAgICAgICAgICBsZXQgd2VpZ2h0O1xuICAgICAgICAgICAgaWYgKGlzU2VtYXBob3JlKHN5bmMpKSB7XG4gICAgICAgICAgICAgICAgd2VpZ2h0ID0gd2VpZ2h0T3JQcmlvcml0eTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHdlaWdodCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBwcmlvcml0eSA9IHdlaWdodE9yUHJpb3JpdHk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAod2VpZ2h0ICE9PSB1bmRlZmluZWQgJiYgd2VpZ2h0IDw9IDApIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgd2VpZ2h0ICR7d2VpZ2h0fTogbXVzdCBiZSBwb3NpdGl2ZWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBsZXQgaXNUaW1lb3V0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgY29uc3QgaGFuZGxlID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlzVGltZW91dCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdCh0aW1lb3V0RXJyb3IpO1xuICAgICAgICAgICAgICAgIH0sIHRpbWVvdXQpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRpY2tldCA9IHlpZWxkIChpc1NlbWFwaG9yZShzeW5jKVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBzeW5jLmFjcXVpcmUod2VpZ2h0LCBwcmlvcml0eSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogc3luYy5hY3F1aXJlKHByaW9yaXR5KSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc1RpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlbGVhc2UgPSBBcnJheS5pc0FycmF5KHRpY2tldCkgPyB0aWNrZXRbMV0gOiB0aWNrZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWxlYXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoaGFuZGxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodGlja2V0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzVGltZW91dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGhhbmRsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0sXG4gICAgICAgIHJ1bkV4Y2x1c2l2ZShjYWxsYmFjaywgd2VpZ2h0LCBwcmlvcml0eSkge1xuICAgICAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBsZXQgcmVsZWFzZSA9ICgpID0+IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0aWNrZXQgPSB5aWVsZCB0aGlzLmFjcXVpcmUod2VpZ2h0LCBwcmlvcml0eSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHRpY2tldCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbGVhc2UgPSB0aWNrZXRbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geWllbGQgY2FsbGJhY2sodGlja2V0WzBdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbGVhc2UgPSB0aWNrZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geWllbGQgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgcmVsZWFzZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICByZWxlYXNlKHdlaWdodCkge1xuICAgICAgICAgICAgc3luYy5yZWxlYXNlKHdlaWdodCk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhbmNlbCgpIHtcbiAgICAgICAgICAgIHJldHVybiBzeW5jLmNhbmNlbCgpO1xuICAgICAgICB9LFxuICAgICAgICB3YWl0Rm9yVW5sb2NrOiAod2VpZ2h0T3JQcmlvcml0eSwgcHJpb3JpdHkpID0+IHtcbiAgICAgICAgICAgIGxldCB3ZWlnaHQ7XG4gICAgICAgICAgICBpZiAoaXNTZW1hcGhvcmUoc3luYykpIHtcbiAgICAgICAgICAgICAgICB3ZWlnaHQgPSB3ZWlnaHRPclByaW9yaXR5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgd2VpZ2h0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIHByaW9yaXR5ID0gd2VpZ2h0T3JQcmlvcml0eTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh3ZWlnaHQgIT09IHVuZGVmaW5lZCAmJiB3ZWlnaHQgPD0gMCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgaW52YWxpZCB3ZWlnaHQgJHt3ZWlnaHR9OiBtdXN0IGJlIHBvc2l0aXZlYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRsZSA9IHNldFRpbWVvdXQoKCkgPT4gcmVqZWN0KHRpbWVvdXRFcnJvciksIHRpbWVvdXQpO1xuICAgICAgICAgICAgICAgIChpc1NlbWFwaG9yZShzeW5jKVxuICAgICAgICAgICAgICAgICAgICA/IHN5bmMud2FpdEZvclVubG9jayh3ZWlnaHQsIHByaW9yaXR5KVxuICAgICAgICAgICAgICAgICAgICA6IHN5bmMud2FpdEZvclVubG9jayhwcmlvcml0eSkpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoaGFuZGxlKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGlzTG9ja2VkOiAoKSA9PiBzeW5jLmlzTG9ja2VkKCksXG4gICAgICAgIGdldFZhbHVlOiAoKSA9PiBzeW5jLmdldFZhbHVlKCksXG4gICAgICAgIHNldFZhbHVlOiAodmFsdWUpID0+IHN5bmMuc2V0VmFsdWUodmFsdWUpLFxuICAgIH07XG59XG5mdW5jdGlvbiBpc1NlbWFwaG9yZShzeW5jKSB7XG4gICAgcmV0dXJuIHN5bmMuZ2V0VmFsdWUgIT09IHVuZGVmaW5lZDtcbn1cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saXNuZSBAdHlwZXNjcmlwdC1lc2xpbnQvZXhwbGljaXQtbW9kdWxlLWJvdW5kYXJ5LXR5cGVzXG5mdW5jdGlvbiB0cnlBY3F1aXJlKHN5bmMsIGFscmVhZHlBY3F1aXJlZEVycm9yID0gRV9BTFJFQURZX0xPQ0tFRCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgcmV0dXJuIHdpdGhUaW1lb3V0KHN5bmMsIDAsIGFscmVhZHlBY3F1aXJlZEVycm9yKTtcbn1cblxuZXhwb3J0IHsgRV9BTFJFQURZX0xPQ0tFRCwgRV9DQU5DRUxFRCwgRV9USU1FT1VULCBNdXRleCwgU2VtYXBob3JlLCB0cnlBY3F1aXJlLCB3aXRoVGltZW91dCB9O1xuIiwiaW1wb3J0IHsgZGVxdWFsIH0gZnJvbSAnZGVxdWFsL2xpdGUnO1xuaW1wb3J0IHsgTXV0ZXggfSBmcm9tICdhc3luYy1tdXRleCc7XG5pbXBvcnQgeyBicm93c2VyIH0gZnJvbSAnQHd4dC1kZXYvYnJvd3Nlcic7XG5cbmNvbnN0IHN0b3JhZ2UgPSBjcmVhdGVTdG9yYWdlKCk7XG5mdW5jdGlvbiBjcmVhdGVTdG9yYWdlKCkge1xuICBjb25zdCBkcml2ZXJzID0ge1xuICAgIGxvY2FsOiBjcmVhdGVEcml2ZXIoXCJsb2NhbFwiKSxcbiAgICBzZXNzaW9uOiBjcmVhdGVEcml2ZXIoXCJzZXNzaW9uXCIpLFxuICAgIHN5bmM6IGNyZWF0ZURyaXZlcihcInN5bmNcIiksXG4gICAgbWFuYWdlZDogY3JlYXRlRHJpdmVyKFwibWFuYWdlZFwiKVxuICB9O1xuICBjb25zdCBnZXREcml2ZXIgPSAoYXJlYSkgPT4ge1xuICAgIGNvbnN0IGRyaXZlciA9IGRyaXZlcnNbYXJlYV07XG4gICAgaWYgKGRyaXZlciA9PSBudWxsKSB7XG4gICAgICBjb25zdCBhcmVhTmFtZXMgPSBPYmplY3Qua2V5cyhkcml2ZXJzKS5qb2luKFwiLCBcIik7XG4gICAgICB0aHJvdyBFcnJvcihgSW52YWxpZCBhcmVhIFwiJHthcmVhfVwiLiBPcHRpb25zOiAke2FyZWFOYW1lc31gKTtcbiAgICB9XG4gICAgcmV0dXJuIGRyaXZlcjtcbiAgfTtcbiAgY29uc3QgcmVzb2x2ZUtleSA9IChrZXkpID0+IHtcbiAgICBjb25zdCBkZWxpbWluYXRvckluZGV4ID0ga2V5LmluZGV4T2YoXCI6XCIpO1xuICAgIGNvbnN0IGRyaXZlckFyZWEgPSBrZXkuc3Vic3RyaW5nKDAsIGRlbGltaW5hdG9ySW5kZXgpO1xuICAgIGNvbnN0IGRyaXZlcktleSA9IGtleS5zdWJzdHJpbmcoZGVsaW1pbmF0b3JJbmRleCArIDEpO1xuICAgIGlmIChkcml2ZXJLZXkgPT0gbnVsbClcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICBgU3RvcmFnZSBrZXkgc2hvdWxkIGJlIGluIHRoZSBmb3JtIG9mIFwiYXJlYTprZXlcIiwgYnV0IHJlY2VpdmVkIFwiJHtrZXl9XCJgXG4gICAgICApO1xuICAgIHJldHVybiB7XG4gICAgICBkcml2ZXJBcmVhLFxuICAgICAgZHJpdmVyS2V5LFxuICAgICAgZHJpdmVyOiBnZXREcml2ZXIoZHJpdmVyQXJlYSlcbiAgICB9O1xuICB9O1xuICBjb25zdCBnZXRNZXRhS2V5ID0gKGtleSkgPT4ga2V5ICsgXCIkXCI7XG4gIGNvbnN0IG1lcmdlTWV0YSA9IChvbGRNZXRhLCBuZXdNZXRhKSA9PiB7XG4gICAgY29uc3QgbmV3RmllbGRzID0geyAuLi5vbGRNZXRhIH07XG4gICAgT2JqZWN0LmVudHJpZXMobmV3TWV0YSkuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICBpZiAodmFsdWUgPT0gbnVsbCkgZGVsZXRlIG5ld0ZpZWxkc1trZXldO1xuICAgICAgZWxzZSBuZXdGaWVsZHNba2V5XSA9IHZhbHVlO1xuICAgIH0pO1xuICAgIHJldHVybiBuZXdGaWVsZHM7XG4gIH07XG4gIGNvbnN0IGdldFZhbHVlT3JGYWxsYmFjayA9ICh2YWx1ZSwgZmFsbGJhY2spID0+IHZhbHVlID8/IGZhbGxiYWNrID8/IG51bGw7XG4gIGNvbnN0IGdldE1ldGFWYWx1ZSA9IChwcm9wZXJ0aWVzKSA9PiB0eXBlb2YgcHJvcGVydGllcyA9PT0gXCJvYmplY3RcIiAmJiAhQXJyYXkuaXNBcnJheShwcm9wZXJ0aWVzKSA/IHByb3BlcnRpZXMgOiB7fTtcbiAgY29uc3QgZ2V0SXRlbSA9IGFzeW5jIChkcml2ZXIsIGRyaXZlcktleSwgb3B0cykgPT4ge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGRyaXZlci5nZXRJdGVtKGRyaXZlcktleSk7XG4gICAgcmV0dXJuIGdldFZhbHVlT3JGYWxsYmFjayhyZXMsIG9wdHM/LmZhbGxiYWNrID8/IG9wdHM/LmRlZmF1bHRWYWx1ZSk7XG4gIH07XG4gIGNvbnN0IGdldE1ldGEgPSBhc3luYyAoZHJpdmVyLCBkcml2ZXJLZXkpID0+IHtcbiAgICBjb25zdCBtZXRhS2V5ID0gZ2V0TWV0YUtleShkcml2ZXJLZXkpO1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGRyaXZlci5nZXRJdGVtKG1ldGFLZXkpO1xuICAgIHJldHVybiBnZXRNZXRhVmFsdWUocmVzKTtcbiAgfTtcbiAgY29uc3Qgc2V0SXRlbSA9IGFzeW5jIChkcml2ZXIsIGRyaXZlcktleSwgdmFsdWUpID0+IHtcbiAgICBhd2FpdCBkcml2ZXIuc2V0SXRlbShkcml2ZXJLZXksIHZhbHVlID8/IG51bGwpO1xuICB9O1xuICBjb25zdCBzZXRNZXRhID0gYXN5bmMgKGRyaXZlciwgZHJpdmVyS2V5LCBwcm9wZXJ0aWVzKSA9PiB7XG4gICAgY29uc3QgbWV0YUtleSA9IGdldE1ldGFLZXkoZHJpdmVyS2V5KTtcbiAgICBjb25zdCBleGlzdGluZ0ZpZWxkcyA9IGdldE1ldGFWYWx1ZShhd2FpdCBkcml2ZXIuZ2V0SXRlbShtZXRhS2V5KSk7XG4gICAgYXdhaXQgZHJpdmVyLnNldEl0ZW0obWV0YUtleSwgbWVyZ2VNZXRhKGV4aXN0aW5nRmllbGRzLCBwcm9wZXJ0aWVzKSk7XG4gIH07XG4gIGNvbnN0IHJlbW92ZUl0ZW0gPSBhc3luYyAoZHJpdmVyLCBkcml2ZXJLZXksIG9wdHMpID0+IHtcbiAgICBhd2FpdCBkcml2ZXIucmVtb3ZlSXRlbShkcml2ZXJLZXkpO1xuICAgIGlmIChvcHRzPy5yZW1vdmVNZXRhKSB7XG4gICAgICBjb25zdCBtZXRhS2V5ID0gZ2V0TWV0YUtleShkcml2ZXJLZXkpO1xuICAgICAgYXdhaXQgZHJpdmVyLnJlbW92ZUl0ZW0obWV0YUtleSk7XG4gICAgfVxuICB9O1xuICBjb25zdCByZW1vdmVNZXRhID0gYXN5bmMgKGRyaXZlciwgZHJpdmVyS2V5LCBwcm9wZXJ0aWVzKSA9PiB7XG4gICAgY29uc3QgbWV0YUtleSA9IGdldE1ldGFLZXkoZHJpdmVyS2V5KTtcbiAgICBpZiAocHJvcGVydGllcyA9PSBudWxsKSB7XG4gICAgICBhd2FpdCBkcml2ZXIucmVtb3ZlSXRlbShtZXRhS2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgbmV3RmllbGRzID0gZ2V0TWV0YVZhbHVlKGF3YWl0IGRyaXZlci5nZXRJdGVtKG1ldGFLZXkpKTtcbiAgICAgIFtwcm9wZXJ0aWVzXS5mbGF0KCkuZm9yRWFjaCgoZmllbGQpID0+IGRlbGV0ZSBuZXdGaWVsZHNbZmllbGRdKTtcbiAgICAgIGF3YWl0IGRyaXZlci5zZXRJdGVtKG1ldGFLZXksIG5ld0ZpZWxkcyk7XG4gICAgfVxuICB9O1xuICBjb25zdCB3YXRjaCA9IChkcml2ZXIsIGRyaXZlcktleSwgY2IpID0+IHtcbiAgICByZXR1cm4gZHJpdmVyLndhdGNoKGRyaXZlcktleSwgY2IpO1xuICB9O1xuICBjb25zdCBzdG9yYWdlMiA9IHtcbiAgICBnZXRJdGVtOiBhc3luYyAoa2V5LCBvcHRzKSA9PiB7XG4gICAgICBjb25zdCB7IGRyaXZlciwgZHJpdmVyS2V5IH0gPSByZXNvbHZlS2V5KGtleSk7XG4gICAgICByZXR1cm4gYXdhaXQgZ2V0SXRlbShkcml2ZXIsIGRyaXZlcktleSwgb3B0cyk7XG4gICAgfSxcbiAgICBnZXRJdGVtczogYXN5bmMgKGtleXMpID0+IHtcbiAgICAgIGNvbnN0IGFyZWFUb0tleU1hcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gICAgICBjb25zdCBrZXlUb09wdHNNYXAgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICAgICAgY29uc3Qgb3JkZXJlZEtleXMgPSBbXTtcbiAgICAgIGtleXMuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgIGxldCBrZXlTdHI7XG4gICAgICAgIGxldCBvcHRzO1xuICAgICAgICBpZiAodHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgIGtleVN0ciA9IGtleTtcbiAgICAgICAgfSBlbHNlIGlmIChcImdldFZhbHVlXCIgaW4ga2V5KSB7XG4gICAgICAgICAga2V5U3RyID0ga2V5LmtleTtcbiAgICAgICAgICBvcHRzID0geyBmYWxsYmFjazoga2V5LmZhbGxiYWNrIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAga2V5U3RyID0ga2V5LmtleTtcbiAgICAgICAgICBvcHRzID0ga2V5Lm9wdGlvbnM7XG4gICAgICAgIH1cbiAgICAgICAgb3JkZXJlZEtleXMucHVzaChrZXlTdHIpO1xuICAgICAgICBjb25zdCB7IGRyaXZlckFyZWEsIGRyaXZlcktleSB9ID0gcmVzb2x2ZUtleShrZXlTdHIpO1xuICAgICAgICBjb25zdCBhcmVhS2V5cyA9IGFyZWFUb0tleU1hcC5nZXQoZHJpdmVyQXJlYSkgPz8gW107XG4gICAgICAgIGFyZWFUb0tleU1hcC5zZXQoZHJpdmVyQXJlYSwgYXJlYUtleXMuY29uY2F0KGRyaXZlcktleSkpO1xuICAgICAgICBrZXlUb09wdHNNYXAuc2V0KGtleVN0ciwgb3B0cyk7XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IHJlc3VsdHNNYXAgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICAgIEFycmF5LmZyb20oYXJlYVRvS2V5TWFwLmVudHJpZXMoKSkubWFwKGFzeW5jIChbZHJpdmVyQXJlYSwga2V5czJdKSA9PiB7XG4gICAgICAgICAgY29uc3QgZHJpdmVyUmVzdWx0cyA9IGF3YWl0IGRyaXZlcnNbZHJpdmVyQXJlYV0uZ2V0SXRlbXMoa2V5czIpO1xuICAgICAgICAgIGRyaXZlclJlc3VsdHMuZm9yRWFjaCgoZHJpdmVyUmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBgJHtkcml2ZXJBcmVhfToke2RyaXZlclJlc3VsdC5rZXl9YDtcbiAgICAgICAgICAgIGNvbnN0IG9wdHMgPSBrZXlUb09wdHNNYXAuZ2V0KGtleSk7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGdldFZhbHVlT3JGYWxsYmFjayhcbiAgICAgICAgICAgICAgZHJpdmVyUmVzdWx0LnZhbHVlLFxuICAgICAgICAgICAgICBvcHRzPy5mYWxsYmFjayA/PyBvcHRzPy5kZWZhdWx0VmFsdWVcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXN1bHRzTWFwLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgICByZXR1cm4gb3JkZXJlZEtleXMubWFwKChrZXkpID0+ICh7XG4gICAgICAgIGtleSxcbiAgICAgICAgdmFsdWU6IHJlc3VsdHNNYXAuZ2V0KGtleSlcbiAgICAgIH0pKTtcbiAgICB9LFxuICAgIGdldE1ldGE6IGFzeW5jIChrZXkpID0+IHtcbiAgICAgIGNvbnN0IHsgZHJpdmVyLCBkcml2ZXJLZXkgfSA9IHJlc29sdmVLZXkoa2V5KTtcbiAgICAgIHJldHVybiBhd2FpdCBnZXRNZXRhKGRyaXZlciwgZHJpdmVyS2V5KTtcbiAgICB9LFxuICAgIGdldE1ldGFzOiBhc3luYyAoYXJncykgPT4ge1xuICAgICAgY29uc3Qga2V5cyA9IGFyZ3MubWFwKChhcmcpID0+IHtcbiAgICAgICAgY29uc3Qga2V5ID0gdHlwZW9mIGFyZyA9PT0gXCJzdHJpbmdcIiA/IGFyZyA6IGFyZy5rZXk7XG4gICAgICAgIGNvbnN0IHsgZHJpdmVyQXJlYSwgZHJpdmVyS2V5IH0gPSByZXNvbHZlS2V5KGtleSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAga2V5LFxuICAgICAgICAgIGRyaXZlckFyZWEsXG4gICAgICAgICAgZHJpdmVyS2V5LFxuICAgICAgICAgIGRyaXZlck1ldGFLZXk6IGdldE1ldGFLZXkoZHJpdmVyS2V5KVxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgICBjb25zdCBhcmVhVG9Ecml2ZXJNZXRhS2V5c01hcCA9IGtleXMucmVkdWNlKChtYXAsIGtleSkgPT4ge1xuICAgICAgICBtYXBba2V5LmRyaXZlckFyZWFdID8/PSBbXTtcbiAgICAgICAgbWFwW2tleS5kcml2ZXJBcmVhXS5wdXNoKGtleSk7XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgICB9LCB7fSk7XG4gICAgICBjb25zdCByZXN1bHRzTWFwID0ge307XG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgICAgT2JqZWN0LmVudHJpZXMoYXJlYVRvRHJpdmVyTWV0YUtleXNNYXApLm1hcChhc3luYyAoW2FyZWEsIGtleXMyXSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGFyZWFSZXMgPSBhd2FpdCBicm93c2VyLnN0b3JhZ2VbYXJlYV0uZ2V0KFxuICAgICAgICAgICAga2V5czIubWFwKChrZXkpID0+IGtleS5kcml2ZXJNZXRhS2V5KVxuICAgICAgICAgICk7XG4gICAgICAgICAga2V5czIuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICByZXN1bHRzTWFwW2tleS5rZXldID0gYXJlYVJlc1trZXkuZHJpdmVyTWV0YUtleV0gPz8ge307XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgICAgcmV0dXJuIGtleXMubWFwKChrZXkpID0+ICh7XG4gICAgICAgIGtleToga2V5LmtleSxcbiAgICAgICAgbWV0YTogcmVzdWx0c01hcFtrZXkua2V5XVxuICAgICAgfSkpO1xuICAgIH0sXG4gICAgc2V0SXRlbTogYXN5bmMgKGtleSwgdmFsdWUpID0+IHtcbiAgICAgIGNvbnN0IHsgZHJpdmVyLCBkcml2ZXJLZXkgfSA9IHJlc29sdmVLZXkoa2V5KTtcbiAgICAgIGF3YWl0IHNldEl0ZW0oZHJpdmVyLCBkcml2ZXJLZXksIHZhbHVlKTtcbiAgICB9LFxuICAgIHNldEl0ZW1zOiBhc3luYyAoaXRlbXMpID0+IHtcbiAgICAgIGNvbnN0IGFyZWFUb0tleVZhbHVlTWFwID0ge307XG4gICAgICBpdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgZHJpdmVyQXJlYSwgZHJpdmVyS2V5IH0gPSByZXNvbHZlS2V5KFxuICAgICAgICAgIFwia2V5XCIgaW4gaXRlbSA/IGl0ZW0ua2V5IDogaXRlbS5pdGVtLmtleVxuICAgICAgICApO1xuICAgICAgICBhcmVhVG9LZXlWYWx1ZU1hcFtkcml2ZXJBcmVhXSA/Pz0gW107XG4gICAgICAgIGFyZWFUb0tleVZhbHVlTWFwW2RyaXZlckFyZWFdLnB1c2goe1xuICAgICAgICAgIGtleTogZHJpdmVyS2V5LFxuICAgICAgICAgIHZhbHVlOiBpdGVtLnZhbHVlXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgICAgT2JqZWN0LmVudHJpZXMoYXJlYVRvS2V5VmFsdWVNYXApLm1hcChhc3luYyAoW2RyaXZlckFyZWEsIHZhbHVlc10pID0+IHtcbiAgICAgICAgICBjb25zdCBkcml2ZXIgPSBnZXREcml2ZXIoZHJpdmVyQXJlYSk7XG4gICAgICAgICAgYXdhaXQgZHJpdmVyLnNldEl0ZW1zKHZhbHVlcyk7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH0sXG4gICAgc2V0TWV0YTogYXN5bmMgKGtleSwgcHJvcGVydGllcykgPT4ge1xuICAgICAgY29uc3QgeyBkcml2ZXIsIGRyaXZlcktleSB9ID0gcmVzb2x2ZUtleShrZXkpO1xuICAgICAgYXdhaXQgc2V0TWV0YShkcml2ZXIsIGRyaXZlcktleSwgcHJvcGVydGllcyk7XG4gICAgfSxcbiAgICBzZXRNZXRhczogYXN5bmMgKGl0ZW1zKSA9PiB7XG4gICAgICBjb25zdCBhcmVhVG9NZXRhVXBkYXRlc01hcCA9IHt9O1xuICAgICAgaXRlbXMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICBjb25zdCB7IGRyaXZlckFyZWEsIGRyaXZlcktleSB9ID0gcmVzb2x2ZUtleShcbiAgICAgICAgICBcImtleVwiIGluIGl0ZW0gPyBpdGVtLmtleSA6IGl0ZW0uaXRlbS5rZXlcbiAgICAgICAgKTtcbiAgICAgICAgYXJlYVRvTWV0YVVwZGF0ZXNNYXBbZHJpdmVyQXJlYV0gPz89IFtdO1xuICAgICAgICBhcmVhVG9NZXRhVXBkYXRlc01hcFtkcml2ZXJBcmVhXS5wdXNoKHtcbiAgICAgICAgICBrZXk6IGRyaXZlcktleSxcbiAgICAgICAgICBwcm9wZXJ0aWVzOiBpdGVtLm1ldGFcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKFxuICAgICAgICBPYmplY3QuZW50cmllcyhhcmVhVG9NZXRhVXBkYXRlc01hcCkubWFwKFxuICAgICAgICAgIGFzeW5jIChbc3RvcmFnZUFyZWEsIHVwZGF0ZXNdKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkcml2ZXIgPSBnZXREcml2ZXIoc3RvcmFnZUFyZWEpO1xuICAgICAgICAgICAgY29uc3QgbWV0YUtleXMgPSB1cGRhdGVzLm1hcCgoeyBrZXkgfSkgPT4gZ2V0TWV0YUtleShrZXkpKTtcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nTWV0YXMgPSBhd2FpdCBkcml2ZXIuZ2V0SXRlbXMobWV0YUtleXMpO1xuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdNZXRhTWFwID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICAgICAgICBleGlzdGluZ01ldGFzLm1hcCgoeyBrZXksIHZhbHVlIH0pID0+IFtrZXksIGdldE1ldGFWYWx1ZSh2YWx1ZSldKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnN0IG1ldGFVcGRhdGVzID0gdXBkYXRlcy5tYXAoKHsga2V5LCBwcm9wZXJ0aWVzIH0pID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgbWV0YUtleSA9IGdldE1ldGFLZXkoa2V5KTtcbiAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBrZXk6IG1ldGFLZXksXG4gICAgICAgICAgICAgICAgdmFsdWU6IG1lcmdlTWV0YShleGlzdGluZ01ldGFNYXBbbWV0YUtleV0gPz8ge30sIHByb3BlcnRpZXMpXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGF3YWl0IGRyaXZlci5zZXRJdGVtcyhtZXRhVXBkYXRlcyk7XG4gICAgICAgICAgfVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0sXG4gICAgcmVtb3ZlSXRlbTogYXN5bmMgKGtleSwgb3B0cykgPT4ge1xuICAgICAgY29uc3QgeyBkcml2ZXIsIGRyaXZlcktleSB9ID0gcmVzb2x2ZUtleShrZXkpO1xuICAgICAgYXdhaXQgcmVtb3ZlSXRlbShkcml2ZXIsIGRyaXZlcktleSwgb3B0cyk7XG4gICAgfSxcbiAgICByZW1vdmVJdGVtczogYXN5bmMgKGtleXMpID0+IHtcbiAgICAgIGNvbnN0IGFyZWFUb0tleXNNYXAgPSB7fTtcbiAgICAgIGtleXMuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgIGxldCBrZXlTdHI7XG4gICAgICAgIGxldCBvcHRzO1xuICAgICAgICBpZiAodHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgIGtleVN0ciA9IGtleTtcbiAgICAgICAgfSBlbHNlIGlmIChcImdldFZhbHVlXCIgaW4ga2V5KSB7XG4gICAgICAgICAga2V5U3RyID0ga2V5LmtleTtcbiAgICAgICAgfSBlbHNlIGlmIChcIml0ZW1cIiBpbiBrZXkpIHtcbiAgICAgICAgICBrZXlTdHIgPSBrZXkuaXRlbS5rZXk7XG4gICAgICAgICAgb3B0cyA9IGtleS5vcHRpb25zO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGtleVN0ciA9IGtleS5rZXk7XG4gICAgICAgICAgb3B0cyA9IGtleS5vcHRpb25zO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHsgZHJpdmVyQXJlYSwgZHJpdmVyS2V5IH0gPSByZXNvbHZlS2V5KGtleVN0cik7XG4gICAgICAgIGFyZWFUb0tleXNNYXBbZHJpdmVyQXJlYV0gPz89IFtdO1xuICAgICAgICBhcmVhVG9LZXlzTWFwW2RyaXZlckFyZWFdLnB1c2goZHJpdmVyS2V5KTtcbiAgICAgICAgaWYgKG9wdHM/LnJlbW92ZU1ldGEpIHtcbiAgICAgICAgICBhcmVhVG9LZXlzTWFwW2RyaXZlckFyZWFdLnB1c2goZ2V0TWV0YUtleShkcml2ZXJLZXkpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgICAgT2JqZWN0LmVudHJpZXMoYXJlYVRvS2V5c01hcCkubWFwKGFzeW5jIChbZHJpdmVyQXJlYSwga2V5czJdKSA9PiB7XG4gICAgICAgICAgY29uc3QgZHJpdmVyID0gZ2V0RHJpdmVyKGRyaXZlckFyZWEpO1xuICAgICAgICAgIGF3YWl0IGRyaXZlci5yZW1vdmVJdGVtcyhrZXlzMik7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH0sXG4gICAgY2xlYXI6IGFzeW5jIChiYXNlKSA9PiB7XG4gICAgICBjb25zdCBkcml2ZXIgPSBnZXREcml2ZXIoYmFzZSk7XG4gICAgICBhd2FpdCBkcml2ZXIuY2xlYXIoKTtcbiAgICB9LFxuICAgIHJlbW92ZU1ldGE6IGFzeW5jIChrZXksIHByb3BlcnRpZXMpID0+IHtcbiAgICAgIGNvbnN0IHsgZHJpdmVyLCBkcml2ZXJLZXkgfSA9IHJlc29sdmVLZXkoa2V5KTtcbiAgICAgIGF3YWl0IHJlbW92ZU1ldGEoZHJpdmVyLCBkcml2ZXJLZXksIHByb3BlcnRpZXMpO1xuICAgIH0sXG4gICAgc25hcHNob3Q6IGFzeW5jIChiYXNlLCBvcHRzKSA9PiB7XG4gICAgICBjb25zdCBkcml2ZXIgPSBnZXREcml2ZXIoYmFzZSk7XG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgZHJpdmVyLnNuYXBzaG90KCk7XG4gICAgICBvcHRzPy5leGNsdWRlS2V5cz8uZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgIGRlbGV0ZSBkYXRhW2tleV07XG4gICAgICAgIGRlbGV0ZSBkYXRhW2dldE1ldGFLZXkoa2V5KV07XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sXG4gICAgcmVzdG9yZVNuYXBzaG90OiBhc3luYyAoYmFzZSwgZGF0YSkgPT4ge1xuICAgICAgY29uc3QgZHJpdmVyID0gZ2V0RHJpdmVyKGJhc2UpO1xuICAgICAgYXdhaXQgZHJpdmVyLnJlc3RvcmVTbmFwc2hvdChkYXRhKTtcbiAgICB9LFxuICAgIHdhdGNoOiAoa2V5LCBjYikgPT4ge1xuICAgICAgY29uc3QgeyBkcml2ZXIsIGRyaXZlcktleSB9ID0gcmVzb2x2ZUtleShrZXkpO1xuICAgICAgcmV0dXJuIHdhdGNoKGRyaXZlciwgZHJpdmVyS2V5LCBjYik7XG4gICAgfSxcbiAgICB1bndhdGNoKCkge1xuICAgICAgT2JqZWN0LnZhbHVlcyhkcml2ZXJzKS5mb3JFYWNoKChkcml2ZXIpID0+IHtcbiAgICAgICAgZHJpdmVyLnVud2F0Y2goKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZGVmaW5lSXRlbTogKGtleSwgb3B0cykgPT4ge1xuICAgICAgY29uc3QgeyBkcml2ZXIsIGRyaXZlcktleSB9ID0gcmVzb2x2ZUtleShrZXkpO1xuICAgICAgY29uc3Qge1xuICAgICAgICB2ZXJzaW9uOiB0YXJnZXRWZXJzaW9uID0gMSxcbiAgICAgICAgbWlncmF0aW9ucyA9IHt9LFxuICAgICAgICBvbk1pZ3JhdGlvbkNvbXBsZXRlLFxuICAgICAgICBkZWJ1ZyA9IGZhbHNlXG4gICAgICB9ID0gb3B0cyA/PyB7fTtcbiAgICAgIGlmICh0YXJnZXRWZXJzaW9uIDwgMSkge1xuICAgICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgICBcIlN0b3JhZ2UgaXRlbSB2ZXJzaW9uIGNhbm5vdCBiZSBsZXNzIHRoYW4gMS4gSW5pdGlhbCB2ZXJzaW9ucyBzaG91bGQgYmUgc2V0IHRvIDEsIG5vdCAwLlwiXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBjb25zdCBtaWdyYXRlID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBkcml2ZXJNZXRhS2V5ID0gZ2V0TWV0YUtleShkcml2ZXJLZXkpO1xuICAgICAgICBjb25zdCBbeyB2YWx1ZSB9LCB7IHZhbHVlOiBtZXRhIH1dID0gYXdhaXQgZHJpdmVyLmdldEl0ZW1zKFtcbiAgICAgICAgICBkcml2ZXJLZXksXG4gICAgICAgICAgZHJpdmVyTWV0YUtleVxuICAgICAgICBdKTtcbiAgICAgICAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybjtcbiAgICAgICAgY29uc3QgY3VycmVudFZlcnNpb24gPSBtZXRhPy52ID8/IDE7XG4gICAgICAgIGlmIChjdXJyZW50VmVyc2lvbiA+IHRhcmdldFZlcnNpb24pIHtcbiAgICAgICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgICAgIGBWZXJzaW9uIGRvd25ncmFkZSBkZXRlY3RlZCAodiR7Y3VycmVudFZlcnNpb259IC0+IHYke3RhcmdldFZlcnNpb259KSBmb3IgXCIke2tleX1cImBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjdXJyZW50VmVyc2lvbiA9PT0gdGFyZ2V0VmVyc2lvbikge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVidWcgPT09IHRydWUpIHtcbiAgICAgICAgICBjb25zb2xlLmRlYnVnKFxuICAgICAgICAgICAgYFtAd3h0LWRldi9zdG9yYWdlXSBSdW5uaW5nIHN0b3JhZ2UgbWlncmF0aW9uIGZvciAke2tleX06IHYke2N1cnJlbnRWZXJzaW9ufSAtPiB2JHt0YXJnZXRWZXJzaW9ufWBcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1pZ3JhdGlvbnNUb1J1biA9IEFycmF5LmZyb20oXG4gICAgICAgICAgeyBsZW5ndGg6IHRhcmdldFZlcnNpb24gLSBjdXJyZW50VmVyc2lvbiB9LFxuICAgICAgICAgIChfLCBpKSA9PiBjdXJyZW50VmVyc2lvbiArIGkgKyAxXG4gICAgICAgICk7XG4gICAgICAgIGxldCBtaWdyYXRlZFZhbHVlID0gdmFsdWU7XG4gICAgICAgIGZvciAoY29uc3QgbWlncmF0ZVRvVmVyc2lvbiBvZiBtaWdyYXRpb25zVG9SdW4pIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgbWlncmF0ZWRWYWx1ZSA9IGF3YWl0IG1pZ3JhdGlvbnM/LlttaWdyYXRlVG9WZXJzaW9uXT8uKG1pZ3JhdGVkVmFsdWUpID8/IG1pZ3JhdGVkVmFsdWU7XG4gICAgICAgICAgICBpZiAoZGVidWcgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhcbiAgICAgICAgICAgICAgICBgW0B3eHQtZGV2L3N0b3JhZ2VdIFN0b3JhZ2UgbWlncmF0aW9uIHByb2Nlc3NlZCBmb3IgdmVyc2lvbjogdiR7bWlncmF0ZVRvVmVyc2lvbn1gXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgTWlncmF0aW9uRXJyb3Ioa2V5LCBtaWdyYXRlVG9WZXJzaW9uLCB7XG4gICAgICAgICAgICAgIGNhdXNlOiBlcnJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBhd2FpdCBkcml2ZXIuc2V0SXRlbXMoW1xuICAgICAgICAgIHsga2V5OiBkcml2ZXJLZXksIHZhbHVlOiBtaWdyYXRlZFZhbHVlIH0sXG4gICAgICAgICAgeyBrZXk6IGRyaXZlck1ldGFLZXksIHZhbHVlOiB7IC4uLm1ldGEsIHY6IHRhcmdldFZlcnNpb24gfSB9XG4gICAgICAgIF0pO1xuICAgICAgICBpZiAoZGVidWcgPT09IHRydWUpIHtcbiAgICAgICAgICBjb25zb2xlLmRlYnVnKFxuICAgICAgICAgICAgYFtAd3h0LWRldi9zdG9yYWdlXSBTdG9yYWdlIG1pZ3JhdGlvbiBjb21wbGV0ZWQgZm9yICR7a2V5fSB2JHt0YXJnZXRWZXJzaW9ufWAsXG4gICAgICAgICAgICB7IG1pZ3JhdGVkVmFsdWUgfVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgb25NaWdyYXRpb25Db21wbGV0ZT8uKG1pZ3JhdGVkVmFsdWUsIHRhcmdldFZlcnNpb24pO1xuICAgICAgfTtcbiAgICAgIGNvbnN0IG1pZ3JhdGlvbnNEb25lID0gb3B0cz8ubWlncmF0aW9ucyA9PSBudWxsID8gUHJvbWlzZS5yZXNvbHZlKCkgOiBtaWdyYXRlKCkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAgIGBbQHd4dC1kZXYvc3RvcmFnZV0gTWlncmF0aW9uIGZhaWxlZCBmb3IgJHtrZXl9YCxcbiAgICAgICAgICBlcnJcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgICAgY29uc3QgaW5pdE11dGV4ID0gbmV3IE11dGV4KCk7XG4gICAgICBjb25zdCBnZXRGYWxsYmFjayA9ICgpID0+IG9wdHM/LmZhbGxiYWNrID8/IG9wdHM/LmRlZmF1bHRWYWx1ZSA/PyBudWxsO1xuICAgICAgY29uc3QgZ2V0T3JJbml0VmFsdWUgPSAoKSA9PiBpbml0TXV0ZXgucnVuRXhjbHVzaXZlKGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBhd2FpdCBkcml2ZXIuZ2V0SXRlbShkcml2ZXJLZXkpO1xuICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCB8fCBvcHRzPy5pbml0ID09IG51bGwpIHJldHVybiB2YWx1ZTtcbiAgICAgICAgY29uc3QgbmV3VmFsdWUgPSBhd2FpdCBvcHRzLmluaXQoKTtcbiAgICAgICAgYXdhaXQgZHJpdmVyLnNldEl0ZW0oZHJpdmVyS2V5LCBuZXdWYWx1ZSk7XG4gICAgICAgIHJldHVybiBuZXdWYWx1ZTtcbiAgICAgIH0pO1xuICAgICAgbWlncmF0aW9uc0RvbmUudGhlbihnZXRPckluaXRWYWx1ZSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBrZXksXG4gICAgICAgIGdldCBkZWZhdWx0VmFsdWUoKSB7XG4gICAgICAgICAgcmV0dXJuIGdldEZhbGxiYWNrKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldCBmYWxsYmFjaygpIHtcbiAgICAgICAgICByZXR1cm4gZ2V0RmFsbGJhY2soKTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0VmFsdWU6IGFzeW5jICgpID0+IHtcbiAgICAgICAgICBhd2FpdCBtaWdyYXRpb25zRG9uZTtcbiAgICAgICAgICBpZiAob3B0cz8uaW5pdCkge1xuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IGdldE9ySW5pdFZhbHVlKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBnZXRJdGVtKGRyaXZlciwgZHJpdmVyS2V5LCBvcHRzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGdldE1ldGE6IGFzeW5jICgpID0+IHtcbiAgICAgICAgICBhd2FpdCBtaWdyYXRpb25zRG9uZTtcbiAgICAgICAgICByZXR1cm4gYXdhaXQgZ2V0TWV0YShkcml2ZXIsIGRyaXZlcktleSk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldFZhbHVlOiBhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICBhd2FpdCBtaWdyYXRpb25zRG9uZTtcbiAgICAgICAgICByZXR1cm4gYXdhaXQgc2V0SXRlbShkcml2ZXIsIGRyaXZlcktleSwgdmFsdWUpO1xuICAgICAgICB9LFxuICAgICAgICBzZXRNZXRhOiBhc3luYyAocHJvcGVydGllcykgPT4ge1xuICAgICAgICAgIGF3YWl0IG1pZ3JhdGlvbnNEb25lO1xuICAgICAgICAgIHJldHVybiBhd2FpdCBzZXRNZXRhKGRyaXZlciwgZHJpdmVyS2V5LCBwcm9wZXJ0aWVzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlVmFsdWU6IGFzeW5jIChvcHRzMikgPT4ge1xuICAgICAgICAgIGF3YWl0IG1pZ3JhdGlvbnNEb25lO1xuICAgICAgICAgIHJldHVybiBhd2FpdCByZW1vdmVJdGVtKGRyaXZlciwgZHJpdmVyS2V5LCBvcHRzMik7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZU1ldGE6IGFzeW5jIChwcm9wZXJ0aWVzKSA9PiB7XG4gICAgICAgICAgYXdhaXQgbWlncmF0aW9uc0RvbmU7XG4gICAgICAgICAgcmV0dXJuIGF3YWl0IHJlbW92ZU1ldGEoZHJpdmVyLCBkcml2ZXJLZXksIHByb3BlcnRpZXMpO1xuICAgICAgICB9LFxuICAgICAgICB3YXRjaDogKGNiKSA9PiB3YXRjaChcbiAgICAgICAgICBkcml2ZXIsXG4gICAgICAgICAgZHJpdmVyS2V5LFxuICAgICAgICAgIChuZXdWYWx1ZSwgb2xkVmFsdWUpID0+IGNiKG5ld1ZhbHVlID8/IGdldEZhbGxiYWNrKCksIG9sZFZhbHVlID8/IGdldEZhbGxiYWNrKCkpXG4gICAgICAgICksXG4gICAgICAgIG1pZ3JhdGVcbiAgICAgIH07XG4gICAgfVxuICB9O1xuICByZXR1cm4gc3RvcmFnZTI7XG59XG5mdW5jdGlvbiBjcmVhdGVEcml2ZXIoc3RvcmFnZUFyZWEpIHtcbiAgY29uc3QgZ2V0U3RvcmFnZUFyZWEgPSAoKSA9PiB7XG4gICAgaWYgKGJyb3dzZXIucnVudGltZSA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgW1xuICAgICAgICAgIFwiJ3d4dC9zdG9yYWdlJyBtdXN0IGJlIGxvYWRlZCBpbiBhIHdlYiBleHRlbnNpb24gZW52aXJvbm1lbnRcIixcbiAgICAgICAgICBcIlxcbiAtIElmIHRocm93biBkdXJpbmcgYSBidWlsZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS93eHQtZGV2L3d4dC9pc3N1ZXMvMzcxXCIsXG4gICAgICAgICAgXCIgLSBJZiB0aHJvd24gZHVyaW5nIHRlc3RzLCBtb2NrICd3eHQvYnJvd3NlcicgY29ycmVjdGx5LiBTZWUgaHR0cHM6Ly93eHQuZGV2L2d1aWRlL2dvLWZ1cnRoZXIvdGVzdGluZy5odG1sXFxuXCJcbiAgICAgICAgXS5qb2luKFwiXFxuXCIpXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoYnJvd3Nlci5zdG9yYWdlID09IG51bGwpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICBcIllvdSBtdXN0IGFkZCB0aGUgJ3N0b3JhZ2UnIHBlcm1pc3Npb24gdG8geW91ciBtYW5pZmVzdCB0byB1c2UgJ3d4dC9zdG9yYWdlJ1wiXG4gICAgICApO1xuICAgIH1cbiAgICBjb25zdCBhcmVhID0gYnJvd3Nlci5zdG9yYWdlW3N0b3JhZ2VBcmVhXTtcbiAgICBpZiAoYXJlYSA9PSBudWxsKVxuICAgICAgdGhyb3cgRXJyb3IoYFwiYnJvd3Nlci5zdG9yYWdlLiR7c3RvcmFnZUFyZWF9XCIgaXMgdW5kZWZpbmVkYCk7XG4gICAgcmV0dXJuIGFyZWE7XG4gIH07XG4gIGNvbnN0IHdhdGNoTGlzdGVuZXJzID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTtcbiAgcmV0dXJuIHtcbiAgICBnZXRJdGVtOiBhc3luYyAoa2V5KSA9PiB7XG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBnZXRTdG9yYWdlQXJlYSgpLmdldChrZXkpO1xuICAgICAgcmV0dXJuIHJlc1trZXldO1xuICAgIH0sXG4gICAgZ2V0SXRlbXM6IGFzeW5jIChrZXlzKSA9PiB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBnZXRTdG9yYWdlQXJlYSgpLmdldChrZXlzKTtcbiAgICAgIHJldHVybiBrZXlzLm1hcCgoa2V5KSA9PiAoeyBrZXksIHZhbHVlOiByZXN1bHRba2V5XSA/PyBudWxsIH0pKTtcbiAgICB9LFxuICAgIHNldEl0ZW06IGFzeW5jIChrZXksIHZhbHVlKSA9PiB7XG4gICAgICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgICAgICBhd2FpdCBnZXRTdG9yYWdlQXJlYSgpLnJlbW92ZShrZXkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXdhaXQgZ2V0U3RvcmFnZUFyZWEoKS5zZXQoeyBba2V5XTogdmFsdWUgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzZXRJdGVtczogYXN5bmMgKHZhbHVlcykgPT4ge1xuICAgICAgY29uc3QgbWFwID0gdmFsdWVzLnJlZHVjZShcbiAgICAgICAgKG1hcDIsIHsga2V5LCB2YWx1ZSB9KSA9PiB7XG4gICAgICAgICAgbWFwMltrZXldID0gdmFsdWU7XG4gICAgICAgICAgcmV0dXJuIG1hcDI7XG4gICAgICAgIH0sXG4gICAgICAgIHt9XG4gICAgICApO1xuICAgICAgYXdhaXQgZ2V0U3RvcmFnZUFyZWEoKS5zZXQobWFwKTtcbiAgICB9LFxuICAgIHJlbW92ZUl0ZW06IGFzeW5jIChrZXkpID0+IHtcbiAgICAgIGF3YWl0IGdldFN0b3JhZ2VBcmVhKCkucmVtb3ZlKGtleSk7XG4gICAgfSxcbiAgICByZW1vdmVJdGVtczogYXN5bmMgKGtleXMpID0+IHtcbiAgICAgIGF3YWl0IGdldFN0b3JhZ2VBcmVhKCkucmVtb3ZlKGtleXMpO1xuICAgIH0sXG4gICAgY2xlYXI6IGFzeW5jICgpID0+IHtcbiAgICAgIGF3YWl0IGdldFN0b3JhZ2VBcmVhKCkuY2xlYXIoKTtcbiAgICB9LFxuICAgIHNuYXBzaG90OiBhc3luYyAoKSA9PiB7XG4gICAgICByZXR1cm4gYXdhaXQgZ2V0U3RvcmFnZUFyZWEoKS5nZXQoKTtcbiAgICB9LFxuICAgIHJlc3RvcmVTbmFwc2hvdDogYXN5bmMgKGRhdGEpID0+IHtcbiAgICAgIGF3YWl0IGdldFN0b3JhZ2VBcmVhKCkuc2V0KGRhdGEpO1xuICAgIH0sXG4gICAgd2F0Y2goa2V5LCBjYikge1xuICAgICAgY29uc3QgbGlzdGVuZXIgPSAoY2hhbmdlcykgPT4ge1xuICAgICAgICBjb25zdCBjaGFuZ2UgPSBjaGFuZ2VzW2tleV07XG4gICAgICAgIGlmIChjaGFuZ2UgPT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICBpZiAoZGVxdWFsKGNoYW5nZS5uZXdWYWx1ZSwgY2hhbmdlLm9sZFZhbHVlKSkgcmV0dXJuO1xuICAgICAgICBjYihjaGFuZ2UubmV3VmFsdWUgPz8gbnVsbCwgY2hhbmdlLm9sZFZhbHVlID8/IG51bGwpO1xuICAgICAgfTtcbiAgICAgIGdldFN0b3JhZ2VBcmVhKCkub25DaGFuZ2VkLmFkZExpc3RlbmVyKGxpc3RlbmVyKTtcbiAgICAgIHdhdGNoTGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBnZXRTdG9yYWdlQXJlYSgpLm9uQ2hhbmdlZC5yZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICAgIHdhdGNoTGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgICB9O1xuICAgIH0sXG4gICAgdW53YXRjaCgpIHtcbiAgICAgIHdhdGNoTGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiB7XG4gICAgICAgIGdldFN0b3JhZ2VBcmVhKCkub25DaGFuZ2VkLnJlbW92ZUxpc3RlbmVyKGxpc3RlbmVyKTtcbiAgICAgIH0pO1xuICAgICAgd2F0Y2hMaXN0ZW5lcnMuY2xlYXIoKTtcbiAgICB9XG4gIH07XG59XG5jbGFzcyBNaWdyYXRpb25FcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3Ioa2V5LCB2ZXJzaW9uLCBvcHRpb25zKSB7XG4gICAgc3VwZXIoYHYke3ZlcnNpb259IG1pZ3JhdGlvbiBmYWlsZWQgZm9yIFwiJHtrZXl9XCJgLCBvcHRpb25zKTtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLnZlcnNpb24gPSB2ZXJzaW9uO1xuICB9XG59XG5cbmV4cG9ydCB7IE1pZ3JhdGlvbkVycm9yLCBzdG9yYWdlIH07XG4iLCJpbXBvcnQgdHlwZSB7IFNvdXJjZUFkYXB0ZXJLZXkgfSBmcm9tIFwiQC9saWIvYWRhcHRlcnNcIjtcblxuZXhwb3J0IHR5cGUgU3RvcmFnZUtleSA9XG4gIHwgYGxvY2FsOiR7c3RyaW5nfWBcbiAgfCBgc3luYzoke3N0cmluZ31gXG4gIHwgYHNlc3Npb246JHtzdHJpbmd9YFxuICB8IGBtYW5hZ2VkOiR7c3RyaW5nfWA7XG4gIFxuLyoqXG4gKiBNb2RlIHNlbGVjdGlvbiBmb3Igd2hhdCBkYXRhIGlzIGNvbGxlY3RlZC9zdG9yZWQuXG4gKiAtIE1pbmltYWw6IG9ubHkgaGFzaCwgc291cmNlLCBkYXRlXG4gKiAtIEZ1bGw6IGZ1bGwgdG9ycmVudCBtZXRhZGF0YSBpZiBhdmFpbGFibGVcbiAqL1xuXG5leHBvcnQgZW51bSBDb2xsZWN0aW9uTW9kZSB7XG4gIE1pbmltYWwgPSBcIm1pbmltYWxcIixcbiAgTWluaW1hbFdpdGhOYW1lID0gXCJtaW5pbWFsX3dpdGhfbmFtZVwiLFxuICBGdWxsID0gXCJmdWxsXCIsXG59XG5cbi8qKlxuICogUmF3IGRhdGEgZGlyZWN0bHkgc2NyYXBlZCBmcm9tIHByb3ZpZGVyIHBhZ2VzLlxuICogVGhpcyBpcyBtZXNzeS91bnN0cnVjdHVyZWQgYW5kIG5lZWRzIG5vcm1hbGl6YXRpb24uXG4gKi9cbmV4cG9ydCB0eXBlIFJhd01hZ25ldExpbmtEYXRhID0ge1xuICBtYWduZXRMaW5rOiBzdHJpbmc7XG4gIG5hbWU/OiBzdHJpbmc7XG4gIHNpemU/OiBzdHJpbmc7IC8vIGUuZy4gXCIxLjQgR0JcIlxuICBzZWVkcz86IHN0cmluZzsgLy8gbnVtZXJpYyBzdHJpbmcgXCIxMjM0XCJcbiAgbGVlY2hlcnM/OiBzdHJpbmc7XG4gIGNhdGVnb3J5Pzogc3RyaW5nO1xuICBzb3VyY2U6IHN0cmluZzsgLy8gcHJvdmlkZXIgbmFtZS9kb21haW5cbiAgc2NyYXBlZEF0OiBzdHJpbmc7IC8vIElTTyB0aW1lc3RhbXBcbn07XG5cbi8qKlxuICogQ29yZSByZXF1aXJlZCBmaWVsZHMgZm9yIGFueSByZWNvcmQgKG1pbmltYWwgbW9kZSkuXG4gKi9cbmV4cG9ydCB0eXBlIE1pbmltYWxNYWduZXRSZWNvcmQgPSB7XG4gIGluZm9IYXNoOiBzdHJpbmc7IC8vIGNhbm9uaWNhbCB0b3JyZW50IElEXG4gIHNvdXJjZTogc3RyaW5nO1xuICBzY3JhcGVkQXQ6IHN0cmluZzsgLy8gSVNPIHRpbWVzdGFtcFxufTtcblxuLyoqXG4gKiBGdWxsIHJlY29yZCBleHRlbmRzIG1pbmltYWwgd2l0aCBvcHRpb25hbCBtZXRhZGF0YS5cbiAqIElmIG1vZGUgaXMgbWluaW1hbCAtPiBvbmx5IGluZm9IYXNoLCBzb3VyY2UsIHNjcmFwZWRBdCBhcmUgcG9wdWxhdGVkLlxuICogSWYgbW9kZSBpcyBmdWxsIC0+IGV4dHJhIGZpZWxkcyBhcmUgZmlsbGVkIHdoZW4gYXZhaWxhYmxlLlxuICovXG5leHBvcnQgdHlwZSBNYWduZXRSZWNvcmQgPSBNaW5pbWFsTWFnbmV0UmVjb3JkICYge1xuICBtYWduZXRMaW5rPzogc3RyaW5nO1xuICBuYW1lPzogc3RyaW5nIHwgbnVsbDtcbiAgc2l6ZUJ5dGVzPzogbnVtYmVyIHwgbnVsbDtcbiAgc2VlZHM/OiBudW1iZXIgfCBudWxsO1xuICBsZWVjaGVycz86IG51bWJlciB8IG51bGw7XG4gIGNhdGVnb3J5Pzogc3RyaW5nIHwgbnVsbDtcbn07XG5cbi8qKlxuICogU3RvcmFnZSBwYXlsb2FkOiBzaW5jZSBsb2NhbFN0b3JhZ2Ugb25seSBzYXZlcyBzdHJpbmdzLFxuICogeW914oCZbGwgYmUgc2VyaWFsaXppbmcgYXJyYXlzIG9mIE1hZ25ldFJlY29yZCBpbnRvIEpTT04uXG4gKi9cbmV4cG9ydCB0eXBlIFN0b3JlZE1hZ25ldHMgPSBNYWduZXRSZWNvcmRbXTtcblxuLypcbiAqIEFkYXB0ZXIgZnVuY3Rpb24gdHlwZTogdGFrZXMgRG9jdW1lbnQgYW5kIExvY2F0aW9uLCByZXR1cm5zIGFycmF5IG9mIHJhdyBtYWduZXQgZGF0YS5cbiAqL1xuZXhwb3J0IHR5cGUgU291cmNlQWRhcHRlciA9IChcbiAgZG9jdW1lbnQ6IERvY3VtZW50LFxuICBsb2NhdGlvbjogTG9jYXRpb25cbikgPT4gUmF3TWFnbmV0TGlua0RhdGFbXTtcblxuXG5leHBvcnQgdHlwZSBFeHBvcnRGb3JtYXRzID0gXCJqc29uXCIgfCBcImNzdlwiIHwgXCJ0eHRcIjtcblxuZXhwb3J0IHR5cGUgTWFnbmV0b09wdGlvbnMgPSB7XG4gIG1pbmltYWxDb2xsZWN0aW9uTW9kZTogeyBlbmFibGVkOiBib29sZWFuOyBjb2xsZWN0TmFtZXM6IGJvb2xlYW4gfTtcbiAgcm9sbGluZ0NvbGxlY3Rpb246IHsgZW5hYmxlZDogYm9vbGVhbjsgbGltaXQ6IG51bWJlciB9O1xuICBhZGFwdGVyczogUGFydGlhbDxSZWNvcmQ8U291cmNlQWRhcHRlcktleSwgYm9vbGVhbj4+O1xufTtcbiIsImltcG9ydCB0eXBlIHsgU3RvcmFnZUtleSwgTWFnbmV0b09wdGlvbnMgfSBmcm9tIFwiQC9saWIvdHlwZXNcIjtcblxuZXhwb3J0IGNvbnN0IFNUT1JBR0VfS0VZUyA9IHtcbiAgU1RBU0g6IFwibG9jYWw6bWFnbmV0by1zdGFzaFwiLFxuICBXSElURUxJU1RFRF9IT1NUUzogXCJzeW5jOm1hZ25ldG8td2hpdGVsaXN0ZWRIb3N0c1wiLFxuICBDT0xMRUNUSU9OX0VOQUJMRUQ6IFwic3luYzptYWduZXRvLWNvbGxlY3Rpb25FbmFibGVkXCIsXG4gIE9QVElPTlM6IFwic3luYzptYWduZXRvLW9wdGlvbnNcIixcbn0gYXMgY29uc3Qgc2F0aXNmaWVzIFJlY29yZDxzdHJpbmcsIFN0b3JhZ2VLZXk+O1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9PUFRJT05TOiBNYWduZXRvT3B0aW9ucyA9IHtcbiAgbWluaW1hbENvbGxlY3Rpb25Nb2RlOiB7IGVuYWJsZWQ6IGZhbHNlLCBjb2xsZWN0TmFtZXM6IGZhbHNlIH0sXG4gIHJvbGxpbmdDb2xsZWN0aW9uOiB7IGVuYWJsZWQ6IGZhbHNlLCBsaW1pdDogMTAwMCB9LFxuICBhZGFwdGVyczoge1xuICAgIFwiZXh0LnRvXCI6IHRydWUsXG4gICAgXCJrbmFiZW4ub3JnXCI6IHRydWUsXG4gIH0sXG59O1xuIiwiaW1wb3J0IHR5cGUgeyBNYWduZXRSZWNvcmQgfSBmcm9tIFwiQC9saWIvdHlwZXNcIjtcbmltcG9ydCB7IFNUT1JBR0VfS0VZUyB9IGZyb20gXCJAL2xpYi9jb25zdGFudHNcIjtcblxuaW50ZXJmYWNlIEV4cG9ydFJlc3VsdCB7XG4gIHN1Y2Nlc3M6IGJvb2xlYW47XG4gIGRvd25sb2FkSWQ/OiBudW1iZXI7XG4gIGVycm9yPzogc3RyaW5nO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlRXhwb3J0TWFnbmV0cyhmb3JtYXQ6IHN0cmluZyk6IFByb21pc2U8RXhwb3J0UmVzdWx0PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgbWFnbmV0TGlua3M6IE1hZ25ldFJlY29yZFtdID0gYXdhaXQgc3RvcmFnZS5nZXRJdGVtKFNUT1JBR0VfS0VZUy5TVEFTSCkgfHwgW107XG4gICAgXG4gICAgaWYgKCFtYWduZXRMaW5rcy5sZW5ndGgpIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogXCJObyBtYWduZXQgbGlua3MgZm91bmQgdG8gZXhwb3J0XCIgfTtcblxuICAgIGNvbnN0IHsgY29udGVudCwgbWltZVR5cGUsIGV4dCB9ID0gZm9ybWF0Q29udGVudChtYWduZXRMaW5rcywgZm9ybWF0KTtcblxuICAgIGNvbnN0IGRhdGFVcmwgPSBgZGF0YToke21pbWVUeXBlfTtjaGFyc2V0PXV0Zi04LCR7ZW5jb2RlVVJJQ29tcG9uZW50KGNvbnRlbnQpfWA7XG4gICAgXG4gICAgY29uc3QgZG93bmxvYWRJZCA9IGF3YWl0IGRvd25sb2FkRmlsZShkYXRhVXJsLCBgbWFnbmV0by1zdGFzaC0ke0RhdGUubm93KCl9LiR7ZXh0fWApO1xuICAgIFxuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRvd25sb2FkSWQgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHsgcmV0dXJuIHsgXG4gICAgICBzdWNjZXNzOiBmYWxzZSwgXG4gICAgICBlcnJvcjogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBcIkV4cG9ydCBmYWlsZWRcIiBcbiAgICB9O1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGRvd25sb2FkRmlsZSh1cmw6IHN0cmluZywgZmlsZW5hbWU6IHN0cmluZyk6IFByb21pc2U8bnVtYmVyPiB7XG4gIGlmICghYnJvd3Nlcj8uZG93bmxvYWRzKSB0aHJvdyBuZXcgRXJyb3IoXCJEb3dubG9hZHMgQVBJIG5vdCBhdmFpbGFibGVcIik7XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBicm93c2VyLmRvd25sb2Fkcy5kb3dubG9hZChcbiAgICAgIHsgXG4gICAgICAgIHVybCwgXG4gICAgICAgIGZpbGVuYW1lLCBcbiAgICAgICAgc2F2ZUFzOiB0cnVlIFxuICAgICAgfSwgXG4gICAgICAoZG93bmxvYWRJZCkgPT4ge1xuICAgICAgICBjb25zdCBlcnJvciA9IGJyb3dzZXIucnVudGltZS5sYXN0RXJyb3I7XG4gICAgICAgIFxuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICByZWplY3QobmV3IEVycm9yKGVycm9yLm1lc3NhZ2UpKTtcbiAgICAgICAgfSBlbHNlIGlmIChkb3dubG9hZElkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICByZWplY3QobmV3IEVycm9yKFwiRG93bmxvYWQgZmFpbGVkIC0gbm8gSUQgcmV0dXJuZWRcIikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoZG93bmxvYWRJZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuICB9KTtcbn1cblxudHlwZSBGb3JtYXRLZXkgPSBcImpzb25cIiB8IFwiY3N2XCIgfCBcInR4dFwiO1xuXG5mdW5jdGlvbiBmb3JtYXRDb250ZW50KGxpbmtzOiBNYWduZXRSZWNvcmRbXSwgZm9ybWF0OiBzdHJpbmcpIHtcbiAgY29uc3QgZm9ybWF0dGVyczogUmVjb3JkPEZvcm1hdEtleSwgKCkgPT4geyBjb250ZW50OiBzdHJpbmc7IG1pbWVUeXBlOiBzdHJpbmc7IGV4dDogc3RyaW5nIH0+ID0ge1xuICAgIGpzb246ICgpID0+ICh7IFxuICAgICAgY29udGVudDogSlNPTi5zdHJpbmdpZnkobGlua3MsIG51bGwsIDIpLCBcbiAgICAgIG1pbWVUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIiwgXG4gICAgICBleHQ6IFwianNvblwiIFxuICAgIH0pLFxuICAgIFxuICAgIGNzdjogKCkgPT4gKHtcbiAgICAgIGNvbnRlbnQ6IFtcbiAgICAgICAgXCJtYWduZXRMaW5rLHRpdGxlLHRpbWVzdGFtcFwiLFxuICAgICAgICAuLi5saW5rcy5tYXAobCA9PiBgXCIke2VzY2FwZShsLm1hZ25ldExpbmspfVwiLFwiJHtlc2NhcGUobC5uYW1lIHx8IFwiXCIpfVwiLFwiJHtlc2NhcGUobC5kYXRlKX1cImApXG4gICAgICBdLmpvaW4oXCJcXG5cIiksXG4gICAgICBtaW1lVHlwZTogXCJ0ZXh0L2NzdlwiLFxuICAgICAgZXh0OiBcImNzdlwiXG4gICAgfSksXG4gICAgXG4gICAgdHh0OiAoKSA9PiAoeyBcbiAgICAgIGNvbnRlbnQ6IGxpbmtzLm1hcChsID0+IGwubWFnbmV0TGluaykuam9pbihcIlxcblwiKSwgXG4gICAgICBtaW1lVHlwZTogXCJ0ZXh0L3BsYWluXCIsIFxuICAgICAgZXh0OiBcInR4dFwiIFxuICAgIH0pXG4gIH07XG5cbiAgY29uc3Qga2V5ID0gZm9ybWF0LnRvTG93ZXJDYXNlKCkgYXMgRm9ybWF0S2V5O1xuICByZXR1cm4gKGZvcm1hdHRlcnNba2V5XSA/PyBmb3JtYXR0ZXJzLnR4dCkoKTtcbn1cblxuY29uc3QgZXNjYXBlID0gKHN0cjogc3RyaW5nKSA9PiBzdHIucmVwbGFjZSgvXCIvZywgJ1wiXCInKTsiLCJpbXBvcnQgeyBTVE9SQUdFX0tFWVMsIERFRkFVTFRfT1BUSU9OUyB9IGZyb20gXCJAL2xpYi9jb25zdGFudHNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRpYWxpemVTdG9yYWdlKCkge1xuICBzdG9yYWdlLmdldEl0ZW0oU1RPUkFHRV9LRVlTLlNUQVNIKS50aGVuKChzdGFzaCkgPT4ge1xuICAgIGlmIChzdGFzaCA9PT0gbnVsbCkge1xuICAgICAgc3RvcmFnZS5zZXRJdGVtKFNUT1JBR0VfS0VZUy5TVEFTSCwgW10pO1xuICAgIH1cbiAgfSk7XG4gIHN0b3JhZ2UuZ2V0SXRlbShTVE9SQUdFX0tFWVMuV0hJVEVMSVNURURfSE9TVFMpLnRoZW4oKGhvc3RzKSA9PiB7XG4gICAgaWYgKGhvc3RzID09PSBudWxsKSB7XG4gICAgICBzdG9yYWdlLnNldEl0ZW0oU1RPUkFHRV9LRVlTLldISVRFTElTVEVEX0hPU1RTLCBbXSk7XG4gICAgfVxuICB9KTtcbiAgc3RvcmFnZS5nZXRJdGVtKFNUT1JBR0VfS0VZUy5DT0xMRUNUSU9OX0VOQUJMRUQpLnRoZW4oKGVuYWJsZWQpID0+IHtcbiAgICBpZiAoZW5hYmxlZCA9PT0gbnVsbCkge1xuICAgICAgc3RvcmFnZS5zZXRJdGVtKFNUT1JBR0VfS0VZUy5DT0xMRUNUSU9OX0VOQUJMRUQsIGZhbHNlKTtcbiAgICB9XG4gIH0pO1xuICBzdG9yYWdlLmdldEl0ZW0oU1RPUkFHRV9LRVlTLk9QVElPTlMpLnRoZW4oKHNldHRpbmdzKSA9PiB7XG4gICAgaWYgKHNldHRpbmdzID09PSBudWxsKSB7XG4gICAgICBzdG9yYWdlLnNldEl0ZW0oU1RPUkFHRV9LRVlTLk9QVElPTlMsIERFRkFVTFRfT1BUSU9OUyk7XG4gICAgfVxuICB9KTtcbn1cbiIsImltcG9ydCB7IGNsc3gsIHR5cGUgQ2xhc3NWYWx1ZSB9IGZyb20gXCJjbHN4XCI7XG5pbXBvcnQgeyB0d01lcmdlIH0gZnJvbSBcInRhaWx3aW5kLW1lcmdlXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBjbiguLi5pbnB1dHM6IENsYXNzVmFsdWVbXSkge1xuXHRyZXR1cm4gdHdNZXJnZShjbHN4KGlucHV0cykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdE5hbWVGcm9tTWFnbmV0KG1hZ25ldExpbms6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICB0cnkge1xuICAgIGNvbnN0IHVybCA9IG5ldyBVUkwobWFnbmV0TGluayk7XG4gICAgY29uc3QgZG4gPSB1cmwuc2VhcmNoUGFyYW1zLmdldChcImRuXCIpO1xuICAgIHJldHVybiBkbiA/IGRlY29kZVVSSUNvbXBvbmVudChkbi5yZXBsYWNlKC9cXCsvZywgXCIgXCIpKSA6IG51bGw7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG5leHBvcnQgdHlwZSBXaXRob3V0Q2hpbGQ8VD4gPSBUIGV4dGVuZHMgeyBjaGlsZD86IGFueSB9ID8gT21pdDxULCBcImNoaWxkXCI+IDogVDtcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG5leHBvcnQgdHlwZSBXaXRob3V0Q2hpbGRyZW48VD4gPSBUIGV4dGVuZHMgeyBjaGlsZHJlbj86IGFueSB9ID8gT21pdDxULCBcImNoaWxkcmVuXCI+IDogVDtcbmV4cG9ydCB0eXBlIFdpdGhvdXRDaGlsZHJlbk9yQ2hpbGQ8VD4gPSBXaXRob3V0Q2hpbGRyZW48V2l0aG91dENoaWxkPFQ+PjtcbmV4cG9ydCB0eXBlIFdpdGhFbGVtZW50UmVmPFQsIFUgZXh0ZW5kcyBIVE1MRWxlbWVudCA9IEhUTUxFbGVtZW50PiA9IFQgJiB7IHJlZj86IFUgfCBudWxsIH07XG4iLCJpbXBvcnQgdHlwZSB7XG4gIFJhd01hZ25ldExpbmtEYXRhLFxuICBNYWduZXRSZWNvcmQsXG4gIENvbGxlY3Rpb25Nb2RlLFxuICBNaW5pbWFsTWFnbmV0UmVjb3JkXG59IGZyb20gXCJAL2xpYi90eXBlc1wiO1xuaW1wb3J0IHvCoGV4dHJhY3ROYW1lRnJvbU1hZ25ldMKgfSBmcm9tIFwiQC9saWIvdXRpbHNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RJbmZvSGFzaChtYWduZXRMaW5rOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBtYXRjaCA9IG1hZ25ldExpbmsubWF0Y2goL3VybjpidGloOihbYS16QS1aMC05XSspL2kpO1xuICBpZiAoIW1hdGNoKSByZXR1cm4gXCJcIjtcbiAgcmV0dXJuIG1hdGNoWzFdLnRvTG93ZXJDYXNlKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVNpemUoc2l6ZVN0cj86IHN0cmluZyk6IG51bWJlciB8IG51bGwge1xuICBpZiAoIXNpemVTdHIpIHJldHVybiBudWxsO1xuXG4gIGNvbnN0IG1hdGNoID0gc2l6ZVN0clxuICAgIC50b1VwcGVyQ2FzZSgpXG4gICAgLnRyaW0oKVxuICAgIC5tYXRjaCgvXihbXFxkLl0rKVxccyooQnxLQnxNQnxHQnxUQikkLyk7XG5cbiAgaWYgKCFtYXRjaCkgcmV0dXJuIG51bGw7XG5cbiAgY29uc3QgdmFsdWUgPSBwYXJzZUZsb2F0KG1hdGNoWzFdKTtcbiAgY29uc3QgdW5pdCA9IG1hdGNoWzJdO1xuXG4gIGNvbnN0IG11bHRpcGxpZXJzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge1xuICAgIEI6IDEsXG4gICAgS0I6IDEwMjQsXG4gICAgTUI6IDEwMjQgKiogMixcbiAgICBHQjogMTAyNCAqKiAzLFxuICAgIFRCOiAxMDI0ICoqIDQsXG4gIH07XG5cbiAgcmV0dXJuIE1hdGgucm91bmQodmFsdWUgKiBtdWx0aXBsaWVyc1t1bml0XSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUludFNhZmUobnVtU3RyPzogc3RyaW5nKTogbnVtYmVyIHwgbnVsbCB7XG4gIGlmICghbnVtU3RyKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgcGFyc2VkID0gcGFyc2VJbnQobnVtU3RyLnJlcGxhY2UoLywvZywgXCJcIiksIDEwKTtcbiAgcmV0dXJuIGlzTmFOKHBhcnNlZCkgPyBudWxsIDogcGFyc2VkO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVNYWduZXREYXRhKFxuICByYXc6IFJhd01hZ25ldExpbmtEYXRhLFxuICBvcHRpb25zOiB7IG1vZGU6IENvbGxlY3Rpb25Nb2RlIH1cbik6IE1hZ25ldFJlY29yZCB7XG4gIGNvbnN0IHsgbW9kZSB9ID0gb3B0aW9ucztcbiAgY29uc3QgaW5mb0hhc2ggPSBleHRyYWN0SW5mb0hhc2gocmF3Lm1hZ25ldExpbmspO1xuXG4gIGNvbnN0IGVtYmVkZGVkTmFtZSA9IGV4dHJhY3ROYW1lRnJvbU1hZ25ldChyYXcubWFnbmV0TGluayk7XG4gIGNvbnN0IGJlc3ROYW1lID0gcmF3Lm5hbWUgPz8gZW1iZWRkZWROYW1lID8/IG51bGw7XG5cbiAgY29uc3QgYmFzZTogTWluaW1hbE1hZ25ldFJlY29yZCA9IHtcbiAgICBpbmZvSGFzaCxcbiAgICBzb3VyY2U6IHJhdy5zb3VyY2UsXG4gICAgc2NyYXBlZEF0OiByYXcuc2NyYXBlZEF0LFxuICB9O1xuXG4gIGlmIChtb2RlID09PSBDb2xsZWN0aW9uTW9kZS5NaW5pbWFsKSB7XG4gICAgcmV0dXJuIGJhc2U7XG4gIH1cbiAgaWYgKG1vZGUgPT09IENvbGxlY3Rpb25Nb2RlLk1pbmltYWxXaXRoTmFtZSkge1xuICAgIHJldHVybiB7XG4gICAgICAuLi5iYXNlLFxuICAgICAgbmFtZTogYmVzdE5hbWUsXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgLi4uYmFzZSxcbiAgICBtYWduZXRMaW5rOiByYXcubWFnbmV0TGluayxcbiAgICBuYW1lOiBiZXN0TmFtZSxcbiAgICBzaXplQnl0ZXM6IHBhcnNlU2l6ZShyYXcuc2l6ZSksXG4gICAgc2VlZHM6IHBhcnNlSW50U2FmZShyYXcuc2VlZHMpLFxuICAgIGxlZWNoZXJzOiBwYXJzZUludFNhZmUocmF3LmxlZWNoZXJzKSxcbiAgICBjYXRlZ29yeTogcmF3LmNhdGVnb3J5ID8/IG51bGwsXG4gIH07XG59IiwiaW1wb3J0IHR5cGUgeyBNYWduZXRSZWNvcmQsIFN0b3JlZE1hZ25ldHMsIFJhd01hZ25ldExpbmtEYXRhIH0gZnJvbSBcIkAvbGliL3R5cGVzXCI7XG5pbXBvcnQgeyBDb2xsZWN0aW9uTW9kZSB9IGZyb20gXCJAL2xpYi90eXBlc1wiO1xuaW1wb3J0IHsgaGFuZGxlRXhwb3J0TWFnbmV0cyB9IGZyb20gXCJAL2xpYi9zdGFzaC1leHBvcnRlclwiO1xuaW1wb3J0IHsgU1RPUkFHRV9LRVlTIH0gZnJvbSBcIkAvbGliL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgaW5pdGlhbGl6ZVN0b3JhZ2UgfSBmcm9tIFwiQC9saWIvaW5pdFwiO1xuaW1wb3J0IHsgbm9ybWFsaXplTWFnbmV0RGF0YSB9IGZyb20gXCJAL2xpYi9ub3JtYWxpemVyXCI7XG5cbnR5cGUgTWVzc2FnZVJlc3BvbnNlID0geyBzdWNjZXNzOiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9ICYgUmVjb3JkPFxuICBzdHJpbmcsXG4gIGFueVxuPjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQmFja2dyb3VuZCgoKSA9PiB7XG4gIGJyb3dzZXIucnVudGltZS5vbkluc3RhbGxlZC5hZGRMaXN0ZW5lcihpbml0aWFsaXplU3RvcmFnZSk7XG4gIGJyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoaGFuZGxlTWVzc2FnZSk7XG59KTtcblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlTWVzc2FnZShyZXF1ZXN0OiBhbnkpOiBQcm9taXNlPE1lc3NhZ2VSZXNwb25zZT4ge1xuICB0cnkge1xuICAgIHN3aXRjaCAocmVxdWVzdC50eXBlKSB7XG4gICAgICBjYXNlIFwiTUFHTkVUX0xJTktTXCI6XG4gICAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVNYWduZXRMaW5rcyhyZXF1ZXN0Lm1hZ25ldExpbmtzKTtcbiAgICAgIGNhc2UgXCJFWFBPUlRfTUFHTkVUU1wiOlxuICAgICAgICByZXR1cm4gYXdhaXQgaGFuZGxlRXhwb3J0TWFnbmV0cyhyZXF1ZXN0LmZvcm1hdCk7XG4gICAgICBjYXNlIFwiVE9HR0xFX0NPTExFQ1RJT05cIjpcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgbWVzc2FnZTogXCJDb2xsZWN0aW9uIHRvZ2dsZSBtZXNzYWdlIHJlY2VpdmVkXCIgfTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogXCJVbmtub3duIG1lc3NhZ2UgdHlwZVwiIH07XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBoYW5kbGluZyBtZXNzYWdlOlwiLCBlcnJvcik7XG4gICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAoZXJyb3IgYXMgRXJyb3IpLm1lc3NhZ2UgfTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVNYWduZXRMaW5rcyhuZXdNYWduZXRMaW5rczogUmF3TWFnbmV0TGlua0RhdGFbXSk6IFByb21pc2U8TWVzc2FnZVJlc3BvbnNlPiB7XG4gIGlmICghQXJyYXkuaXNBcnJheShuZXdNYWduZXRMaW5rcykgfHwgbmV3TWFnbmV0TGlua3MubGVuZ3RoID09PSAwKSByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IFwiTm8gbWFnbmV0IGxpbmtzXCIgfTtcblxuICBjb25zdCBub3JtYWxpemVkTGlua3MgPSBuZXdNYWduZXRMaW5rcy5tYXAoKHJhdykgPT4gbm9ybWFsaXplTWFnbmV0RGF0YShyYXcsIHsgbW9kZTogQ29sbGVjdGlvbk1vZGUuRnVsbCB9KVxuICApO1xuXG4gIGNvbnN0IGRlZHVwbGljYXRlZExpbmtzID0gQXJyYXkuZnJvbShcbiAgICBuZXcgTWFwKG5vcm1hbGl6ZWRMaW5rcy5tYXAoKGxpbmspID0+IFtsaW5rLmluZm9IYXNoLCBsaW5rXSkpLnZhbHVlcygpXG4gICk7XG5cbiAgY29uc3QgZXhpc3RpbmdMaW5rcyA9IChhd2FpdCBzdG9yYWdlLmdldEl0ZW08U3RvcmVkTWFnbmV0cz4oU1RPUkFHRV9LRVlTLlNUQVNIKSkgfHwgW107XG4gIGNvbnN0IGV4aXN0aW5nSW5mb0hhc2hlcyA9IG5ldyBTZXQoZXhpc3RpbmdMaW5rcy5tYXAoKGxpbmspID0+IGxpbmsuaW5mb0hhc2gpKTtcbiAgY29uc3QgdW5pcXVlTmV3TGlua3MgPSBkZWR1cGxpY2F0ZWRMaW5rcy5maWx0ZXIoKGxpbmspID0+ICFleGlzdGluZ0luZm9IYXNoZXMuaGFzKGxpbmsuaW5mb0hhc2gpKTtcbiAgXG4gIC8vIFRvZG86IGNvbnNpZGVyIG1lcmdpbmcgdXBkYXRlcyB0byBleGlzdGluZyBsaW5rc1xuICBcbiAgaWYgKHVuaXF1ZU5ld0xpbmtzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIG1lc3NhZ2U6IFwiTm8gbmV3IHVuaXF1ZSBtYWduZXQgbGlua3MgdG8gYWRkXCIgfTtcbiAgfVxuXG4gIGNvbnN0IHVwZGF0ZWRTdGFzaCA9IFsuLi5leGlzdGluZ0xpbmtzLCAuLi51bmlxdWVOZXdMaW5rc107XG4gIGF3YWl0IHN0b3JhZ2Uuc2V0SXRlbShTVE9SQUdFX0tFWVMuU1RBU0gsIHVwZGF0ZWRTdGFzaCk7XG4gIFxuICBhd2FpdCBicm9hZGNhc3RVcGRhdGUodXBkYXRlZFN0YXNoLCB1bmlxdWVOZXdMaW5rcyk7XG5cbiAgcmV0dXJuIHtcbiAgICBzdWNjZXNzOiB0cnVlLFxuICB9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBicm9hZGNhc3RVcGRhdGUoXG4gIHVwZGF0ZWRMaW5rczogTWFnbmV0UmVjb3JkW10sXG4gIG5ld0xpbmtzOiBNYWduZXRSZWNvcmRbXVxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IG1lc3NhZ2UgPSB7XG4gICAgdHlwZTogXCJNQUdORVRfTElOS1NfVVBEQVRFRFwiLFxuICAgIGNvdW50OiB1cGRhdGVkTGlua3MubGVuZ3RoLFxuICAgIGFkZGVkQ291bnQ6IG5ld0xpbmtzLmxlbmd0aCxcbiAgICBuZXdMaW5rcyxcbiAgfTtcblxuICB0cnkge1xuICAgIGF3YWl0IGJyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZShtZXNzYWdlKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmRlYnVnKFwiQ291bGQgbm90IGJyb2FkY2FzdCB1cGRhdGUgLSBVSSBsaWtlbHkgY2xvc2VkXCIpO1xuICB9XG59XG4iLCIvLyBzcmMvaW5kZXgudHNcbnZhciBfTWF0Y2hQYXR0ZXJuID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihtYXRjaFBhdHRlcm4pIHtcbiAgICBpZiAobWF0Y2hQYXR0ZXJuID09PSBcIjxhbGxfdXJscz5cIikge1xuICAgICAgdGhpcy5pc0FsbFVybHMgPSB0cnVlO1xuICAgICAgdGhpcy5wcm90b2NvbE1hdGNoZXMgPSBbLi4uX01hdGNoUGF0dGVybi5QUk9UT0NPTFNdO1xuICAgICAgdGhpcy5ob3N0bmFtZU1hdGNoID0gXCIqXCI7XG4gICAgICB0aGlzLnBhdGhuYW1lTWF0Y2ggPSBcIipcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZ3JvdXBzID0gLyguKik6XFwvXFwvKC4qPykoXFwvLiopLy5leGVjKG1hdGNoUGF0dGVybik7XG4gICAgICBpZiAoZ3JvdXBzID09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBJbnZhbGlkTWF0Y2hQYXR0ZXJuKG1hdGNoUGF0dGVybiwgXCJJbmNvcnJlY3QgZm9ybWF0XCIpO1xuICAgICAgY29uc3QgW18sIHByb3RvY29sLCBob3N0bmFtZSwgcGF0aG5hbWVdID0gZ3JvdXBzO1xuICAgICAgdmFsaWRhdGVQcm90b2NvbChtYXRjaFBhdHRlcm4sIHByb3RvY29sKTtcbiAgICAgIHZhbGlkYXRlSG9zdG5hbWUobWF0Y2hQYXR0ZXJuLCBob3N0bmFtZSk7XG4gICAgICB2YWxpZGF0ZVBhdGhuYW1lKG1hdGNoUGF0dGVybiwgcGF0aG5hbWUpO1xuICAgICAgdGhpcy5wcm90b2NvbE1hdGNoZXMgPSBwcm90b2NvbCA9PT0gXCIqXCIgPyBbXCJodHRwXCIsIFwiaHR0cHNcIl0gOiBbcHJvdG9jb2xdO1xuICAgICAgdGhpcy5ob3N0bmFtZU1hdGNoID0gaG9zdG5hbWU7XG4gICAgICB0aGlzLnBhdGhuYW1lTWF0Y2ggPSBwYXRobmFtZTtcbiAgICB9XG4gIH1cbiAgaW5jbHVkZXModXJsKSB7XG4gICAgaWYgKHRoaXMuaXNBbGxVcmxzKVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgY29uc3QgdSA9IHR5cGVvZiB1cmwgPT09IFwic3RyaW5nXCIgPyBuZXcgVVJMKHVybCkgOiB1cmwgaW5zdGFuY2VvZiBMb2NhdGlvbiA/IG5ldyBVUkwodXJsLmhyZWYpIDogdXJsO1xuICAgIHJldHVybiAhIXRoaXMucHJvdG9jb2xNYXRjaGVzLmZpbmQoKHByb3RvY29sKSA9PiB7XG4gICAgICBpZiAocHJvdG9jb2wgPT09IFwiaHR0cFwiKVxuICAgICAgICByZXR1cm4gdGhpcy5pc0h0dHBNYXRjaCh1KTtcbiAgICAgIGlmIChwcm90b2NvbCA9PT0gXCJodHRwc1wiKVxuICAgICAgICByZXR1cm4gdGhpcy5pc0h0dHBzTWF0Y2godSk7XG4gICAgICBpZiAocHJvdG9jb2wgPT09IFwiZmlsZVwiKVxuICAgICAgICByZXR1cm4gdGhpcy5pc0ZpbGVNYXRjaCh1KTtcbiAgICAgIGlmIChwcm90b2NvbCA9PT0gXCJmdHBcIilcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNGdHBNYXRjaCh1KTtcbiAgICAgIGlmIChwcm90b2NvbCA9PT0gXCJ1cm5cIilcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNVcm5NYXRjaCh1KTtcbiAgICB9KTtcbiAgfVxuICBpc0h0dHBNYXRjaCh1cmwpIHtcbiAgICByZXR1cm4gdXJsLnByb3RvY29sID09PSBcImh0dHA6XCIgJiYgdGhpcy5pc0hvc3RQYXRoTWF0Y2godXJsKTtcbiAgfVxuICBpc0h0dHBzTWF0Y2godXJsKSB7XG4gICAgcmV0dXJuIHVybC5wcm90b2NvbCA9PT0gXCJodHRwczpcIiAmJiB0aGlzLmlzSG9zdFBhdGhNYXRjaCh1cmwpO1xuICB9XG4gIGlzSG9zdFBhdGhNYXRjaCh1cmwpIHtcbiAgICBpZiAoIXRoaXMuaG9zdG5hbWVNYXRjaCB8fCAhdGhpcy5wYXRobmFtZU1hdGNoKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IGhvc3RuYW1lTWF0Y2hSZWdleHMgPSBbXG4gICAgICB0aGlzLmNvbnZlcnRQYXR0ZXJuVG9SZWdleCh0aGlzLmhvc3RuYW1lTWF0Y2gpLFxuICAgICAgdGhpcy5jb252ZXJ0UGF0dGVyblRvUmVnZXgodGhpcy5ob3N0bmFtZU1hdGNoLnJlcGxhY2UoL15cXCpcXC4vLCBcIlwiKSlcbiAgICBdO1xuICAgIGNvbnN0IHBhdGhuYW1lTWF0Y2hSZWdleCA9IHRoaXMuY29udmVydFBhdHRlcm5Ub1JlZ2V4KHRoaXMucGF0aG5hbWVNYXRjaCk7XG4gICAgcmV0dXJuICEhaG9zdG5hbWVNYXRjaFJlZ2V4cy5maW5kKChyZWdleCkgPT4gcmVnZXgudGVzdCh1cmwuaG9zdG5hbWUpKSAmJiBwYXRobmFtZU1hdGNoUmVnZXgudGVzdCh1cmwucGF0aG5hbWUpO1xuICB9XG4gIGlzRmlsZU1hdGNoKHVybCkge1xuICAgIHRocm93IEVycm9yKFwiTm90IGltcGxlbWVudGVkOiBmaWxlOi8vIHBhdHRlcm4gbWF0Y2hpbmcuIE9wZW4gYSBQUiB0byBhZGQgc3VwcG9ydFwiKTtcbiAgfVxuICBpc0Z0cE1hdGNoKHVybCkge1xuICAgIHRocm93IEVycm9yKFwiTm90IGltcGxlbWVudGVkOiBmdHA6Ly8gcGF0dGVybiBtYXRjaGluZy4gT3BlbiBhIFBSIHRvIGFkZCBzdXBwb3J0XCIpO1xuICB9XG4gIGlzVXJuTWF0Y2godXJsKSB7XG4gICAgdGhyb3cgRXJyb3IoXCJOb3QgaW1wbGVtZW50ZWQ6IHVybjovLyBwYXR0ZXJuIG1hdGNoaW5nLiBPcGVuIGEgUFIgdG8gYWRkIHN1cHBvcnRcIik7XG4gIH1cbiAgY29udmVydFBhdHRlcm5Ub1JlZ2V4KHBhdHRlcm4pIHtcbiAgICBjb25zdCBlc2NhcGVkID0gdGhpcy5lc2NhcGVGb3JSZWdleChwYXR0ZXJuKTtcbiAgICBjb25zdCBzdGFyc1JlcGxhY2VkID0gZXNjYXBlZC5yZXBsYWNlKC9cXFxcXFwqL2csIFwiLipcIik7XG4gICAgcmV0dXJuIFJlZ0V4cChgXiR7c3RhcnNSZXBsYWNlZH0kYCk7XG4gIH1cbiAgZXNjYXBlRm9yUmVnZXgoc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgXCJcXFxcJCZcIik7XG4gIH1cbn07XG52YXIgTWF0Y2hQYXR0ZXJuID0gX01hdGNoUGF0dGVybjtcbk1hdGNoUGF0dGVybi5QUk9UT0NPTFMgPSBbXCJodHRwXCIsIFwiaHR0cHNcIiwgXCJmaWxlXCIsIFwiZnRwXCIsIFwidXJuXCJdO1xudmFyIEludmFsaWRNYXRjaFBhdHRlcm4gPSBjbGFzcyBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWF0Y2hQYXR0ZXJuLCByZWFzb24pIHtcbiAgICBzdXBlcihgSW52YWxpZCBtYXRjaCBwYXR0ZXJuIFwiJHttYXRjaFBhdHRlcm59XCI6ICR7cmVhc29ufWApO1xuICB9XG59O1xuZnVuY3Rpb24gdmFsaWRhdGVQcm90b2NvbChtYXRjaFBhdHRlcm4sIHByb3RvY29sKSB7XG4gIGlmICghTWF0Y2hQYXR0ZXJuLlBST1RPQ09MUy5pbmNsdWRlcyhwcm90b2NvbCkgJiYgcHJvdG9jb2wgIT09IFwiKlwiKVxuICAgIHRocm93IG5ldyBJbnZhbGlkTWF0Y2hQYXR0ZXJuKFxuICAgICAgbWF0Y2hQYXR0ZXJuLFxuICAgICAgYCR7cHJvdG9jb2x9IG5vdCBhIHZhbGlkIHByb3RvY29sICgke01hdGNoUGF0dGVybi5QUk9UT0NPTFMuam9pbihcIiwgXCIpfSlgXG4gICAgKTtcbn1cbmZ1bmN0aW9uIHZhbGlkYXRlSG9zdG5hbWUobWF0Y2hQYXR0ZXJuLCBob3N0bmFtZSkge1xuICBpZiAoaG9zdG5hbWUuaW5jbHVkZXMoXCI6XCIpKVxuICAgIHRocm93IG5ldyBJbnZhbGlkTWF0Y2hQYXR0ZXJuKG1hdGNoUGF0dGVybiwgYEhvc3RuYW1lIGNhbm5vdCBpbmNsdWRlIGEgcG9ydGApO1xuICBpZiAoaG9zdG5hbWUuaW5jbHVkZXMoXCIqXCIpICYmIGhvc3RuYW1lLmxlbmd0aCA+IDEgJiYgIWhvc3RuYW1lLnN0YXJ0c1dpdGgoXCIqLlwiKSlcbiAgICB0aHJvdyBuZXcgSW52YWxpZE1hdGNoUGF0dGVybihcbiAgICAgIG1hdGNoUGF0dGVybixcbiAgICAgIGBJZiB1c2luZyBhIHdpbGRjYXJkICgqKSwgaXQgbXVzdCBnbyBhdCB0aGUgc3RhcnQgb2YgdGhlIGhvc3RuYW1lYFxuICAgICk7XG59XG5mdW5jdGlvbiB2YWxpZGF0ZVBhdGhuYW1lKG1hdGNoUGF0dGVybiwgcGF0aG5hbWUpIHtcbiAgcmV0dXJuO1xufVxuZXhwb3J0IHtcbiAgSW52YWxpZE1hdGNoUGF0dGVybixcbiAgTWF0Y2hQYXR0ZXJuXG59O1xuIl0sIm5hbWVzIjpbImJyb3dzZXIiLCJfYnJvd3NlciIsInJlc3VsdCIsIkNvbGxlY3Rpb25Nb2RlIl0sIm1hcHBpbmdzIjoiOztBQUFPLFdBQVMsaUJBQWlCLEtBQUs7QUFDcEMsUUFBSSxPQUFPLFFBQVEsT0FBTyxRQUFR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QUFNLElBQUk7QUFBQSxRQUNSO0FBQUEsUUFDQSxHQUFHLFFBQVEsMEJBQTBCLGFBQWEsVUFBVSxLQUFLLElBQUksQ0FBQztBQUFBLE1BQzVFO0FBQUEsRUFDQTtBQUNBLFdBQVMsaUJBQWlCLGNBQWMsVUFBVTtBQUNoRCxRQUFJLFNBQVMsU0FBUyxHQUFHO0FBQ3ZCLFlBQU0sSUFBSSxvQkFBb0IsY0FBYyxnQ0FBZ0M7QUFDOUUsUUFBSSxTQUFTLFNBQVMsR0FBRyxLQUFLLFNBQVMsU0FBUyxLQUFLLENBQUMsU0FBUyxXQUFXLElBQUk7QUFDNUUsWUFBTSxJQUFJO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxNQUNOO0FBQUEsRUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OyIsInhfZ29vZ2xlX2lnbm9yZUxpc3QiOlswLDEsMiwzLDQsNSwxM119
