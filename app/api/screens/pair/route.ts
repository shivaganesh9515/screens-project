import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { PairScreenSchema } from "@/lib/api/validation";

function generatePairingCode(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0"))
    .join("")
    .toUpperCase()
    .slice(0, 6);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = PairScreenSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid input", parsed.error.flatten().fieldErrors);
    }

    const { supabase, user } = await requireAuth();
    const { name, group_id } = parsed.data;

    const { data: member } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", user.id)
      .single();

    if (!member) {
      throw new ApiError(403, "FORBIDDEN", "No organization found");
    }

    // Validate group_id belongs to this org if provided
    if (group_id) {
      const { data: group } = await supabase
        .from("screen_groups")
        .select("id")
        .eq("id", group_id)
        .eq("org_id", member.org_id)
        .single();

      if (!group) {
        throw new ApiError(400, "INVALID_GROUP", "Screen group not found in this organization");
      }
    }

    const code = generatePairingCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { data: screen, error } = await supabase
      .from("screens")
      .insert({
        org_id: member.org_id,
        name: name ?? "New Screen",
        group_id: group_id || null,
        pairing_code: code,
        pairing_expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) {
      console.error("[Pair] Insert error:", error);
      throw new ApiError(500, "CREATE_FAILED", "Failed to create screen");
    }

    return NextResponse.json({ code, screen_id: screen.id, expires_at: expiresAt });
  } catch (error) {
    return handleApiError(error, "screens/pair POST");
  }
}
