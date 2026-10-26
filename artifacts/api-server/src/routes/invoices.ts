import { Router } from "express";
import { db } from "@workspace/db";
import { invoicesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

let invCounter = 1000;
function nextInvNumber() { return `INV-${String(++invCounter).padStart(4, "0")}`; }

router.get("/", async (_req, res) => {
  const invoices = await db.select().from(invoicesTable).orderBy(invoicesTable.issueDate);
  return res.json(invoices.map(i => ({ ...i, createdAt: undefined })));
});

router.post("/", async (req, res) => {
  const body = req.body;
  const total = body.amount + (body.tax ?? 0);
  const [invoice] = await db.insert(invoicesTable).values({
    invoiceNumber: nextInvNumber(),
    client: body.client,
    amount: body.amount,
    tax: body.tax ?? 0,
    total,
    issueDate: body.issueDate,
    dueDate: body.dueDate,
    status: body.status,
    notes: body.notes ?? null,
  }).returning();
  return res.status(201).json(invoice);
});

router.get("/overdue", async (_req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const invoices = await db.select().from(invoicesTable).where(sql`due_date < ${today} AND status != 'paid'`);
  return res.json(invoices.map(i => ({ ...i, createdAt: undefined })));
});

router.get("/:id", async (req, res) => {
  const [invoice] = await db.select().from(invoicesTable).where(eq(invoicesTable.id, Number(req.params.id)));
  if (!invoice) return res.status(404).json({ error: "Not found" });
  return res.json(invoice);
});

router.put("/:id", async (req, res) => {
  const body = req.body;
  const total = body.amount + (body.tax ?? 0);
  const [invoice] = await db.update(invoicesTable).set({
    client: body.client,
    amount: body.amount,
    tax: body.tax ?? 0,
    total,
    issueDate: body.issueDate,
    dueDate: body.dueDate,
    status: body.status,
    notes: body.notes ?? null,
  }).where(eq(invoicesTable.id, Number(req.params.id))).returning();
  if (!invoice) return res.status(404).json({ error: "Not found" });
  return res.json(invoice);
});

router.delete("/:id", async (req, res) => {
  await db.delete(invoicesTable).where(eq(invoicesTable.id, Number(req.params.id)));
  return res.status(204).end();
});

export default router;
