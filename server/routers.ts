import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { addWishlistItem, addWishlistItems, getWishlistIds, removeWishlistItem, removeWishlistItems } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  wishlist: router({
    list: protectedProcedure.query(({ ctx }) => getWishlistIds(ctx.user.id)),
    add: protectedProcedure.input(z.object({ fragranceId: z.string().min(1).max(128) })).mutation(async ({ ctx, input }) => { await addWishlistItem(ctx.user.id, input.fragranceId); return getWishlistIds(ctx.user.id); }),
    remove: protectedProcedure.input(z.object({ fragranceId: z.string().min(1).max(128) })).mutation(async ({ ctx, input }) => { await removeWishlistItem(ctx.user.id, input.fragranceId); return getWishlistIds(ctx.user.id); }),
    sync: protectedProcedure.input(z.object({ localIds: z.array(z.string().min(1).max(128)).max(500) })).mutation(async ({ ctx, input }) => { const remoteIds = await getWishlistIds(ctx.user.id); const merged = Array.from(new Set([...remoteIds, ...input.localIds])); const additions = merged.filter((id) => !remoteIds.includes(id)); await addWishlistItems(ctx.user.id, additions); return merged; }),
    clearLocalOnly: protectedProcedure.input(z.object({ localIds: z.array(z.string().min(1).max(128)).max(500) })).mutation(async ({ ctx, input }) => { await removeWishlistItems(ctx.user.id, input.localIds); return getWishlistIds(ctx.user.id); }),
  }),
});

export type AppRouter = typeof appRouter;
