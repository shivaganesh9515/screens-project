// SQLite database connection singleton
// Uses better-sqlite3 for zero-config local persistence

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DB_DIR, "screens.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    db = new Database(DB_PATH);

    // Enable WAL mode for better concurrent read performance
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");

    console.log("[DB] SQLite database initialized at:", DB_PATH);
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
    console.log("[DB] SQLite database closed");
  }
}

export function getDbPath(): string {
  return DB_PATH;
}
