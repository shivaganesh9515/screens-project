"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MonitorSmartphone,
  Image,
  Play,
  Layout,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  HardDrive,
  Menu,
  X,
  Megaphone,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/screens", label: "Screens", icon: MonitorSmartphone },
  { href: "/media", label: "Media", icon: Image },
  { href: "/playlists", label: "Playlists", icon: Play },
  { href: "/templates", label: "Templates", icon: Layout },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/advertiser", label: "Advertiser", icon: Megaphone },
];

const systemItems = [
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  const sectionLabel = (label: string) => (
    <span className="px-5 pt-5 pb-1 text-[11px] font-semibold tracking-wider text-[#6B7394] uppercase">
      {label}
    </span>
  );

  const navItem = (item: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center gap-3 rounded-[10px] px-3 py-3 text-sm w-full transition-colors duration-150",
          active
            ? "bg-[#EEF3FF] text-[#4A7CF7] font-medium nav-active-enter"
            : "text-[#6B7394] hover:bg-[#F0F3FA]",
          collapsed && "justify-center px-2"
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0", active ? "text-[#4A7CF7]" : "text-[#6B7394]")} />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  const sidebarContent = (
    <>
      {/* Logo block */}
      <div className="flex h-16 items-center gap-3 border-b border-[#ECEFF4] px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4A7CF7]">
          <MonitorSmartphone className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-[#0F1A2E]">screens</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col">
        {sectionLabel("MENU")}
        {menuItems.map(navItem)}

        {sectionLabel("SYSTEM")}
        {systemItems.map(navItem)}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Storage meter card */}
        {!collapsed && (
          <div className="px-5 py-3">
            <div className="rounded-lg border border-[#ECEFF4] p-3">
              <div className="flex items-center gap-1.5">
                <HardDrive className="h-3.5 w-3.5 text-[#6B7394]" />
                <span className="text-xs text-[#6B7394]">Storage Used</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-[#EEF3FF]">
                <div className="h-1.5 rounded-full bg-[#4A7CF7]" style={{ width: "48%" }} />
              </div>
              <p className="text-[11px] text-[#6B7394] mt-1">2.4 GB / 5 GB</p>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <div className="px-5 py-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex items-center gap-3 w-full text-sm text-[#6B7394] hover:bg-[#F0F3FA] rounded-lg px-3 py-2 transition-colors",
              collapsed && "justify-center px-2"
            )}
          >
            <ChevronLeft className={cn("h-4 w-4 shrink-0 transition-transform", collapsed && "rotate-180")} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </nav>
    </>
  );

  const navPanel = (extraClasses: string) => (
    <aside className={cn(
      "flex flex-col border-r border-[#ECEFF4] bg-white transition-all duration-300",
      extraClasses,
      collapsed ? "w-[68px]" : "w-60"
    )}>
      {sidebarContent}
    </aside>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 sm:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-[#4A7CF7] text-white shadow-lg sm:hidden"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Desktop sidebar */}
      {navPanel("hidden sm:flex")}

      {/* Mobile sidebar */}
      {navPanel(
        "fixed inset-y-0 left-0 z-50 sm:hidden shadow-2xl " +
        (mobileOpen ? "translate-x-0" : "-translate-x-full")
      )}
    </>
  );
}
