import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const supabase = await createClient();
    const { name } = await request.json();

    // Find screen with this pairing code
    const { data: screen, error: findError } = await supabase
      .from("screens")
      .select("*")
      .eq("pairing_code", code)
      .is("paired_at", null)
      .single();

    if (findError || !screen) {
      return NextResponse.json({ error: "Invalid or expired pairing code" }, { status: 404 });
    }

    // Check expiry
    if (new Date(screen.pairing_expires_at) < new Date()) {
      return NextResponse.json({ error: "Pairing code has expired" }, { status: 410 });
    }

    // Update screen
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
      return NextResponse.json({ error: "Failed to pair screen" }, { status: 500 });
    }

    return NextResponse.json({ screen: updated });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
