# convex-bunny

A [Convex](https://convex.dev) component for file storage and CDN delivery with [Bunny.net](https://bunny.net).

Upload, manage, and serve files through Bunny.net's global CDN directly from your Convex backend.

## Features

- **File Upload** — Upload files to Bunny Storage via Convex actions
- **CDN Delivery** — Automatic CDN URL generation for uploaded files
- **File Management** — List, query, and delete files with metadata tracking
- **Multi-Region** — Support for all Bunny Storage regions (DE, NY, LA, SG, SYD, BR, JH)
- **Metadata Tracking** — File metadata stored in Convex for reactive queries

## Installation

```bash
npm install convex-bunny
```

## Setup

### 1. Register the component

In your `convex/convex.config.ts`:

```typescript
import { defineApp } from "convex/server";
import bunny from "convex-bunny/convex.config";

const app = defineApp();
app.use(bunny);

export default app;
```

### 2. Create a component instance

In your `convex/bunny.ts`:

```typescript
import { BunnyStorage } from "convex-bunny";
import { components } from "./_generated/api";

export const bunnyStorage = new BunnyStorage(components.bunny, {
  storageZone: process.env.BUNNY_STORAGE_ZONE!,
  apiKey: process.env.BUNNY_API_KEY!,
  cdnHostname: process.env.BUNNY_CDN_HOSTNAME!,
  region: "default", // optional: de, ny, la, sg, syd, br, jh
});
```

### 3. Set environment variables

```bash
npx convex env set BUNNY_STORAGE_ZONE your-storage-zone
npx convex env set BUNNY_API_KEY your-storage-api-key
npx convex env set BUNNY_CDN_HOSTNAME your-zone.b-cdn.net
```

### 4. Use in your functions

```typescript
import { action, query } from "./_generated/server";
import { v } from "convex/values";
import { bunnyStorage } from "./bunny";

export const upload = action({
  args: {
    fileName: v.string(),
    fileData: v.string(), // base64 encoded
    contentType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await bunnyStorage.upload(ctx, {
      fileName: args.fileName,
      fileData: args.fileData,
      contentType: args.contentType,
      path: "uploads",
    });
  },
});

export const listFiles = query({
  args: {},
  handler: async (ctx) => {
    return await bunnyStorage.listFiles(ctx);
  },
});

export const deleteFile = action({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    return await bunnyStorage.deleteFile(ctx, args.key);
  },
});
```

## API Reference

### `BunnyStorage(component, config)`

| Config | Type | Required | Description |
|--------|------|----------|-------------|
| `storageZone` | `string` | Yes | Bunny Storage zone name |
| `apiKey` | `string` | Yes | Bunny Storage API key |
| `cdnHostname` | `string` | Yes | CDN hostname (e.g., `zone.b-cdn.net`) |
| `region` | `string` | No | Storage region (`default`, `ny`, `la`, `sg`, `syd`, `br`, `jh`) |

### Methods

| Method | Context | Description |
|--------|---------|-------------|
| `upload(ctx, options)` | Action | Upload a file to Bunny Storage |
| `getFile(ctx, fileId)` | Query | Get file metadata by ID |
| `getFileByKey(ctx, key)` | Query | Get file metadata by storage key |
| `listFiles(ctx, options?)` | Query | List all files |
| `deleteFile(ctx, key)` | Action | Delete a file from Bunny + metadata |
| `removeFileRecord(ctx, fileId)` | Mutation | Remove metadata only |
| `checkFile(ctx, key)` | Action | Check if file exists on Bunny |
| `getCdnUrl(key)` | Sync | Generate CDN URL for a key |

## Getting a Bunny.net API Key

1. Sign up at [bunny.net](https://bunny.net)
2. Create a **Storage Zone** in the dashboard
3. Copy the **Storage Zone Password** (this is your API key)
4. Note your **CDN hostname** (e.g., `your-zone.b-cdn.net`)

## Example App

See the `example/` directory for a complete demo app with file upload UI.

```bash
cd example
npm install
npx convex dev  # Start Convex backend
npm run dev     # Start Vite frontend
```

## License

MIT
