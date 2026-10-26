import { Router } from "express";
import { db } from "@workspace/db";
import { inventoryTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  const items = await db.select().from(inventoryTable).orderBy(inventoryTable.productName);
  return res.json(items.map(i => ({ ...i, lastUpdated: i.lastUpdated.toISOString() })));
});

router.post("/", async (req, res) => {
  const body = req.body;
  const [item] = await db.insert(inventoryTable).values({
    productId: body.productId,
    productName: body.productName,
    sku: body.sku,
    warehouse: body.warehouse,
    quantity: body.quantity,
    minStock: body.minStock,
    maxStock: body.maxStock,
  }).returning();
  return res.status(201).json({ ...item, lastUpdated: item.lastUpdated.toISOString() });
});

router.get("/low-stock", async (_req, res) => {
  const items = await db.select().from(inventoryTable).where(sql`quantity < min_stock`);
  return res.json(items.map(i => ({ ...i, lastUpdated: i.lastUpdated.toISOString() })));
});

router.put("/:id", async (req, res) => {
  const body = req.body;
  const [item] = await db.update(inventoryTable).set({
    productId: body.productId,
    productName: body.productName,
    sku: body.sku,
    warehouse: body.warehouse,
    quantity: body.quantity,
    minStock: body.minStock,
    maxStock: body.maxStock,
    lastUpdated: new Date(),
  }).where(eq(inventoryTable.id, Number(req.params.id))).returning();
  if (!item) return res.status(404).json({ error: "Not found" });
  return res.json({ ...item, lastUpdated: item.lastUpdated.toISOString() });
});

router.delete("/:id", async (req, res) => {
  await db.delete(inventoryTable).where(eq(inventoryTable.id, Number(req.params.id)));
  return res.status(204).end();
});

export default router;
