import * as crypto from "node:crypto";

const KEY_LENGTH = 64;
const SCRYPT_OPTIONS = { N: 1 << 14, r: 8, p: 1, maxmem: 32 * 1024 * 1024 };

/** Store new passwords as salted scrypt hashes. */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH, SCRYPT_OPTIONS);
  return `scrypt$${salt.toString("base64url")}$${derivedKey.toString("base64url")}`;
}

/** Accept the previous SHA-256 format so existing accounts can sign in once. */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (storedHash.startsWith("scrypt$")) {
    const [, saltText, keyText] = storedHash.split("$");
    if (!saltText || !keyText) return false;

    try {
      const salt = Buffer.from(saltText, "base64url");
      const expected = Buffer.from(keyText, "base64url");
      if (salt.length !== 16 || expected.length !== KEY_LENGTH) return false;
      const actual = crypto.scryptSync(password, salt, KEY_LENGTH, SCRYPT_OPTIONS);
      return crypto.timingSafeEqual(actual, expected);
    } catch {
      return false;
    }
  }

  if (!/^[a-f\d]{64}$/i.test(storedHash)) return false;
  const actual = crypto.createHash("sha256").update(password).digest();
  const expected = Buffer.from(storedHash, "hex");
  return expected.length === actual.length && crypto.timingSafeEqual(actual, expected);
}

export function isLegacyPasswordHash(storedHash: string): boolean {
  return /^[a-f\d]{64}$/i.test(storedHash);
}
