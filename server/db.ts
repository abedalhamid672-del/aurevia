import { and, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, wishlistItems } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach((field) => { if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; } });
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getWishlistIds(userId: number): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ fragranceId: wishlistItems.fragranceId }).from(wishlistItems).where(eq(wishlistItems.userId, userId));
  return rows.map((row) => row.fragranceId);
}

export async function addWishlistItem(userId: number, fragranceId: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(wishlistItems).values({ userId, fragranceId }).onDuplicateKeyUpdate({ set: { fragranceId } });
}

export async function removeWishlistItem(userId: number, fragranceId: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(wishlistItems).where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.fragranceId, fragranceId)));
}

export async function addWishlistItems(userId: number, fragranceIds: string[]) {
  const db = await getDb();
  if (!db || fragranceIds.length === 0) return;
  const values = Array.from(new Set(fragranceIds)).map((fragranceId) => ({ userId, fragranceId }));
  await db.insert(wishlistItems).values(values).onDuplicateKeyUpdate({ set: { createdAt: new Date() } });
}

export async function removeWishlistItems(userId: number, fragranceIds: string[]) {
  const db = await getDb();
  if (!db || fragranceIds.length === 0) return;
  await db.delete(wishlistItems).where(and(eq(wishlistItems.userId, userId), inArray(wishlistItems.fragranceId, fragranceIds)));
}
