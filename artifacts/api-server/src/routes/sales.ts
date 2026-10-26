import { Router } from "express";
import { db } from "@workspace/db";
import { salesTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  const sales = await db.select().from(salesTable).orderBy(desc(salesTable.createdAt));
  return res.json(sales.map(s => ({ ...s, createdAt: undefined })));
});

router.post("/", async (req, res) => {
  const body = req.body;
  const [sale] = await db.insert(salesTable).values({
    date: body.date,
    customer: body.customer,
    product: body.product,
    quantity: body.quantity,
    amount: body.amount,
    status: body.status,
    paymentMethod: body.paymentMethod,
  }).returning();
  return res.status(201).json(sale);
});

router.get("/top-customers", async (_req, res) => {
  const customers = await db.select({
    customer: salesTable.customer,
    totalSales: sql<number>`sum(amount)`,
    orderCount: sql<number>`count(*)`,
  }).from(salesTable).groupBy(salesTable.customer).orderBy(sql`sum(amount) desc`).limit(10);
  return res.json(customers);
});

router.get("/:id", async (req, res) => {
  const [sale] = await db.select().from(salesTable).where(eq(salesTable.id, Number(req.params.id)));
  if (!sale) return res.status(404).json({ error: "Not found" });
  return res.json(sale);
});

router.put("/:id", async (req, res) => {
  const body = req.body;
  const [sale] = await db.update(salesTable).set({
    date: body.date,
    customer: body.customer,
    product: body.product,
    quantity: body.quantity,
    amount: body.amount,
    status: body.status,
    paymentMethod: body.paymentMethod,
  }).where(eq(salesTable.id, Number(req.params.id))).returning();
  if (!sale) return res.status(404).json({ error: "Not found" });
  return res.json(sale);
});

router.delete("/:id", async (req, res) => {
  await db.delete(salesTable).where(eq(salesTable.id, Number(req.params.id)));
  return res.status(204).end();
});

export default router;
