// currentTab.svelte.ts
interface TabInfo {
  url: string;
  hostname: string;
  path: string;
  search: string;
  hash: string;
  protocol: string;
  title: string;
  tabId: number;
}

class CurrentTabStore {
  private tabInfo = $state<TabInfo | null>(null);
  private initialized = false;

  constructor() {
    this.init();
  }

  get current(): TabInfo | null {
    return this.tabInfo;
  }

  get url(): string {
    return this.tabInfo?.url ?? '';
  }

  get hostname(): string {
    return this.tabInfo?.hostname ?? '';
  }

  get path(): string {
    return this.tabInfo?.path ?? '';
  }

  get search(): string {
    return this.tabInfo?.search ?? '';
  }

  get hash(): string {
    return this.tabInfo?.hash ?? '';
  }

  get protocol(): string {
    return this.tabInfo?.protocol ?? '';
  }

  get title(): string {
    return this.tabInfo?.title ?? '';
  }

  get tabId(): number {
    return this.tabInfo?.tabId ?? -1;
  }

  private async init() {
    if (this.initialized || typeof browser === 'undefined' || !browser.tabs) {
      return;
    }

    this.initialized = true;

    // Get initial active tab
    await this.updateCurrentTab();

    // Listen for tab activation changes
    browser.tabs.onActivated.addListener(async (activeInfo) => {
      await this.updateCurrentTab();
    });

    // Listen for tab updates (URL changes, etc.)
    browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      if (changeInfo.url && tab.active) {
        await this.updateCurrentTab();
      }
    });

    // Listen for window focus changes
    browser.windows.onFocusChanged.addListener(async (windowId) => {
      if (windowId !== browser.windows.WINDOW_ID_NONE) {
        await this.updateCurrentTab();
      }
    });
  }

  private async updateCurrentTab() {
    try {
      const [tab] = await browser.tabs.query({ 
        active: true, 
        currentWindow: true 
      });

      if (tab && tab.url) {
        const url = new URL(tab.url);
        
        this.tabInfo = {
          url: tab.url,
          hostname: url.hostname,
          path: url.pathname,
          search: url.search,
          hash: url.hash,
          protocol: url.protocol,
          title: tab.title ?? '',
          tabId: tab.id ?? -1,
        };
      }
    } catch (error) {
      console.warn('Failed to get current tab:', error);
      this.tabInfo = null;
    }
  }

  // Method to manually refresh tab info
  async refresh() {
    await this.updateCurrentTab();
  }
}

export const currentTab = new CurrentTabStore();