import { Router } from "express";
import { db } from "@workspace/db";
import { messagesTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  const messages = await db.select().from(messagesTable).orderBy(desc(messagesTable.createdAt));
  return res.json(messages.map(m => ({
    id: m.id,
    sender: m.sender,
    senderAvatar: m.senderAvatar,
    content: m.content,
    timestamp: m.createdAt.toISOString(),
    read: m.read,
  })));
});

router.post("/", async (req, res) => {
  const body = req.body;
  const [message] = await db.insert(messagesTable).values({
    sender: "You",
    senderAvatar: null,
    recipient: body.recipient,
    content: body.content,
    read: false,
  }).returning();
  return res.status(201).json({
    id: message.id,
    sender: message.sender,
    senderAvatar: message.senderAvatar,
    content: message.content,
    timestamp: message.createdAt.toISOString(),
    read: message.read,
  });
});

export default router;
