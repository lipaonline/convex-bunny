import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { fileId: v.id("files") },
  returns: v.union(
    v.object({
      _id: v.id("files"),
      _creationTime: v.number(),
      key: v.string(),
      storageZone: v.string(),
      fileName: v.string(),
      contentType: v.optional(v.string()),
      size: v.optional(v.number()),
      cdnUrl: v.string(),
      uploadedAt: v.number(),
      metadata: v.optional(v.any()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.fileId);
  },
});

export const getByKey = query({
  args: { key: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("files"),
      _creationTime: v.number(),
      key: v.string(),
      storageZone: v.string(),
      fileName: v.string(),
      contentType: v.optional(v.string()),
      size: v.optional(v.number()),
      cdnUrl: v.string(),
      uploadedAt: v.number(),
      metadata: v.optional(v.any()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("files")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
  },
});

export const list = query({
  args: {
    storageZone: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("files"),
      _creationTime: v.number(),
      key: v.string(),
      storageZone: v.string(),
      fileName: v.string(),
      contentType: v.optional(v.string()),
      size: v.optional(v.number()),
      cdnUrl: v.string(),
      uploadedAt: v.number(),
      metadata: v.optional(v.any()),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;

    if (args.storageZone) {
      return await ctx.db
        .query("files")
        .withIndex("by_storageZone", (q) =>
          q.eq("storageZone", args.storageZone!)
        )
        .take(limit);
    }

    return await ctx.db
      .query("files")
      .order("desc")
      .take(limit);
  },
});

export const store = internalMutation({
  args: {
    key: v.string(),
    storageZone: v.string(),
    fileName: v.string(),
    contentType: v.optional(v.string()),
    size: v.optional(v.number()),
    cdnUrl: v.string(),
    metadata: v.optional(v.any()),
  },
  returns: v.id("files"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("files", {
      key: args.key,
      storageZone: args.storageZone,
      fileName: args.fileName,
      contentType: args.contentType,
      size: args.size,
      cdnUrl: args.cdnUrl,
      uploadedAt: Date.now(),
      metadata: args.metadata,
    });
  },
});

export const remove = mutation({
  args: { fileId: v.id("files") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.fileId);
    return null;
  },
});

export const removeByKey = internalMutation({
  args: { key: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const file = await ctx.db
      .query("files")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    if (file) {
      await ctx.db.delete(file._id);
    }
    return null;
  },
});
