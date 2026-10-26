import { Router } from "express";
import { db } from "@workspace/db";
import { salesTable, expensesTable, inventoryTable, productsTable } from "@workspace/db";
import { sql, count } from "drizzle-orm";

const router = Router();

router.get("/financial", async (_req, res) => {
  const [[salesResult], [expenseResult]] = await Promise.all([
    db.select({ total: sql<number>`coalesce(sum(amount), 0)` }).from(salesTable),
    db.select({ total: sql<number>`coalesce(sum(amount), 0)` }).from(expensesTable),
  ]);
  const totalRevenue = salesResult?.total ?? 0;
  const totalExpenses = expenseResult?.total ?? 0;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const monthlyData = [
    { month: "Jan", revenue: 45000, expenses: 32000 },
    { month: "Feb", revenue: 52000, expenses: 35000 },
    { month: "Mar", revenue: 48000, expenses: 31000 },
    { month: "Apr", revenue: 61000, expenses: 38000 },
    { month: "May", revenue: 55000, expenses: 36000 },
    { month: "Jun", revenue: 67000, expenses: 40000 },
  ];

  return res.json({ totalRevenue, totalExpenses, netProfit, profitMargin, monthlyData });
});

router.get("/sales", async (_req, res) => {
  const [[salesResult], [countResult]] = await Promise.all([
    db.select({ total: sql<number>`coalesce(sum(amount), 0)` }).from(salesTable),
    db.select({ cnt: count() }).from(salesTable),
  ]);
  const totalSales = salesResult?.total ?? 0;
  const totalOrders = countResult?.cnt ?? 0;
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  const topProducts = await db.select({
    customer: salesTable.product,
    totalSales: sql<number>`sum(amount)`,
    orderCount: sql<number>`count(*)`,
  }).from(salesTable).groupBy(salesTable.product).orderBy(sql`sum(amount) desc`).limit(5);

  return res.json({ totalSales, totalOrders, avgOrderValue, topProducts });
});

router.get("/inventory", async (_req, res) => {
  const [[totalResult], [lowResult], [outResult]] = await Promise.all([
    db.select({ cnt: count() }).from(inventoryTable),
    db.select({ cnt: sql<number>`count(*) filter (where quantity < min_stock)` }).from(inventoryTable),
    db.select({ cnt: sql<number>`count(*) filter (where quantity = 0)` }).from(inventoryTable),
  ]);

  const allItems = await db.select().from(inventoryTable);
  const allProducts = await db.select().from(productsTable);
  const productMap = new Map(allProducts.map(p => [p.id, p.price]));
  const totalValue = allItems.reduce((sum, item) => {
    const price = productMap.get(item.productId) ?? 0;
    return sum + item.quantity * price;
  }, 0);

  const categoryBreakdown = allProducts.reduce((acc, p) => {
    const inv = allItems.find(i => i.productId === p.id);
    const qty = inv?.quantity ?? 0;
    acc[p.category] = (acc[p.category] ?? 0) + qty * p.price;
    return acc;
  }, {} as Record<string, number>);

  return res.json({
    totalItems: totalResult?.cnt ?? 0,
    totalValue: Math.round(totalValue),
    lowStockCount: lowResult?.cnt ?? 0,
    outOfStockCount: outResult?.cnt ?? 0,
    categoryBreakdown: Object.entries(categoryBreakdown).map(([category, value]) => ({ category, value: Math.round(value) })),
  });
});

export default router;
