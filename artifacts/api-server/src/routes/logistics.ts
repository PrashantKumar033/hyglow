import { Router } from "express";
import { db } from "@workspace/db";
import { shipmentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

let shipCounter = 1000;
function nextTrackingNumber() { return `SHP-${String(++shipCounter).padStart(4, "0")}`; }

router.get("/shipments", async (_req, res) => {
  const shipments = await db.select().from(shipmentsTable).orderBy(shipmentsTable.shipDate);
  return res.json(shipments.map(s => ({ ...s, createdAt: undefined })));
});

router.post("/shipments", async (req, res) => {
  const body = req.body;
  const [shipment] = await db.insert(shipmentsTable).values({
    trackingNumber: nextTrackingNumber(),
    origin: body.origin,
    destination: body.destination,
    carrier: body.carrier,
    status: body.status,
    shipDate: body.shipDate,
    estimatedDelivery: body.estimatedDelivery ?? null,
    weight: body.weight,
    description: body.description,
  }).returning();
  return res.status(201).json(shipment);
});

router.get("/shipments/:id", async (req, res) => {
  const [shipment] = await db.select().from(shipmentsTable).where(eq(shipmentsTable.id, Number(req.params.id)));
  if (!shipment) return res.status(404).json({ error: "Not found" });
  return res.json(shipment);
});

router.put("/shipments/:id", async (req, res) => {
  const body = req.body;
  const [shipment] = await db.update(shipmentsTable).set({
    origin: body.origin,
    destination: body.destination,
    carrier: body.carrier,
    status: body.status,
    shipDate: body.shipDate,
    estimatedDelivery: body.estimatedDelivery ?? null,
    weight: body.weight,
    description: body.description,
  }).where(eq(shipmentsTable.id, Number(req.params.id))).returning();
  if (!shipment) return res.status(404).json({ error: "Not found" });
  return res.json(shipment);
});

router.get("/tracking/:trackingNumber", async (req, res) => {
  const trackingNumber = req.params.trackingNumber;
  const [shipment] = await db.select().from(shipmentsTable).where(eq(shipmentsTable.trackingNumber, trackingNumber));
  if (!shipment) {
    return res.status(404).json({ error: "Tracking number not found" });
  }
  const events = [
    { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), location: shipment.origin, description: "Package picked up" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), location: "Distribution Center", description: "Package arrived at sorting facility" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), location: "Regional Hub", description: "Package in transit" },
    { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), location: "Local Delivery Center", description: "Out for delivery" },
  ];
  return res.json({
    trackingNumber: shipment.trackingNumber,
    status: shipment.status,
    currentLocation: events[events.length - 1].location,
    estimatedDelivery: shipment.estimatedDelivery ?? "TBD",
    events,
  });
});

export default router;
