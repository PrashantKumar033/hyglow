import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
// import { z } from "zod";
import * as crypto from "crypto";
import { signToken, verifyToken } from "../lib/token.js";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function getUserIdFromToken(token: string): number | null {
  return verifyToken(token);
}

router.post("/login", async (req, res) => {
  const body = req.body as { email: string; password: string };
  if (!body.email || !body.password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, body.email));
  if (!user || user.passwordHash !== hashPassword(body.password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = signToken(user.id);
  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      avatar: user.avatar,
      sidebarPermissions: user.sidebarPermissions ?? null,
      createdAt: user.createdAt.toISOString(),
    },
  });
});

router.post("/signup", async (req, res) => {
  // Public signup creates an ADMIN account, so keep it closed unless you opt in.
  if (process.env.ALLOW_SIGNUP !== "true") {
    return res.status(403).json({ error: "Signup is disabled" });
  }
  const body = req.body as { name: string; email: string; password: string; company: string };
  if (!body.name || !body.email || !body.password || !body.company) {
    return res.status(400).json({ error: "All fields required" });
  }
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, body.email));
  if (existing.length > 0) {
    return res.status(400).json({ error: "Email already registered" });
  }
  const [user] = await db.insert(usersTable).values({
    name: body.name,
    email: body.email,
    passwordHash: hashPassword(body.password),
    role: "admin",
    company: body.company,
  }).returning();
  const token = signToken(user.id);
  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      avatar: user.avatar,
      sidebarPermissions: user.sidebarPermissions ?? null,
      createdAt: user.createdAt.toISOString(),
    },
  });
});

// Tokens are stateless: logging out = the browser deleting its copy.
router.post("/logout", (_req, res) => {
  return res.json({ success: true });
});

router.get("/me", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Unauthorized" });
  const token = auth.replace("Bearer ", "");
  const userId = verifyToken(token);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    company: user.company,
    avatar: user.avatar,
    sidebarPermissions: user.sidebarPermissions ?? null,
    createdAt: user.createdAt.toISOString(),
  });
});

export default router;
