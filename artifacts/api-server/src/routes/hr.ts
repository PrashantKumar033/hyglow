import { Router } from "express";
import { db } from "@workspace/db";
import { employeesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  const employees = await db.select().from(employeesTable).orderBy(employeesTable.name);
  return res.json(employees.map(e => ({ ...e, createdAt: undefined })));
});

router.post("/", async (req, res) => {
  const body = req.body;
  const [employee] = await db.insert(employeesTable).values({
    name: body.name,
    email: body.email,
    department: body.department,
    position: body.position,
    salary: body.salary,
    status: body.status ?? "active",
    joinDate: body.joinDate,
    phone: body.phone ?? null,
    avatar: null,
  }).returning();
  return res.status(201).json(employee);
});

router.get("/department-stats", async (_req, res) => {
  const stats = await db.select({
    department: employeesTable.department,
    count: sql<number>`count(*)`,
    avgSalary: sql<number>`round(avg(salary)::numeric, 2)`,
  }).from(employeesTable).groupBy(employeesTable.department);
  return res.json(stats);
});

router.get("/:id", async (req, res) => {
  const [employee] = await db.select().from(employeesTable).where(eq(employeesTable.id, Number(req.params.id)));
  if (!employee) return res.status(404).json({ error: "Not found" });
  return res.json(employee);
});

router.put("/:id", async (req, res) => {
  const body = req.body;
  const [employee] = await db.update(employeesTable).set({
    name: body.name,
    email: body.email,
    department: body.department,
    position: body.position,
    salary: body.salary,
    status: body.status,
    joinDate: body.joinDate,
    phone: body.phone ?? null,
  }).where(eq(employeesTable.id, Number(req.params.id))).returning();
  if (!employee) return res.status(404).json({ error: "Not found" });
  return res.json(employee);
});

router.delete("/:id", async (req, res) => {
  await db.delete(employeesTable).where(eq(employeesTable.id, Number(req.params.id)));
  return res.status(204).end();
});

export default router;
