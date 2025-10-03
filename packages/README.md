# Magneto Packages

This directory contains shared packages used across the Magneto monorepo.

## Packages

### [@magneto/types](./types)
Shared TypeScript types and interfaces used throughout the project.

### [@magneto/adapters](./adapters)
Site-specific adapters for scraping magnet links from various torrent sites.

## Usage in Other Packages

To use these packages in other workspace packages (like the extension):

```json
{
  "dependencies": {
    "@magneto/types": "workspace:*",
    "@magneto/adapters": "workspace:*"
  }
}
```

Then import:

```typescript
import type { MagnetRecord } from "@magneto/types";
import { getAdapter } from "@magneto/adapters";
```
