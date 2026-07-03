import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { org_id, file_name } = await request.json();

    if (!org_id || !file_name) {
      return NextResponse.json({ error: "org_id and file_name are required" }, { status: 400 });
    }

    const fileExt = file_name.split(".").pop();
    const filePath = `${org_id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;

    // Generate presigned URL for direct upload
    const { data, error } = await supabase.storage
      .from("media")
      .createSignedUploadUrl(filePath);

    if (error) {
      return NextResponse.json({ error: "Failed to create upload URL" }, { status: 500 });
    }

    const result = data as unknown as { signedUrl: string; token: string; path: string };
    return NextResponse.json({
      signedUrl: result.signedUrl,
      path: filePath,
      token: result.token,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
