"use client";

import { OrderAlertProvider } from "@/lib/hooks/useOrderAlerts";
import { OrderAlertPanel } from "@/components/admin/OrderAlertPanel";
import { Sidebar } from "@/components/admin/Sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <OrderAlertProvider>
      <div className="flex min-h-screen bg-brand-cream">
        <Sidebar />
        <main className="relative flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <OrderAlertPanel />
          {children}
        </main>
      </div>
    </OrderAlertProvider>
  );
}
