import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const REGION_ENDPOINTS: Record<string, string> = {
  default: "storage.bunnycdn.com",
  de: "storage.bunnycdn.com",
  ny: "ny.storage.bunnycdn.com",
  la: "la.storage.bunnycdn.com",
  sg: "sg.storage.bunnycdn.com",
  syd: "syd.storage.bunnycdn.com",
  br: "br.storage.bunnycdn.com",
  jh: "jh.storage.bunnycdn.com",
};

function getStorageEndpoint(region: string): string {
  return REGION_ENDPOINTS[region] ?? REGION_ENDPOINTS["default"];
}

export const upload = action({
  args: {
    storageZone: v.string(),
    apiKey: v.string(),
    path: v.string(),
    fileName: v.string(),
    fileData: v.string(),
    contentType: v.optional(v.string()),
    cdnHostname: v.string(),
    region: v.optional(v.string()),
    metadata: v.optional(v.any()),
    checksum: v.optional(v.string()),
  },
  returns: v.object({
    fileId: v.string(),
    cdnUrl: v.string(),
    key: v.string(),
  }),
  handler: async (ctx, args) => {
    const region = args.region ?? "default";
    const endpoint = getStorageEndpoint(region);

    const key = args.path
      ? `${args.path}/${args.fileName}`
      : args.fileName;

    const url = `https://${endpoint}/${args.storageZone}/${key}`;

    const binaryData = Uint8Array.from(atob(args.fileData), (c) =>
      c.charCodeAt(0)
    );

    const headers: Record<string, string> = {
      AccessKey: args.apiKey,
      "Content-Type": args.contentType ?? "application/octet-stream",
    };

    if (args.checksum) {
      headers["Checksum"] = args.checksum;
    }

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: binaryData,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Bunny Storage upload failed (${response.status}): ${errorBody}`
      );
    }

    const cdnUrl = `https://${args.cdnHostname}/${key}`;

    const fileId = await ctx.runMutation(internal.files.store, {
      key,
      storageZone: args.storageZone,
      fileName: args.fileName,
      contentType: args.contentType,
      size: binaryData.length,
      cdnUrl,
      metadata: args.metadata,
    });

    return {
      fileId: fileId as string,
      cdnUrl,
      key,
    };
  },
});

export const deleteObject = action({
  args: {
    storageZone: v.string(),
    apiKey: v.string(),
    key: v.string(),
    region: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const region = args.region ?? "default";
    const endpoint = getStorageEndpoint(region);

    const url = `https://${endpoint}/${args.storageZone}/${args.key}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        AccessKey: args.apiKey,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Bunny Storage delete failed (${response.status}): ${errorBody}`
      );
    }

    await ctx.runMutation(internal.files.removeByKey, { key: args.key });

    return { success: true };
  },
});

export const getDownloadUrl = action({
  args: {
    storageZone: v.string(),
    apiKey: v.string(),
    key: v.string(),
    region: v.optional(v.string()),
  },
  returns: v.object({
    exists: v.boolean(),
    contentLength: v.optional(v.number()),
    contentType: v.optional(v.string()),
    lastModified: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const region = args.region ?? "default";
    const endpoint = getStorageEndpoint(region);

    const url = `https://${endpoint}/${args.storageZone}/${args.key}`;

    const response = await fetch(url, {
      method: "HEAD",
      headers: {
        AccessKey: args.apiKey,
      },
    });

    if (response.status === 404) {
      return { exists: false };
    }

    if (!response.ok) {
      throw new Error(
        `Bunny Storage HEAD failed (${response.status})`
      );
    }

    return {
      exists: true,
      contentLength: response.headers.get("content-length")
        ? Number(response.headers.get("content-length"))
        : undefined,
      contentType: response.headers.get("content-type") ?? undefined,
      lastModified: response.headers.get("last-modified") ?? undefined,
    };
  },
});
