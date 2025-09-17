> [!CAUTION]
> This branch is dedicated to the **Magneto Rewrite**. Builds from this branch are under active development and are **experimental**. They may contain bugs, unfinished features, or breaking changes. **Do not use these builds for daily browsing.** Refer to the [main](https://github.com/gergogyulai/magneto/tree/main) branch for stable [releases](https://github.com/gergogyulai/magneto/releases).

# Magneto 🧲 (Rewrite Branch)

A privacy-focused Chrome extension for collecting magnet links. Currently undergoing a significant rewrite with Vite + Svelte 5 + TypeScript and Manifest V3.

### The Great Rewrite: A Leap Forward for Magneto (Currently In Progress)

Magneto is currently undergoing a significant rewrite, transitioning from
Svelte 4 to **Svelte 5 (Rune API)** and Tailwind CSS 3 to **Tailwind CSS 4**.
This isn't just an upgrade; it's a fundamental re-architecture aimed at
delivering a much better experience. The rewrite is bringing about:

-   **Unparalleled Performance:** By leveraging Svelte 5's new reactivity
    system, Magneto aims to be faster and more efficient, ensuring an even
    more minimal impact on your browsing experience. The UI is expected to be
    snappier, and background operations optimized.
-   **Enhanced Maintainability:** The move to Svelte 5 with its Rune API
    significantly simplifies the codebase, making it more readable,
    predictable, and easier to extend. This is crucial for faster development
    of new features and quicker bug fixes in the future.
-   **Modern Styling with Tailwind 4:** Upgrading to Tailwind CSS 4 streamlines
    our styling process, reduces CSS bloat, and allows for even more rapid UI
    development while maintaining Magneto's clean and intuitive aesthetic.
-   **Future-Proofing:** These architectural changes lay a solid foundation
    for future growth and innovation, ensuring Magneto remains a cutting-edge
    and reliable tool for years to come.

## ⬇️ Installing (Experimental Builds)

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

## 🤝 Contributing

PRs and issues welcome! 🙏 Please note that development on this branch is
focused on the rewrite.

## 📜 License

[MIT License](LICENSE)
