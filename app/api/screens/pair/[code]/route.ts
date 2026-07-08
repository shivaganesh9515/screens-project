import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { name } = await request.json();

    let supabase;
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient } = await import("@supabase/supabase-js");
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
    } else {
      const { createClient } = await import("@/lib/supabase/server");
      supabase = await createClient();
    }

    const { data: screen, error: findError } = await supabase
      .from("screens")
      .select("*")
      .eq("pairing_code", code)
      .is("paired_at", null)
      .single();

    if (findError || !screen) {
      return NextResponse.json({ error: "Invalid or expired pairing code" }, { status: 404 });
    }

    if (new Date(screen.pairing_expires_at) < new Date()) {
      return NextResponse.json({ error: "Pairing code has expired" }, { status: 410 });
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
      return NextResponse.json({ error: "Failed to pair screen" }, { status: 500 });
    }

    return NextResponse.json({ screen: updated });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
