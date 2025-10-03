<div align="center">
    <br/>
    <p>
        <img src="public/magneto.svg" title="magneto" alt="magneto logo" width="100" />
    </p>
    <p>
        never lose that magnet link again
        <br/>
        <a href="https://magneto.crackhead.engineering">
            magneto.crackhead.engineering
        </a>
    </p>
    <p>
        <a href="https://chrome.google.com/webstore/detail/magneto/your-extension-id">
            🧲 add to chrome
        </a>
        <br/>
        <a href="https://github.com/gergogyulai/magneto/issues">
            📝 issues
        </a>
        <a href="https://github.com/gergogyulai/magneto/discussions">
            💬 discussions
        </a>
    </p>
    <br/>
</div>

magneto quietly saves every magnet link you stumble across. when torrent sites go down, your links stay safe.

### features
- 🔒 **privacy-first** — no tracking, no servers, no accounts. everything stays on your device.
- 🧩 **auto-detect** — magnet links are captured automatically while you browse.
- 🎛️ **whitelist control** — only save links from sites you explicitly approve.
- 📂 **smart stash** — search, filter, and organize your link archive.
- 📤 **easy export** — save as txt, json, or csv whenever you want.
- ⚡ **lightweight** — only 997 KB, minimal background footprint, built for speed.

### installation

#### extension store
the easiest way is through the chrome web store:  
[**→ add magneto to chrome**](https://chrome.google.com/webstore/detail/magneto/your-extension-id) (not yet approved)
requires **chrome 114+**.  
*(firefox & edge support coming soon)*  

#### 🛠 manual install
1. [download the latest release](https://github.com/gergogyulai/magneto/releases)  
2. unzip it  
3. open `chrome://extensions/`  
4. enable **developer mode**  
5. click **load unpacked** → select the magneto folder

### development
magneto is built with **vite + svelte + typescript**.  
you’ll need **bun** (or node.js 22+).  

```bash
git clone https://github.com/gergogyulai/magneto.git
cd magneto
bun i
bun run dev
```

then load the extension from the `magneto/build` folder in `chrome://extensions/`.  

to build manually:  

```bash
bun run build
bun run zip
```


### ethics
magneto is a **personal archiving tool**.  
it never sends or shares your data, and it takes **zero responsibility** for what you do with it.  
**you control what’s collected, and you own your data.**  


### contributing
want to improve magneto? thank you 🙏  
open an issue or PR here: [contribute on github](https://github.com/gergogyulai/magneto).  


### license
magneto is open source, released under the [MIT license](LICENSE).