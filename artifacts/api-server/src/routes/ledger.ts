import { Router } from "express";
import { db } from "@workspace/db";
import { ledgerEntriesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  const entries = await db.select().from(ledgerEntriesTable).orderBy(ledgerEntriesTable.date);
  return res.json(entries.map(e => ({ ...e, createdAt: undefined })));
});

router.post("/", async (req, res) => {
  const body = req.body;
  const [entry] = await db.insert(ledgerEntriesTable).values({
    date: body.date,
    description: body.description,
    account: body.account,
    type: body.type,
    debit: body.debit ?? 0,
    credit: body.credit ?? 0,
    balance: (body.debit ?? 0) - (body.credit ?? 0),
    reference: body.reference,
  }).returning();
  return res.status(201).json(entry);
});

router.get("/summary", async (_req, res) => {
  const [result] = await db.select({
    totalDebit: sql<number>`coalesce(sum(debit), 0)`,
    totalCredit: sql<number>`coalesce(sum(credit), 0)`,
    balance: sql<number>`coalesce(sum(debit) - sum(credit), 0)`,
  }).from(ledgerEntriesTable);
  return res.json(result ?? { totalDebit: 0, totalCredit: 0, balance: 0 });
});

router.get("/:id", async (req, res) => {
  const [entry] = await db.select().from(ledgerEntriesTable).where(eq(ledgerEntriesTable.id, Number(req.params.id)));
  if (!entry) return res.status(404).json({ error: "Not found" });
  return res.json(entry);
});

router.put("/:id", async (req, res) => {
  const body = req.body;
  const [entry] = await db.update(ledgerEntriesTable).set({
    date: body.date,
    description: body.description,
    account: body.account,
    type: body.type,
    debit: body.debit ?? 0,
    credit: body.credit ?? 0,
    balance: (body.debit ?? 0) - (body.credit ?? 0),
    reference: body.reference,
  }).where(eq(ledgerEntriesTable.id, Number(req.params.id))).returning();
  if (!entry) return res.status(404).json({ error: "Not found" });
  return res.json(entry);
});

router.delete("/:id", async (req, res) => {
  await db.delete(ledgerEntriesTable).where(eq(ledgerEntriesTable.id, Number(req.params.id)));
  return res.status(204).end();
});

export default router;
