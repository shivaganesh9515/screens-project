import { Monitor } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/overview");

  return (
    <div className="flex min-h-screen">
      {/* Left side - Brand panel */}
      <div className="hidden w-1/2 flex-col items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 p-12 lg:flex">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-primary/20">
            <Monitor className="h-8 w-8 text-white" />
          </div>
          <h2 className="mb-3 text-3xl font-bold text-white">Welcome to Screens</h2>
          <p className="text-base leading-relaxed text-sidebar-foreground">
            Manage your digital signage network from anywhere. Upload content, build playlists, 
            schedule what plays on each screen, and monitor everything in real time.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { value: "99.9%", label: "Uptime" },
              { value: "Instant", label: "Updates" },
              { value: "Cloud", label: "Managed" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3">
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-xs text-sidebar-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        {children}
      </div>
    </div>
  );
}
