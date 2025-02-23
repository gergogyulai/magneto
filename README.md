# Magneto 🧲

A privacy-focused Chrome extension for collecting magnet links. Built with Vite + Svelte + TypeScript and Manifest V3.

## ✨ Features

*   **Auto-Detect:** Scans webpages for magnet links. 🔍
*   **Lightweight:** Minimal impact on browsing. 🚀
*   **Privacy-First:** Operates locally, no data tracking. 🔒
*   **Simple UI:** View, copy, and manage links easily. 🖱️
*   **Safe Collection:** Whitelist sites for trusted links. ✅

## ⬇️ Installing

You need chrome 114 or later to install the extension.
1.  Download the latest release from [Releases](https://github.com/gergogyulai/magneto/releases).
2.  Unzip the file.
3.  Open Chrome and go to `chrome://extensions/`.
4.  Enable 'Developer mode' in the top right.
5.  'Load unpacked' and select the unzipped folder.


## 👨‍💻 Developing
  Node.js >= 14 or equivalent required

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
bun run build # creates a build in the build folder
npm run build
pnpm run build
```
or
```shell
bun run zip # creates a zip file in the package folder
npm run zip
pnpm run zip
```

## 🛡️ Privacy

*   **No Data Collection:** We collect nothing.
*   **Local Only:** All processing is local.
*   **No External Servers:** No communication outside your browser.

## 🤝 Contributing

PRs and issues welcome! 🙏

## 📜 License

[MIT License](LICENSE)
