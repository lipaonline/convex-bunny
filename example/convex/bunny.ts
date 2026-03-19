import { BunnyStorage } from "convex-bunny";
import { components } from "./_generated/api";

export const bunnyStorage = new BunnyStorage(components.bunny, {
  storageZone: process.env.BUNNY_STORAGE_ZONE!,
  apiKey: process.env.BUNNY_API_KEY!,
  cdnHostname: process.env.BUNNY_CDN_HOSTNAME!,
  region: process.env.BUNNY_REGION,
});
