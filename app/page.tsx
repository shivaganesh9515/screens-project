import { redirect } from "next/navigation";
import { initSchema } from "@/lib/db/schema";
import { seedData } from "@/lib/db/seed";

// Initialize database on first server start
let initialized = false;

async function ensureDbInitialized() {
  if (initialized) return;
  try {
    initSchema();
    await seedData();
    initialized = true;
    console.log("\n========================================");
    console.log("  Database initialized!");
    console.log("  Admin:      admin@demo.com / admin123");
    console.log("  Franchise:  franchise@demo.com / franchise123");
    console.log("  Advertiser: advertiser@demo.com / advertiser123");
    console.log("========================================\n");
  } catch (err) {
    console.error("[Init] DB initialization error:", err);
  }
}

export default async function Home() {
  await ensureDbInitialized();
  redirect("/overview");
}
