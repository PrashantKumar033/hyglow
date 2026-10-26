import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getUserIdFromToken } from "./auth.js";
import { hashPassword, verifyPassword } from "../lib/password.js";

const router = Router();

function getAuthUserId(req: any): number | null {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const token = auth.replace("Bearer ", "");
  return getUserIdFromToken(token);
}

router.get("/", async (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) return res.status(404).json({ error: "Not found" });
  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: null,
    company: user.company,
    position: user.role,
    avatar: user.avatar,
    timezone: "UTC",
    language: "en",
    notifications: true,
    twoFactor: false,
  });
});

router.put("/", async (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const body = req.body;
  const [user] = await db.update(usersTable).set({
    name: body.name,
    company: body.company,
    avatar: body.avatar ?? null,
  }).where(eq(usersTable.id, userId)).returning();
  if (!user) return res.status(404).json({ error: "Not found" });
  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: body.phone ?? null,
    company: user.company,
    position: body.position ?? user.role,
    avatar: user.avatar,
    timezone: body.timezone ?? "UTC",
    language: body.language ?? "en",
    notifications: body.notifications ?? true,
    twoFactor: body.twoFactor ?? false,
  });
});

router.post("/change-password", async (req, res) => {
  const userId = getAuthUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const body = req.body;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) return res.status(404).json({ error: "Not found" });
  if (typeof body.currentPassword !== "string" || !verifyPassword(body.currentPassword, user.passwordHash)) {
    return res.status(400).json({ error: "Current password is incorrect" });
  }
  if (typeof body.newPassword !== "string" || body.newPassword.length < 8 || body.newPassword.length > 128) {
    return res.status(400).json({ error: "New password must be between 8 and 128 characters" });
  }
  await db.update(usersTable).set({ passwordHash: hashPassword(body.newPassword) }).where(eq(usersTable.id, userId));
  return res.json({ success: true });
});

export default router;
