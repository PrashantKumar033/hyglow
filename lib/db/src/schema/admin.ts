import { pgTable, text, serial, timestamp, integer, boolean, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const rolesTable = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  permissions: text("permissions").notNull().default("[]"),
  userCount: integer("user_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const promotionsTable = pgTable("promotions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  code: text("code").notNull().unique(),
  type: text("type").notNull().default("percentage"),
  discount: doublePrecision("discount").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  status: text("status").notNull().default("active"),
  usageCount: integer("usage_count").notNull().default(0),
  usageLimit: integer("usage_limit"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRoleSchema = createInsertSchema(rolesTable).omit({ id: true, createdAt: true });
export const insertPromotionSchema = createInsertSchema(promotionsTable).omit({ id: true, createdAt: true });
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type Role = typeof rolesTable.$inferSelect;
export type Promotion = typeof promotionsTable.$inferSelect;
