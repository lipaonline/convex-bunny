import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  files: defineTable({
    key: v.string(),
    storageZone: v.string(),
    fileName: v.string(),
    contentType: v.optional(v.string()),
    size: v.optional(v.number()),
    cdnUrl: v.string(),
    uploadedAt: v.number(),
    metadata: v.optional(v.any()),
  })
    .index("by_key", ["key"])
    .index("by_storageZone", ["storageZone"])
    .index("by_uploadedAt", ["uploadedAt"]),
});
