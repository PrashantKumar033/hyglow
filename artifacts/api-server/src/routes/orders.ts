import { Router } from "express";
import { db } from "@workspace/db";
import { purchaseOrdersTable, salesOrdersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

let poCounter = 1000;
let soCounter = 1000;

function nextPoNumber() { return `PO-${String(++poCounter).padStart(4, "0")}`; }
function nextSoNumber() { return `SO-${String(++soCounter).padStart(4, "0")}`; }

// Purchase Orders
router.get("/purchase-orders", async (_req, res) => {
  const orders = await db.select().from(purchaseOrdersTable).orderBy(purchaseOrdersTable.date);
  return res.json(orders.map(o => ({ ...o, createdAt: undefined })));
});

router.post("/purchase-orders", async (req, res) => {
  const body = req.body;
  const [order] = await db.insert(purchaseOrdersTable).values({
    orderNumber: nextPoNumber(),
    date: body.date,
    vendor: body.vendor,
    items: body.items,
    totalAmount: body.totalAmount,
    status: body.status,
    deliveryDate: body.deliveryDate ?? null,
  }).returning();
  return res.status(201).json(order);
});

router.get("/purchase-orders/:id", async (req, res) => {
  const [order] = await db.select().from(purchaseOrdersTable).where(eq(purchaseOrdersTable.id, Number(req.params.id)));
  if (!order) return res.status(404).json({ error: "Not found" });
  return res.json(order);
});

router.put("/purchase-orders/:id", async (req, res) => {
  const body = req.body;
  const [order] = await db.update(purchaseOrdersTable).set({
    date: body.date,
    vendor: body.vendor,
    items: body.items,
    totalAmount: body.totalAmount,
    status: body.status,
    deliveryDate: body.deliveryDate ?? null,
  }).where(eq(purchaseOrdersTable.id, Number(req.params.id))).returning();
  if (!order) return res.status(404).json({ error: "Not found" });
  return res.json(order);
});

router.delete("/purchase-orders/:id", async (req, res) => {
  await db.delete(purchaseOrdersTable).where(eq(purchaseOrdersTable.id, Number(req.params.id)));
  return res.status(204).end();
});

// Sales Orders
router.get("/sales-orders", async (_req, res) => {
  const orders = await db.select().from(salesOrdersTable).orderBy(salesOrdersTable.date);
  return res.json(orders.map(o => ({ ...o, createdAt: undefined })));
});

router.post("/sales-orders", async (req, res) => {
  const body = req.body;
  const [order] = await db.insert(salesOrdersTable).values({
    orderNumber: nextSoNumber(),
    date: body.date,
    vendor: body.vendor,
    items: body.items,
    totalAmount: body.totalAmount,
    status: body.status,
    deliveryDate: body.deliveryDate ?? null,
  }).returning();
  return res.status(201).json(order);
});

router.get("/sales-orders/:id", async (req, res) => {
  const [order] = await db.select().from(salesOrdersTable).where(eq(salesOrdersTable.id, Number(req.params.id)));
  if (!order) return res.status(404).json({ error: "Not found" });
  return res.json(order);
});

router.put("/sales-orders/:id", async (req, res) => {
  const body = req.body;
  const [order] = await db.update(salesOrdersTable).set({
    date: body.date,
    vendor: body.vendor,
    items: body.items,
    totalAmount: body.totalAmount,
    status: body.status,
    deliveryDate: body.deliveryDate ?? null,
  }).where(eq(salesOrdersTable.id, Number(req.params.id))).returning();
  if (!order) return res.status(404).json({ error: "Not found" });
  return res.json(order);
});

router.delete("/sales-orders/:id", async (req, res) => {
  await db.delete(salesOrdersTable).where(eq(salesOrdersTable.id, Number(req.params.id)));
  return res.status(204).end();
});

export default router;
