"use client";

import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Plus, Search, LogOut, Settings } from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [orgName, setOrgName] = useState<string>("");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const email = user.email ?? "";
        setUserEmail(email);
        const name = email.split("@")[0];
        setDisplayName(name.charAt(0).toUpperCase() + name.slice(1));
        const { data: members } = await supabase
          .from("org_members")
          .select("orgs!inner(name)")
          .eq("user_id", user.id)
          .single();
        if (members?.orgs) {
          const org = members.orgs as unknown as { name: string };
          setOrgName(org.name);
        }
      }
    };
    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const userInitial = userEmail.charAt(0).toUpperCase() || "?";

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#ECEFF4] bg-white px-6">
      {/* LEFT ZONE: Welcome message */}
      <div className="flex items-center gap-1 min-w-0">
        <h1 className="text-lg font-semibold text-[#0F1A2E] truncate">
          Welcome back, {displayName || "there"}
        </h1>
        <p className="hidden md:block text-sm text-[#6B7394] ml-2 truncate">
          Here&apos;s what&apos;s happening across your screens today.
        </p>
      </div>

      {/* CENTER ZONE: Capsule search */}
      <div className="hidden md:flex flex-1 justify-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7394]" />
          <input
            type="text"
            placeholder="Search screens, media, playlists..."
            className="w-full rounded-full bg-[#F0F3FA] border-0 pl-10 pr-4 py-2 text-sm text-[#0F1A2E] placeholder:text-[#6B7394] ring-1 ring-inset ring-[#ECEFF4] focus:ring-2 focus:ring-[#4A7CF7] focus:outline-none"
          />
        </div>
      </div>

      {/* RIGHT ZONE: Quick-add, notifications, avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick-add button */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4A7CF7] text-white hover:bg-[#3A66D9] transition-colors"
          aria-label="Quick add"
        >
          <Plus className="h-4 w-4" />
        </button>

        {/* Notification bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7394] hover:bg-[#F0F3FA] transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#F43F5E] ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="mx-1 h-5 w-px bg-[#ECEFF4]" />

        {/* Avatar + name + role */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg outline-none transition-colors hover:bg-[#F0F3FA] px-2 py-1.5">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-[#EEF3FF] text-[#4A7CF7] text-sm font-semibold">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-[#0F1A2E] leading-tight">
                {displayName || "User"}
              </p>
              <span className="inline-block text-[11px] text-[#6B7394] bg-[#F0F3FA] rounded-full px-2 py-0.5 leading-tight mt-0.5">
                Admin
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userEmail}</p>
                  <p className="text-xs leading-none text-muted-foreground">{orgName}</p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
