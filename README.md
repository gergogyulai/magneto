# Magneto 🧲

**Never Lose that Magnet Link Again.**

Magneto is a privacy-first Chrome extension that quietly collects and stores magnet links as you browse, creating your personal cache for when torrent sites go down. Completely private, lightweight, and open source.

[![Add to Chrome](https://img.shields.io/badge/Add%20to%20Chrome-blue?style=for-the-badge&logo=google-chrome)](https://chrome.google.com/webstore/detail/magneto/your-extension-id)

✨ **Currently available for Chrome 114+** • Firefox & Edge support coming soon!

---

## 💡 The Problem Magneto Solves

Torrent sites go down all the time. One day, a link is there, and the next, it's gone until the site comes back. If you're tired of losing access to content you meant to download but didn't get around to, Magneto is your simple, personal solution.

**Magneto builds your private magnet link archive, ensuring you always have access to the links you need, even when sites are offline.**

---

## 🔒 Privacy-First Features

Everything happens locally in your browser. **No data ever leaves your device.**

*   **Whitelist Protection:** Only collects from sites you explicitly approve. You have complete control over what gets scraped and stored.
*   **Smart Stash:** Easily browse, search, and organize your collected links. Export your archive in multiple formats (TXT, JSON, CSV).
*   **Lightweight & Efficient:** Minimal impact on browsing performance. Magneto runs quietly in the background without slowing you down.
*   **Auto-Detect:** Scans webpages for magnet links, seamlessly adding them to your stash.
*   **Simple UI:** View, copy, and manage your links with an intuitive, clutter-free interface.

---

## 🛡️ Your Privacy is Guaranteed

Magneto is built with privacy at its core. **All processing happens locally in your browser.**

**What We Don't Do:**
*   ❌ Send data to external servers
*   ❌ Track your browsing habits
*   ❌ Store personal information
*   ❌ Require account creation

**What We Do:**
*   ✅ Process everything locally on your device
*   ✅ Give you full control over your data
*   ✅ Keep your data securely on your device
*   ✅ Provide open-source code for full transparency

---

## ⚙️ How It Works (Simple, Automatic, and Under Your Control)

1.  **Whitelist Sites:** Choose which torrent sites you want Magneto to monitor for magnet links.
2.  **Browse Normally:** Magneto quietly collects magnet links as you browse your whitelisted sites.
3.  **Access Your Stash:** View, search, and manage your collected links anytime, even when the original sites are down.

---

## ⬇️ Installing Magneto

Requires Chrome 114 or later (due to Manifest V3).

1.  Download the latest release from [Magneto Releases](https://github.com/gergogyulai/magneto/releases).
2.  Unzip the downloaded file.
3.  Open Chrome and navigate to `chrome://extensions/`.
4.  Enable 'Developer mode' in the top right corner.
5.  Click 'Load unpacked' and select the unzipped Magneto folder.

---

## 👨‍💻 Developing Magneto

Built with Vite + Svelte + TypeScript and Manifest V3.
Node.js >= 22 or equivalent required.

1.  **Clone the repository:**
    ```bash
    git clone github.com/gergogyulai/magneto.git
    cd magneto
    ```

2.  **Install dependencies (choose one):**
    ```bash
    bun install
    npm install
    pnpm install
    ```

3.  **Start the development server (choose one):**
    ```bash
    npm run dev
    bun run dev
    pnpm run dev
    ```

### Chrome Development Mode

1.  Enable 'Developer mode' in Chrome (`chrome://extensions/`).
2.  Click 'Load unpacked' and select the `magneto/build` folder.

---

## 📦 Building Magneto

```bash
bun run build # creates a build in the build folder
npm run build
pnpm run build
```

or for a distributable zip file:

```bash
bun run zip # creates a zip file in the package folder
npm run zip
pnpm run zip
```

---

## 🤝 Contributing

PRs and issues are always welcome! Your contributions help make Magneto even better. 🙏

---

## 📜 License

Magneto is released under the [MIT License](LICENSE). Open source and proud of it.