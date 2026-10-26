import { pgTable, text, serial, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const shipmentsTable = pgTable("shipments", {
  id: serial("id").primaryKey(),
  trackingNumber: text("tracking_number").notNull().unique(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  carrier: text("carrier").notNull(),
  status: text("status").notNull().default("pending"),
  shipDate: text("ship_date").notNull(),
  estimatedDelivery: text("estimated_delivery"),
  weight: doublePrecision("weight").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertShipmentSchema = createInsertSchema(shipmentsTable).omit({ id: true, createdAt: true, trackingNumber: true });
export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type Shipment = typeof shipmentsTable.$inferSelect;
