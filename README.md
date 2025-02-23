# Magneto 🧲

A privacy-focused Chrome extension for collecting magnet links. Built with Vite + Svelte + TypeScript and Manifest V3.

## ✨ Features

*   **Auto-Detect:** Scans webpages for magnet links. 🔍
*   **Lightweight:** Minimal impact on browsing. 🚀
*   **Privacy-First:** Operates locally, no data tracking. 🔒
*   **Simple UI:** View, copy, and manage links easily. 🖱️
*   **Safe Collection:** Whitelist sites for trusted links. ✅

## ⬇️ Installing

1.  Node.js >= 14 required.
2.  Customize `src/manifest.json`.
3.  Run `npm install` to install dependencies.

## 👨‍💻 Developing

1.  Clone:

    ```shell
    git clone github.com/gergogyulai/magneto.git
    cd magneto
    ```

2.  Install dependencies (choose one):

    ```shell
    bun install
    npm install
    pnpm install
    ```

3.  Start dev server (choose one):

    ```shell
    npm run dev
    bun run dev
    pnpm run dev
    ```

### Chrome Dev Mode

1.  Enable 'Developer mode' in Chrome (`chrome://extensions/`).
2.  'Load unpacked' and select `magneto/build`.

## 📦 Building

```shell
npm run build
```

## 🛡️ Privacy

*   **No Data Collection:** We collect nothing.
*   **Local Only:** All processing is local.
*   **No External Servers:** No communication outside your browser.

## 🤝 Contributing

PRs and issues welcome! 🙏

## 📜 License

[MIT License](LICENSE)
