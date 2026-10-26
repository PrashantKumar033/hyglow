import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, rolesTable, promotionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword } from "../lib/password.js";

const router = Router();

// Users
router.get("/users", async (_req, res) => {
  const users = await db.select().from(usersTable).orderBy(usersTable.name);
  return res.json(users.map(u => ({
    id: u.id, name: u.name, email: u.email, role: u.role, company: u.company, avatar: u.avatar,
    createdAt: u.createdAt.toISOString(),
  })));
});

router.post("/users", async (req, res) => {
  const body = req.body;
  if (typeof body?.password !== "string" || body.password.length < 8 || body.password.length > 128) {
    return res.status(400).json({ error: "A password between 8 and 128 characters is required" });
  }
  const [user] = await db.insert(usersTable).values({
    name: body.name,
    email: body.email,
    passwordHash: hashPassword(body.password),
    role: body.role ?? "user",
    company: body.company,
  }).returning();
  return res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, company: user.company, avatar: user.avatar, createdAt: user.createdAt.toISOString() });
});

router.put("/users/:id", async (req, res) => {
  const body = req.body;
  const updates: Partial<typeof usersTable.$inferInsert> = {
    name: body.name, email: body.email, role: body.role, company: body.company,
  };
  if (body.password) {
    if (typeof body.password !== "string" || body.password.length < 8 || body.password.length > 128) {
      return res.status(400).json({ error: "Password must be between 8 and 128 characters" });
    }
    updates.passwordHash = hashPassword(body.password);
  }
  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, Number(req.params.id))).returning();
  if (!user) return res.status(404).json({ error: "Not found" });
  return res.json({ id: user.id, name: user.name, email: user.email, role: user.role, company: user.company, avatar: user.avatar, createdAt: user.createdAt.toISOString() });
});

router.delete("/users/:id", async (req, res) => {
  await db.delete(usersTable).where(eq(usersTable.id, Number(req.params.id)));
  return res.status(204).end();
});

router.get("/users/:id/sidebar-permissions", async (req, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, Number(req.params.id)));
  if (!user) return res.status(404).json({ error: "Not found" });
  return res.json({ sidebarPermissions: user.sidebarPermissions ?? null });
});

router.put("/users/:id/sidebar-permissions", async (req, res) => {
  const permissions = req.body.sidebarPermissions;
  const [user] = await db.update(usersTable)
    .set({ sidebarPermissions: permissions ? JSON.stringify(permissions) : null })
    .where(eq(usersTable.id, Number(req.params.id)))
    .returning();
  if (!user) return res.status(404).json({ error: "Not found" });
  return res.json({ sidebarPermissions: user.sidebarPermissions ?? null });
});

// Roles
router.get("/roles", async (_req, res) => {
  const roles = await db.select().from(rolesTable).orderBy(rolesTable.name);
  return res.json(roles.map(r => ({ ...r, permissions: JSON.parse(r.permissions), createdAt: undefined })));
});

router.post("/roles", async (req, res) => {
  const body = req.body;
  const [role] = await db.insert(rolesTable).values({
    name: body.name,
    description: body.description,
    permissions: JSON.stringify(body.permissions ?? []),
    userCount: 0,
  }).returning();
  return res.status(201).json({ ...role, permissions: JSON.parse(role.permissions), createdAt: undefined });
});

router.put("/roles/:id", async (req, res) => {
  const body = req.body;
  const [role] = await db.update(rolesTable).set({
    name: body.name,
    description: body.description,
    permissions: JSON.stringify(body.permissions ?? []),
  }).where(eq(rolesTable.id, Number(req.params.id))).returning();
  if (!role) return res.status(404).json({ error: "Not found" });
  return res.json({ ...role, permissions: JSON.parse(role.permissions), createdAt: undefined });
});

router.delete("/roles/:id", async (req, res) => {
  await db.delete(rolesTable).where(eq(rolesTable.id, Number(req.params.id)));
  return res.status(204).end();
});

// Promotions
router.get("/promotions", async (_req, res) => {
  const promotions = await db.select().from(promotionsTable).orderBy(promotionsTable.startDate);
  return res.json(promotions.map(p => ({ ...p, createdAt: undefined })));
});

router.post("/promotions", async (req, res) => {
  const body = req.body;
  const [promo] = await db.insert(promotionsTable).values({
    title: body.title,
    code: body.code,
    type: body.type,
    discount: body.discount,
    startDate: body.startDate,
    endDate: body.endDate,
    status: body.status,
    usageCount: 0,
    usageLimit: body.usageLimit ?? null,
  }).returning();
  return res.status(201).json(promo);
});

router.put("/promotions/:id", async (req, res) => {
  const body = req.body;
  const [promo] = await db.update(promotionsTable).set({
    title: body.title,
    code: body.code,
    type: body.type,
    discount: body.discount,
    startDate: body.startDate,
    endDate: body.endDate,
    status: body.status,
    usageLimit: body.usageLimit ?? null,
  }).where(eq(promotionsTable.id, Number(req.params.id))).returning();
  if (!promo) return res.status(404).json({ error: "Not found" });
  return res.json(promo);
});

router.delete("/promotions/:id", async (req, res) => {
  await db.delete(promotionsTable).where(eq(promotionsTable.id, Number(req.params.id)));
  return res.status(204).end();
});

export default router;
