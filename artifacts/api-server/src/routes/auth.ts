import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { signToken, verifyToken } from "../lib/token.js";
import { hashPassword, isLegacyPasswordHash, verifyPassword } from "../lib/password.js";

const router = Router();

const credentialsSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(1).max(128),
});

const signupSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
  company: z.string().trim().min(1).max(160),
});

function toPublicUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    company: user.company,
    avatar: user.avatar,
    sidebarPermissions: user.sidebarPermissions ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

export function getUserIdFromToken(token: string): number | null {
  return verifyToken(token);
}

router.post("/login", async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Valid email and password are required" });
  }

  const email = parsed.data.email.toLowerCase();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Upgrade old unsalted SHA-256 credentials on successful login.
  if (isLegacyPasswordHash(user.passwordHash)) {
    await db.update(usersTable)
      .set({ passwordHash: hashPassword(parsed.data.password) })
      .where(eq(usersTable.id, user.id));
  }

  return res.json({ token: signToken(user.id), user: toPublicUser(user) });
});

router.post("/signup", async (req, res) => {
  if (process.env.ALLOW_SIGNUP !== "true") {
    return res.status(403).json({ error: "Signup is disabled" });
  }

  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Please provide valid signup details" });
  }

  const data = parsed.data;
  const email = data.email.toLowerCase();
  const [existingUser] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email));
  if (existingUser) {
    return res.status(409).json({ error: "Email already registered" });
  }

  // Public registration must never grant administrative privileges.
  const [user] = await db.insert(usersTable).values({
    name: data.name,
    email,
    passwordHash: hashPassword(data.password),
    role: "user",
    company: data.company,
  }).returning();

  return res.status(201).json({ token: signToken(user.id), user: toPublicUser(user) });
});

router.post("/logout", (_req, res) => {
  // Tokens are stateless; the client clears its local copy on logout.
  return res.json({ success: true });
});

router.get("/me", async (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const userId = token ? verifyToken(token) : null;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json(toPublicUser(user));
});

export default router;
