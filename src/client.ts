import type {
  GenericActionCtx,
  GenericDataModel,
  GenericMutationCtx,
  GenericQueryCtx,
} from "convex/server";

type RunQuery = GenericQueryCtx<GenericDataModel>["runQuery"];
type RunMutation = GenericMutationCtx<GenericDataModel>["runMutation"];
type RunAction = GenericActionCtx<GenericDataModel>["runAction"];

type QueryCtx = { runQuery: RunQuery };
type MutationCtx = { runMutation: RunMutation };
type ActionCtx = { runAction: RunAction; runMutation: RunMutation };

export interface BunnyStorageConfig {
  storageZone: string;
  apiKey: string;
  cdnHostname: string;
  region?: string;
}

export interface UploadOptions {
  path?: string;
  fileName: string;
  fileData: string;
  contentType?: string;
  metadata?: Record<string, unknown>;
  checksum?: string;
}

export interface FileRecord {
  _id: string;
  _creationTime: number;
  key: string;
  storageZone: string;
  fileName: string;
  contentType?: string;
  size?: number;
  cdnUrl: string;
  uploadedAt: number;
  metadata?: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentApi = any;

export class BunnyStorage {
  public component: ComponentApi;
  private config: BunnyStorageConfig;

  constructor(component: ComponentApi, config: BunnyStorageConfig) {
    this.component = component;
    this.config = config;
  }

  private validateConfig() {
    if (!this.config.storageZone) {
      throw new Error("BunnyStorage: storageZone is required");
    }
    if (!this.config.apiKey) {
      throw new Error("BunnyStorage: apiKey is required");
    }
    if (!this.config.cdnHostname) {
      throw new Error("BunnyStorage: cdnHostname is required");
    }
  }

  async upload(
    ctx: ActionCtx,
    options: UploadOptions
  ): Promise<{ fileId: string; cdnUrl: string; key: string }> {
    this.validateConfig();
    return await ctx.runAction(this.component.storage.upload, {
      storageZone: this.config.storageZone,
      apiKey: this.config.apiKey,
      cdnHostname: this.config.cdnHostname,
      region: this.config.region,
      path: options.path ?? "",
      fileName: options.fileName,
      fileData: options.fileData,
      contentType: options.contentType,
      metadata: options.metadata,
      checksum: options.checksum,
    });
  }

  async getFile(ctx: QueryCtx, fileId: string): Promise<FileRecord | null> {
    return await ctx.runQuery(this.component.files.get, {
      fileId,
    });
  }

  async getFileByKey(ctx: QueryCtx, key: string): Promise<FileRecord | null> {
    return await ctx.runQuery(this.component.files.getByKey, {
      key,
    });
  }

  async listFiles(
    ctx: QueryCtx,
    options?: { storageZone?: string; limit?: number }
  ): Promise<FileRecord[]> {
    return await ctx.runQuery(this.component.files.list, {
      storageZone: options?.storageZone,
      limit: options?.limit,
    });
  }

  async deleteFile(
    ctx: ActionCtx,
    key: string
  ): Promise<{ success: boolean }> {
    this.validateConfig();
    return await ctx.runAction(this.component.storage.deleteObject, {
      storageZone: this.config.storageZone,
      apiKey: this.config.apiKey,
      key,
      region: this.config.region,
    });
  }

  async removeFileRecord(ctx: MutationCtx, fileId: string): Promise<null> {
    return await ctx.runMutation(this.component.files.remove, {
      fileId,
    });
  }

  async checkFile(
    ctx: ActionCtx,
    key: string
  ): Promise<{
    exists: boolean;
    contentLength?: number;
    contentType?: string;
    lastModified?: string;
  }> {
    this.validateConfig();
    return await ctx.runAction(this.component.storage.getDownloadUrl, {
      storageZone: this.config.storageZone,
      apiKey: this.config.apiKey,
      key,
      region: this.config.region,
    });
  }

  getCdnUrl(key: string): string {
    return `https://${this.config.cdnHostname}/${key}`;
  }
}
