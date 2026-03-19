import { query, action } from "./_generated/server";
import { v } from "convex/values";
import { bunnyStorage } from "./bunny";

export const listFiles = query({
  args: {},
  handler: async (ctx) => {
    return await bunnyStorage.listFiles(ctx);
  },
});

export const getFile = query({
  args: { fileId: v.string() },
  handler: async (ctx, args) => {
    return await bunnyStorage.getFile(ctx, args.fileId);
  },
});

export const uploadFile = action({
  args: {
    fileName: v.string(),
    fileData: v.string(),
    contentType: v.optional(v.string()),
    path: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await bunnyStorage.upload(ctx, {
      fileName: args.fileName,
      fileData: args.fileData,
      contentType: args.contentType,
      path: args.path ?? "uploads",
    });
  },
});

export const deleteFile = action({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    return await bunnyStorage.deleteFile(ctx, args.key);
  },
});
