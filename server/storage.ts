import {
  users,
  dvds,
  type User,
  type UpsertUser,
  type Dvd,
  type InsertDvd,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, like, gte, lte } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // DVD operations
  getUserDvds(userId: string): Promise<Dvd[]>;
  getDvd(id: number, userId: string): Promise<Dvd | undefined>;
  createDvd(dvd: InsertDvd, userId: string): Promise<Dvd>;
  updateDvd(
    id: number,
    updates: Partial<InsertDvd>,
    userId: string
  ): Promise<Dvd | undefined>;
  deleteDvd(id: number, userId: string): Promise<boolean>;
  searchDvds(query: string, userId: string): Promise<Dvd[]>;
  filterDvds(
    filters: { status?: string; genre?: string; year?: number },
    userId: string
  ): Promise<Dvd[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // DVD operations
  async getUserDvds(userId: string): Promise<Dvd[]> {
    return await db.select().from(dvds).where(eq(dvds.userId, userId));
  }

  async getDvd(id: number, userId: string): Promise<Dvd | undefined> {
    const [dvd] = await db
      .select()
      .from(dvds)
      .where(and(eq(dvds.id, id), eq(dvds.userId, userId)));
    return dvd;
  }

  async createDvd(insertDvd: InsertDvd, userId: string): Promise<Dvd> {
    const [dvd] = await db
      .insert(dvds)
      .values({ ...insertDvd, userId })
      .returning();
    return dvd;
  }

  async updateDvd(
    id: number,
    updates: Partial<InsertDvd>,
    userId: string
  ): Promise<Dvd | undefined> {
    const [dvd] = await db
      .update(dvds)
      .set(updates)
      .where(and(eq(dvds.id, id), eq(dvds.userId, userId)))
      .returning();
    return dvd;
  }

  async deleteDvd(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(dvds)
      .where(and(eq(dvds.id, id), eq(dvds.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async searchDvds(query: string, userId: string): Promise<Dvd[]> {
    return await db
      .select()
      .from(dvds)
      .where(
        and(
          eq(dvds.userId, userId),
          or(
            like(dvds.title, `%${query}%`),
            like(dvds.director, `%${query}%`),
            like(dvds.genre, `%${query}%`)
          )
        )
      );
  }

  async filterDvds(
    filters: { status?: string; genre?: string; year?: number },
    userId: string
  ): Promise<Dvd[]> {
    let conditions = [eq(dvds.userId, userId)];

    if (filters.status) {
      conditions.push(eq(dvds.status, filters.status));
    }
    if (filters.genre) {
      conditions.push(like(dvds.genre, `%${filters.genre}%`));
    }
    if (filters.year) {
      conditions.push(eq(dvds.year, filters.year));
    }

    return await db
      .select()
      .from(dvds)
      .where(and(...conditions));
  }
}

export const storage = new DatabaseStorage();
