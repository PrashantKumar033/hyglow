import { Router } from "express";
import { db } from "@workspace/db";
import {
  salesTable, employeesTable, productsTable, invoicesTable,
  shipmentsTable, expensesTable, inventoryTable, ledgerEntriesTable,
  notificationsTable, supportTicketsTable
} from "@workspace/db";
import { sql, count } from "drizzle-orm";

const router = Router();

router.get("/summary", async (_req, res) => {
  const [
    [salesResult], [expenseResult], [orderResult], [empResult], [prodResult],
    [invoiceResult], [lowStockResult], [shipResult], [notifResult], [ticketResult]
  ] = await Promise.all([
    db.select({ total: sql<number>`coalesce(sum(amount), 0)` }).from(salesTable),
    db.select({ total: sql<number>`coalesce(sum(amount), 0)` }).from(expensesTable),
    db.select({ cnt: count() }).from(salesTable),
    db.select({ cnt: count() }).from(employeesTable),
    db.select({ cnt: count() }).from(productsTable),
    db.select({ cnt: sql<number>`count(*) filter (where status = 'pending')` }).from(invoicesTable),
    db.select({ cnt: sql<number>`count(*) filter (where quantity < min_stock)` }).from(inventoryTable),
    db.select({ cnt: sql<number>`count(*) filter (where status = 'in-transit')` }).from(shipmentsTable),
    db.select({ cnt: sql<number>`count(*) filter (where read = false)` }).from(notificationsTable),
    db.select({ cnt: sql<number>`count(*) filter (where status = 'open')` }).from(supportTicketsTable),
  ]);

  return res.json({
    totalRevenue: salesResult?.total ?? 0,
    totalExpenses: expenseResult?.total ?? 0,
    totalOrders: orderResult?.cnt ?? 0,
    totalEmployees: empResult?.cnt ?? 0,
    totalProducts: prodResult?.cnt ?? 0,
    pendingInvoices: invoiceResult?.cnt ?? 0,
    lowStockItems: lowStockResult?.cnt ?? 0,
    activeShipments: shipResult?.cnt ?? 0,
    unreadNotifications: notifResult?.cnt ?? 0,
    openTickets: ticketResult?.cnt ?? 0,
    revenueGrowth: 12.5,
    expenseGrowth: 4.2,
    ordersGrowth: 8.3,
  });
});

router.get("/recent-activity", async (_req, res) => {
  const activities = [
    { id: 1, type: "sale", description: "New sale recorded for Acme Corp – $14,997", user: "Marcus Johnson", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { id: 2, type: "invoice", description: "Invoice INV-0002 sent to TechNova Ltd", user: "Priya Patel", timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
    { id: 3, type: "shipment", description: "Shipment SHP-1001 in transit to Los Angeles", user: "Aisha Okonkwo", timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
    { id: 4, type: "expense", description: "Travel expense approved – $3,800", user: "Tom Williams", timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
    { id: 5, type: "employee", description: "New employee added: Priya Patel (CFO)", user: "Admin", timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString() },
    { id: 6, type: "order", description: "Purchase Order PO-0001 approved – Dell Technologies", user: "Tom Williams", timestamp: new Date(Date.now() - 1000 * 60 * 200).toISOString() },
  ];
  return res.json(activities);
});

router.get("/revenue-chart", async (_req, res) => {
  const months = [
    { month: "Jan", revenue: 45000, expenses: 32000 },
    { month: "Feb", revenue: 52000, expenses: 35000 },
    { month: "Mar", revenue: 48000, expenses: 31000 },
    { month: "Apr", revenue: 61000, expenses: 38000 },
    { month: "May", revenue: 55000, expenses: 36000 },
    { month: "Jun", revenue: 67000, expenses: 40000 },
    { month: "Jul", revenue: 72000, expenses: 42000 },
    { month: "Aug", revenue: 68000, expenses: 39000 },
    { month: "Sep", revenue: 74000, expenses: 44000 },
    { month: "Oct", revenue: 81000, expenses: 46000 },
    { month: "Nov", revenue: 78000, expenses: 43000 },
    { month: "Dec", revenue: 92000, expenses: 51000 },
  ];
  return res.json(months);
});

export default router;
