// GET /api/auth/init
// Initializes the database schema and seeds demo data
// Call this on app startup

import { NextResponse } from "next/server";
import { initSchema } from "@/lib/db/schema";
import { seedData } from "@/lib/db/seed";

let initialized = false;

export async function GET() {
  if (initialized) {
    return NextResponse.json({ ok: true, message: "Already initialized" });
  }

  try {
    console.log("[Init] Running schema initialization...");
    initSchema();

    console.log("[Init] Seeding demo data...");
    await seedData();

    initialized = true;
    console.log("[Init] Database initialized successfully");

    return NextResponse.json({
      ok: true,
      message: "Database initialized with demo data",
      credentials: {
        admin: { email: "admin@demo.com", password: "admin123" },
        franchise: { email: "franchise@demo.com", password: "franchise123" },
        advertiser: { email: "advertiser@demo.com", password: "advertiser123" },
      },
    });
  } catch (err: any) {
    console.error("[Init] Error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
