import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/token.js";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

// Paths (relative to /api) that work without a token.
const PUBLIC_PATHS = new Set(["/healthz", "/auth/login", "/auth/signup"]);

const PATH_MODULES: Array<[string, string]> = [
  ["/dashboard", "dashboard"],
  ["/ledger", "ledger"],
  ["/employees", "hr"],
  ["/hr", "hr"],
  ["/sales", "sales"],
  ["/products", "products"],
  ["/inventory", "inventory"],
  ["/purchase-orders", "purchase_orders"],
  ["/sales-orders", "sales_orders"],
  ["/invoices", "invoices"],
  ["/expenses", "expenses"],
  ["/reports", "reports"],
  ["/tracking", "tracking"],
  ["/shipments", "logistics"],
  ["/notifications", "notifications"],
  ["/messages", "messages"],
  ["/support", "support"],
];

const DEFAULT_USER_PERMISSIONS: Record<string, { view: boolean; use: boolean; edit: boolean; delete: boolean }> = {
  dashboard: { view: true, use: true, edit: false, delete: false },
  notifications: { view: true, use: true, edit: false, delete: false },
  messages: { view: true, use: true, edit: false, delete: false },
  support: { view: true, use: true, edit: false, delete: false },
};

function getModule(path: string): string | null {
  return PATH_MODULES.find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`))?.[1] ?? null;
}

function getPermissionLevel(method: string, path: string): "view" | "use" | "edit" | "delete" {
  if (method === "GET" || method === "HEAD") return "view";
  if (method === "DELETE") return "delete";
  if (method === "POST" && (path === "/messages" || path === "/support/tickets")) return "use";
  return "edit";
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.method === "OPTIONS" || PUBLIC_PATHS.has(req.path)) return next();

  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const userId = token ? verifyToken(token) : null;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  // Reject tokens belonging to deleted accounts, and enforce the admin
  // boundary at the API layer instead of relying on hidden frontend links.
  const [user] = await db.select({
    id: usersTable.id,
    role: usersTable.role,
    sidebarPermissions: usersTable.sidebarPermissions,
  })
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  if (req.path.startsWith("/admin") && user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (user.role !== "admin" && req.path !== "/auth/logout" && req.path !== "/auth/me" && !req.path.startsWith("/profile")) {
    const module = getModule(req.path);
    if (!module) return res.status(404).json({ error: "Not found" });

    let permissions: Record<string, Partial<Record<"view" | "use" | "edit" | "delete", unknown>>> = DEFAULT_USER_PERMISSIONS;
    if (user.sidebarPermissions) {
      try {
        const parsed = JSON.parse(user.sidebarPermissions);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          permissions = parsed as typeof permissions;
        }
      } catch {
        // Invalid stored preferences fall back to the least-privileged defaults.
      }
    }

    const level = getPermissionLevel(req.method, req.path);
    if (permissions[module]?.[level] !== true) {
      return res.status(403).json({ error: "Forbidden" });
    }
  }

  return next();
}
