import { Monitor } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { LogoutButton } from "./_components/logout-button";

export default async function AdvertiserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify the user is an advertiser
  const { data: advertiser } = await supabase
    .from("advertisers")
    .select("id, name")
    .eq("user_id", user.id)
    .single();

  if (!advertiser) {
    // Not an advertiser — redirect to main app
    redirect("/overview");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FA]">
      {/* Minimal header */}
      <header className="flex h-14 items-center justify-between border-b border-[#ECEFF4] bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4A7CF7]">
            <Monitor className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-[#0F1A2E]">screens</span>
          <span className="hidden sm:inline text-xs text-muted-foreground ml-2 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
            Advertiser
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {advertiser.name}
          </span>
          <LogoutButton />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl p-6">
          {children}
        </div>
      </main>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
