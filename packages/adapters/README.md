# @magneto/adapters

Site-specific adapters for scraping magnet links from various torrent sites.

## Usage

```typescript
import { getAdapter, sourceAdapters } from "@magneto/adapters";

// Get an adapter for a specific hostname
const adapter = getAdapter("knaben.org");
const magnetLinks = adapter(document, location);

// Or use a specific adapter directly
import { KnabenOrgAdapter } from "@magneto/adapters";
const magnetLinks = KnabenOrgAdapter(document, location);
```

## Available Adapters

- **GenericAdapter**: Fallback adapter that extracts all `magnet:` links from a page
- **KnabenOrgAdapter**: Specialized adapter for knaben.org
- **ExtToAdapter**: Specialized adapter for ext.to
- **ArchiveOrgAdapter**: Specialized adapter for archive.org and web.archive.org

## Development

```bash
# Build the package
bun run build

# Watch mode
bun run dev

# Clean build artifacts
bun run clean
```

## Architecture

Each adapter is a function that:
1. Takes `document` and `location` as parameters
2. Extracts magnet link data from the DOM
3. Returns an array of `RawMagnetLinkData` objects

The raw data includes:
- `magnetLink`: The magnet URI
- `name`: Optional torrent name
- `size`: Optional size string (e.g., "1.4 GB")
- `seeds`: Optional seeders count
- `leechers`: Optional leechers count
- `category`: Optional category
- `source`: Source site identifier
- `scrapedAt`: ISO timestamp
