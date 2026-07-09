import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/api/auth";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { PairCompleteSchema } from "@/lib/api/validation";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code || code.length < 4) {
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid pairing code");
    }

    const body = await request.json();
    const parsed = PairCompleteSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid input", parsed.error.flatten().fieldErrors);
    }

    const { name } = parsed.data;
    const supabase = await getServiceClient();

    const { data: screen, error: findError } = await supabase
      .from("screens")
      .select("*")
      .eq("pairing_code", code)
      .is("paired_at", null)
      .single();

    if (findError || !screen) {
      throw new ApiError(404, "NOT_FOUND", "Invalid or expired pairing code");
    }

    if (new Date(screen.pairing_expires_at) < new Date()) {
      throw new ApiError(410, "EXPIRED", "Pairing code has expired");
    }

    const { data: updated, error: updateError } = await supabase
      .from("screens")
      .update({
        name: name ?? screen.name,
        paired_at: new Date().toISOString(),
        pairing_code: null,
        pairing_expires_at: null,
      })
      .eq("id", screen.id)
      .select()
      .single();

    if (updateError) {
      console.error("[PairComplete] Update error:", updateError);
      throw new ApiError(500, "UPDATE_FAILED", "Failed to pair screen");
    }

    return NextResponse.json({ screen: updated });
  } catch (error) {
    return handleApiError(error, "screens/pair/[code] PUT");
  }
}
