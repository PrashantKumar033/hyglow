import * as crypto from "node:crypto";
import { db, pool } from "./index";
import { usersTable } from "./schema";

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const derivedKey = crypto.scryptSync(password, salt, 64, {
    N: 1 << 14,
    r: 8,
    p: 1,
    maxmem: 32 * 1024 * 1024,
  });
  return `scrypt$${salt.toString("base64url")}$${derivedKey.toString("base64url")}`;
}

async function bootstrapAdmin() {
  const name = process.env.BOOTSTRAP_ADMIN_NAME?.trim();
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const company = process.env.BOOTSTRAP_ADMIN_COMPANY?.trim() || "Hyglow";

  if (!name || !email || !password || password.length < 12 || password.length > 128) {
    throw new Error("Set BOOTSTRAP_ADMIN_NAME, BOOTSTRAP_ADMIN_EMAIL, and a 12–128 character BOOTSTRAP_ADMIN_PASSWORD.");
  }

  const existingUsers = await db.select({ id: usersTable.id }).from(usersTable).limit(1);
  if (existingUsers.length > 0) {
    throw new Error("Admin bootstrap only runs on an empty users table; no data was changed.");
  }

  await db.insert(usersTable).values({
    name,
    email,
    passwordHash: hashPassword(password),
    role: "admin",
    company,
  });

  console.log(`Created the initial admin account for ${email}.`);
}

bootstrapAdmin()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
