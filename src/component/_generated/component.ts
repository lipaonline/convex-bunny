/* eslint-disable */
/**
 * Generated `ComponentApi` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";

/**
 * A utility for referencing a Convex component's exposed API.
 *
 * Useful when expecting a parameter like `components.myComponent`.
 * Usage:
 * ```ts
 * async function myFunction(ctx: QueryCtx, component: ComponentApi) {
 *   return ctx.runQuery(component.someFile.someQuery, { ...args });
 * }
 * ```
 */
export type ComponentApi<Name extends string | undefined = string | undefined> =
  {
    files: {
      get: FunctionReference<
        "query",
        "internal",
        { fileId: string },
        {
          _creationTime: number;
          _id: string;
          cdnUrl: string;
          contentType?: string;
          fileName: string;
          key: string;
          metadata?: any;
          size?: number;
          storageZone: string;
          uploadedAt: number;
        } | null,
        Name
      >;
      getByKey: FunctionReference<
        "query",
        "internal",
        { key: string },
        {
          _creationTime: number;
          _id: string;
          cdnUrl: string;
          contentType?: string;
          fileName: string;
          key: string;
          metadata?: any;
          size?: number;
          storageZone: string;
          uploadedAt: number;
        } | null,
        Name
      >;
      list: FunctionReference<
        "query",
        "internal",
        { limit?: number; storageZone?: string },
        Array<{
          _creationTime: number;
          _id: string;
          cdnUrl: string;
          contentType?: string;
          fileName: string;
          key: string;
          metadata?: any;
          size?: number;
          storageZone: string;
          uploadedAt: number;
        }>,
        Name
      >;
      remove: FunctionReference<
        "mutation",
        "internal",
        { fileId: string },
        null,
        Name
      >;
      store: FunctionReference<
        "mutation",
        "internal",
        {
          cdnUrl: string;
          contentType?: string;
          fileName: string;
          key: string;
          metadata?: any;
          size?: number;
          storageZone: string;
        },
        string,
        Name
      >;
    };
    storage: {
      deleteObject: FunctionReference<
        "action",
        "internal",
        { apiKey: string; key: string; region?: string; storageZone: string },
        { success: boolean },
        Name
      >;
      getDownloadUrl: FunctionReference<
        "action",
        "internal",
        { apiKey: string; key: string; region?: string; storageZone: string },
        {
          contentLength?: number;
          contentType?: string;
          exists: boolean;
          lastModified?: string;
        },
        Name
      >;
      upload: FunctionReference<
        "action",
        "internal",
        {
          apiKey: string;
          cdnHostname: string;
          checksum?: string;
          contentType?: string;
          fileData: string;
          fileName: string;
          metadata?: any;
          path: string;
          region?: string;
          storageZone: string;
        },
        { cdnUrl: string; fileId: string; key: string },
        Name
      >;
    };
  };
