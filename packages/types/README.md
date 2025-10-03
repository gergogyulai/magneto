# @magneto/types

Shared TypeScript types for the Magneto monorepo.

## Usage

```typescript
import type { 
  RawMagnetLinkData, 
  MagnetRecord, 
  SourceAdapter,
  CollectionMode 
} from "@magneto/types";
```

## Types

### `RawMagnetLinkData`
Raw data directly scraped from provider pages. Unstructured data that needs normalization.

### `MagnetRecord`
Normalized magnet link record with optional metadata depending on collection mode.

### `MinimalMagnetRecord`
Core required fields (infoHash, source, scrapedAt) for minimal collection mode.

### `SourceAdapter`
Function type for adapters: `(document: Document, location: Location) => RawMagnetLinkData[]`

### `CollectionMode`
Enum defining data collection modes:
- `Minimal`: Only hash, source, date
- `MinimalWithName`: Minimal + name
- `Full`: Full torrent metadata

## Development

```bash
# Build the package
bun run build

# Watch mode
bun run dev

# Clean build artifacts
bun run clean
```
