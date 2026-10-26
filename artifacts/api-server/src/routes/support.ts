import { Router } from "express";
import { db } from "@workspace/db";
import { supportTicketsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/tickets", async (_req, res) => {
  const tickets = await db.select().from(supportTicketsTable).orderBy(supportTicketsTable.createdAt);
  return res.json(tickets.map(t => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  })));
});

router.post("/tickets", async (req, res) => {
  const body = req.body;
  const [ticket] = await db.insert(supportTicketsTable).values({
    title: body.title,
    description: body.description,
    category: body.category,
    priority: body.priority,
    status: body.status ?? "open",
    submittedBy: body.submittedBy,
  }).returning();
  return res.status(201).json({ ...ticket, createdAt: ticket.createdAt.toISOString(), updatedAt: ticket.updatedAt.toISOString() });
});

router.put("/tickets/:id", async (req, res) => {
  const body = req.body;
  const [ticket] = await db.update(supportTicketsTable).set({
    title: body.title,
    description: body.description,
    category: body.category,
    priority: body.priority,
    status: body.status,
    submittedBy: body.submittedBy,
    updatedAt: new Date(),
  }).where(eq(supportTicketsTable.id, Number(req.params.id))).returning();
  if (!ticket) return res.status(404).json({ error: "Not found" });
  return res.json({ ...ticket, createdAt: ticket.createdAt.toISOString(), updatedAt: ticket.updatedAt.toISOString() });
});

export default router;
