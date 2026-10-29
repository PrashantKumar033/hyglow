import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/token.js";

// Paths (relative to /api) that work without a token.
const PUBLIC_PATHS = new Set(["/healthz", "/auth/login", "/auth/signup"]);

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.method === "OPTIONS" || PUBLIC_PATHS.has(req.path)) return next();

  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const userId = token ? verifyToken(token) : null;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  return next();
}
