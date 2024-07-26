import { ConvexError, v } from "convex/values";
import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server";
import { getUser } from "./users";

export async function hasAccessToOrganization(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string,
  orgId: string
) {
  const user = await getUser(ctx, tokenIdentifier);
  if (!user) {
    throw new ConvexError("User is not defined");
  }
  const userIdentity = await ctx.auth.getUserIdentity();
  if (!userIdentity) {
    throw new ConvexError("User must be logged in ");
  }
  return (
    user.orgIds.some((v) => v.orgId == orgId) ||
    userIdentity.tokenIdentifier.includes(orgId!)
  );
}

export const generateUploadUrl = mutation({
  async handler(ctx, args) {
    const identity = ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

export const createFile = mutation({
  args: {
    name: v.string(),
    orgId: v.optional(v.string()),
    fileId: v.id("_storage"),
  },
  async handler(ctx, args) {
    const userIdentity = await ctx.auth.getUserIdentity();
    if (!userIdentity) {
      throw new ConvexError("User must be logged in ");
    }

    const user = await getUser(ctx, userIdentity.tokenIdentifier);
    if (!user) {
      throw new ConvexError("User is not defined");
    }

    const hasAccess = hasAccessToOrganization(
      ctx,
      userIdentity.tokenIdentifier,
      args.orgId!
    );
    if (!hasAccess) {
      throw new ConvexError("Permission denied");
    }
    return await ctx.db.insert("files", {
      name: args.name,
      orgId: args.orgId,
      fileId: args.fileId,
    });
  },
});

export const getFiles = query({
  args: { orgId: v.string() },
  async handler(ctx, args) {
    const userIdentity = await ctx.auth.getUserIdentity();
    if (!userIdentity) {
      return [];
    }
    return ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});

export const deleteFile = mutation({
  args: {
    fileId: v.id("files"),
    storageId: v.id("_storage"),
    orgId: v.string(),
  },
  async handler(ctx, args) {
    const userIdentity = await ctx.auth.getUserIdentity();
    if (!userIdentity) {
      throw new ConvexError("User must be logged in");
    }
    const hasAccess = await hasAccessToOrganization(
      ctx,
      userIdentity.tokenIdentifier,
      args.orgId
    );
    if (!hasAccess) {
      throw new ConvexError("User does not have a permission");
    }
    await ctx.db.delete(args.fileId as any);
    await ctx.storage.delete(args.storageId);
  },
});
