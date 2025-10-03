import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
import packageData from './package.json';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  outDir: 'dist',
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
      "https://web.archive.org/web/20250226103720/https://torrentgalaxy.to/",
      "https://magneto.crackhead.engineering/sample-magnet-links?min=120&max=270",
      "https://knaben.org/browse/",
    ]
  },
  alias: {
    '@magneto/adapters': resolve(__dirname, '../../packages/adapters/src'),
    '@magneto/types': resolve(__dirname, '../../packages/types/src'),
  },
  vite: () => ({
    plugins: [tailwindcss()],
    esbuild: {
      drop: buildType === 'production' ? ['console', 'debugger'] : [],
    }
  }),
});
