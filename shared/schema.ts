import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const dvds = pgTable("dvds", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  year: integer("year"),
  genre: text("genre"),
  director: text("director"),
  status: text("status").notNull(), // "owned" or "wishlist"
  posterUrl: text("poster_url"),
  barcode: text("barcode"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDvdSchema = createInsertSchema(dvds).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDvd = z.infer<typeof insertDvdSchema>;
export type Dvd = typeof dvds.$inferSelect;
