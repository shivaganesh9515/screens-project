// User database operations
// Separated from session.ts so Edge middleware doesn't import better-sqlite3

import { getDb } from "@/lib/db/connection";

export function getUserById(userId: string): { id: string; email: string; full_name: string; role: string } | null {
  const db = getDb();
  const user = db.prepare("SELECT id, email, full_name, role FROM users WHERE id = ?").get(userId) as any;
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
  };
}

export function getUserByEmail(email: string): { id: string; email: string; password_hash: string; full_name: string; role: string } | null {
  const db = getDb();
  const user = db.prepare("SELECT id, email, password_hash, full_name, role FROM users WHERE email = ?").get(email) as any;
  return user || null;
}
