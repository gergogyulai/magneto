import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
import packageData from './package.json';

const buildType = process.env.NODE_ENV || 'production';

const suffixMap: Record<string, string> = {
  development: '-dev',
  alpha: '-alpha',
  beta: '-beta',
  rc: '-rc',
  release_candidate: '-rc',
  production: '-release',
};

function getVersionSuffix(type: string): string {
  return suffixMap[type.toLowerCase()] || '';
}

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  manifestVersion: 3,
  targetBrowsers: ['chrome', 'firefox'],
  manifest: {
    name: `${packageData.displayName}${process.env.NODE_ENV === 'development' ? ` 🧰 dev` : ''}`,
    version: `${packageData.version}`,
    description: packageData.description,
    permissions: ['storage', 'tabs', "downloads"]
  },
  zip: {
    artifactTemplate: `{{name}}-${packageData.version}${getVersionSuffix(buildType)}-{{browser}}.zip`,
    compressionLevel: 9
  },
  webExt:{
    openDevtools: true,
    binaries: {
      chrome: "/Applications/Google Chrome Dev.app/Contents/MacOS/Google Chrome Dev",
    },
    startUrls: [
      "https://magneto-sample.vercel.app/",
      "https://web.archive.org/web/20250226103720/https://torrentgalaxy.to/",
      "https://knaben.org/browse/"
    ]
  },
  vite: () => ({
    plugins: [tailwindcss()],
    esbuild: {
      drop: buildType === 'production' ? ['console', 'debugger'] : [],
    }
  }),
});
