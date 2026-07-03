"use client";

import { useState } from "react";
import { toggleStore } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Power, Moon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface StoreToggleProps {
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
}

export function StoreToggle({ isOpen, onToggle }: StoreToggleProps) {
  const [loading, setLoading] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  const doToggle = async () => {
    setLoading(true);
    try {
      const result = await toggleStore();
      onToggle(result.is_open);
      toast.success(result.is_open ? "Kitchen is now open" : "Kitchen is now closed");
    } catch {
      toast.error("Failed to toggle store");
    } finally {
      setLoading(false);
      setConfirmClose(false);
    }
  };

  const handleClick = () => {
    if (isOpen) {
      setConfirmClose(true);
    } else {
      doToggle();
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 rounded-2xl border border-brand-gold/35 bg-brand-surface p-6 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-[family-name:var(--font-playfair)] text-lg font-bold text-brand-charcoal">
            Kitchen Status
          </p>
          <p className="mt-1 text-sm text-brand-muted">
            {isOpen ? "Accepting orders right now" : "Closed — not accepting orders"}
          </p>
        </div>

        <button
          onClick={handleClick}
          disabled={loading}
          aria-pressed={isOpen}
          className={cn(
            "relative flex h-12 w-44 items-center rounded-full px-1.5 transition-all duration-500 disabled:opacity-60",
            isOpen ? "bg-brand-leaf" : "bg-[#9B4A3C]"
          )}
          style={
            isOpen
              ? { boxShadow: "0 0 12px rgba(74,124,89,0.4)" }
              : undefined
          }
        >
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300",
              isOpen ? "translate-x-32" : "translate-x-0"
            )}
          >
            {isOpen ? (
              <Power className="h-4 w-4 text-brand-leaf" />
            ) : (
              <Moon className="h-4 w-4 text-[#9B4A3C]" />
            )}
          </span>
          <span
            className={cn(
              "absolute text-sm font-semibold text-white",
              isOpen ? "left-4" : "right-4"
            )}
          >
            {isOpen ? "OPEN" : "CLOSED"}
          </span>
        </button>
      </div>

      <Dialog open={confirmClose} onOpenChange={(o) => !o && setConfirmClose(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Close the kitchen?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-brand-muted">
            Customers won&apos;t be able to place orders until you reopen. Are you sure you want to
            close now?
          </p>
          <div className="mt-4 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmClose(false)}>
              Keep open
            </Button>
            <Button variant="destructive" className="flex-1" onClick={doToggle} disabled={loading}>
              {loading ? "Closing…" : "Yes, close"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
