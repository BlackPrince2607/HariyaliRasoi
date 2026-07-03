"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Tags,
  Star,
  Image,
  Ticket,
  Settings,
  BarChart3,
  LogOut,
  Sparkles,
  MessageSquare,
  Leaf,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/hooks/useAuth";
import { useOrderAlerts } from "@/lib/hooks/useOrderAlerts";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const STORAGE_KEY = "hariyali-admin-sidebar-collapsed";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/specials", label: "Specials", icon: Sparkles },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/banners", label: "Banners", icon: Image },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/gallery", label: "Gallery", icon: Image },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const {
    soundEnabled,
    whatsappNotifyEnabled,
    setSoundEnabled,
    setWhatsappNotifyEnabled,
  } = useOrderAlerts();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setCollapsed(true);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col bg-brand-forest text-white transition-all duration-300",
        collapsed ? "w-16" : "w-16 lg:w-64"
      )}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
          <Leaf className="h-5 w-5 text-brand-gold" />
        </span>
        {!collapsed && (
          <Link
            href="/admin"
            className="hidden font-[family-name:var(--font-playfair)] text-lg font-bold text-white lg:inline"
          >
            Hariyali Admin
          </Link>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2 lg:p-3">
        {links.map((l) => {
          const Icon = l.icon;
          const active =
            pathname === l.href || (l.href !== "/admin" && pathname.startsWith(l.href));
          return (
            <Link
              key={l.href}
              href={l.href}
              title={l.label}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "border-l-2 border-brand-saffron bg-white/10 text-white rounded-r-xl rounded-l-none"
                  : "rounded-xl text-white/75 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="hidden lg:inline">{l.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-white/10 p-2 lg:p-3">
        {!collapsed && (
          <div className="hidden space-y-3 rounded-xl bg-white/5 p-3 lg:block">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="order-sound" className="text-xs text-white/80">
                Order alarm
              </Label>
              <Switch
                id="order-sound"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="wa-notify" className="text-xs text-white/80">
                WhatsApp notify
              </Label>
              <Switch
                id="wa-notify"
                checked={whatsappNotifyEnabled}
                onCheckedChange={setWhatsappNotifyEnabled}
              />
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white lg:flex"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 shrink-0" />
          ) : (
            <ChevronLeft className="h-5 w-5 shrink-0" />
          )}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={logout}
          title="Logout"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="hidden lg:inline">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
