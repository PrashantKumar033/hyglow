import { pgTable, text, serial, timestamp, doublePrecision, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const purchaseOrdersTable = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  date: text("date").notNull(),
  vendor: text("vendor").notNull(),
  items: integer("items").notNull().default(1),
  totalAmount: doublePrecision("total_amount").notNull(),
  status: text("status").notNull().default("pending"),
  deliveryDate: text("delivery_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const salesOrdersTable = pgTable("sales_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  date: text("date").notNull(),
  vendor: text("vendor").notNull(),
  items: integer("items").notNull().default(1),
  totalAmount: doublePrecision("total_amount").notNull(),
  status: text("status").notNull().default("pending"),
  deliveryDate: text("delivery_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrdersTable).omit({ id: true, createdAt: true, orderNumber: true });
export const insertSalesOrderSchema = createInsertSchema(salesOrdersTable).omit({ id: true, createdAt: true, orderNumber: true });
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type InsertSalesOrder = z.infer<typeof insertSalesOrderSchema>;
export type PurchaseOrder = typeof purchaseOrdersTable.$inferSelect;
export type SalesOrder = typeof salesOrdersTable.$inferSelect;
