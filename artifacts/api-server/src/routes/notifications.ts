import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  const notifications = await db.select().from(notificationsTable).orderBy(notificationsTable.createdAt);
  return res.json(notifications.map(n => ({ ...n, createdAt: n.createdAt.toISOString() })));
});

router.patch("/:id/read", async (req, res) => {
  const [notification] = await db.update(notificationsTable).set({ read: true }).where(eq(notificationsTable.id, Number(req.params.id))).returning();
  if (!notification) return res.status(404).json({ error: "Not found" });
  return res.json({ ...notification, createdAt: notification.createdAt.toISOString() });
});

router.patch("/mark-all-read", async (_req, res) => {
  await db.update(notificationsTable).set({ read: true });
  return res.json({ success: true });
});

export default router;
