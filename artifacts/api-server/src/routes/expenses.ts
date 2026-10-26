import { Router } from "express";
import { db } from "@workspace/db";
import { expensesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  const expenses = await db.select().from(expensesTable).orderBy(expensesTable.date);
  return res.json(expenses.map(e => ({ ...e, createdAt: undefined })));
});

router.post("/", async (req, res) => {
  const body = req.body;
  const [expense] = await db.insert(expensesTable).values({
    date: body.date,
    category: body.category,
    description: body.description,
    amount: body.amount,
    status: body.status,
    submittedBy: body.submittedBy,
    receipt: null,
  }).returning();
  return res.status(201).json(expense);
});

router.get("/by-category", async (_req, res) => {
  const results = await db.select({
    category: expensesTable.category,
    total: sql<number>`sum(amount)`,
    count: sql<number>`count(*)`,
  }).from(expensesTable).groupBy(expensesTable.category);
  return res.json(results);
});

router.get("/:id", async (req, res) => {
  const [expense] = await db.select().from(expensesTable).where(eq(expensesTable.id, Number(req.params.id)));
  if (!expense) return res.status(404).json({ error: "Not found" });
  return res.json(expense);
});

router.put("/:id", async (req, res) => {
  const body = req.body;
  const [expense] = await db.update(expensesTable).set({
    date: body.date,
    category: body.category,
    description: body.description,
    amount: body.amount,
    status: body.status,
    submittedBy: body.submittedBy,
  }).where(eq(expensesTable.id, Number(req.params.id))).returning();
  if (!expense) return res.status(404).json({ error: "Not found" });
  return res.json(expense);
});

router.delete("/:id", async (req, res) => {
  await db.delete(expensesTable).where(eq(expensesTable.id, Number(req.params.id)));
  return res.status(204).end();
});

export default router;
