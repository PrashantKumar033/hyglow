import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  const products = await db.select().from(productsTable).orderBy(productsTable.name);
  return res.json(products.map(p => ({ ...p, createdAt: undefined })));
});

router.post("/", async (req, res) => {
  const body = req.body;
  const [product] = await db.insert(productsTable).values({
    name: body.name,
    sku: body.sku,
    category: body.category,
    price: body.price,
    cost: body.cost,
    stock: body.stock,
    unit: body.unit,
    description: body.description ?? null,
    status: body.status,
  }).returning();
  return res.status(201).json(product);
});

router.get("/:id", async (req, res) => {
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, Number(req.params.id)));
  if (!product) return res.status(404).json({ error: "Not found" });
  return res.json(product);
});

router.put("/:id", async (req, res) => {
  const body = req.body;
  const [product] = await db.update(productsTable).set({
    name: body.name,
    sku: body.sku,
    category: body.category,
    price: body.price,
    cost: body.cost,
    stock: body.stock,
    unit: body.unit,
    description: body.description ?? null,
    status: body.status,
  }).where(eq(productsTable.id, Number(req.params.id))).returning();
  if (!product) return res.status(404).json({ error: "Not found" });
  return res.json(product);
});

router.delete("/:id", async (req, res) => {
  await db.delete(productsTable).where(eq(productsTable.id, Number(req.params.id)));
  return res.status(204).end();
});

export default router;
