"use client";

import { useState } from "react";
import Image from "next/image";
import type { Order, StoreSettings } from "@/lib/api/types";
import { uploadPaymentScreenshot } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils/price";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UpiPaymentModalProps {
  order: Order;
  settings: StoreSettings;
  onComplete: () => void;
  onClose: () => void;
}

export function UpiPaymentModal({ order, settings, onComplete, onClose }: UpiPaymentModalProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadPaymentScreenshot(order.id, order.customer_phone, file);
      toast.success("Payment screenshot uploaded!");
      onComplete();
    } catch {
      toast.error("Failed to upload screenshot");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete UPI Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-center text-sm text-brand-charcoal/70">
            Order <strong className="text-brand-charcoal">{order.order_number}</strong> — Pay{" "}
            <strong className="text-brand-leaf">{formatPrice(order.total)}</strong>
          </p>
          {settings.upi_qr_url && (
            <div className="relative mx-auto h-52 w-52 overflow-hidden rounded-2xl border border-brand-gold/40 bg-white p-2">
              <Image src={settings.upi_qr_url} alt="UPI QR" fill className="object-contain p-2" />
            </div>
          )}
          {settings.upi_id && (
            <div className="rounded-xl border border-brand-gold/35 bg-brand-cream p-4 text-center">
              <p className="text-sm text-brand-muted">UPI ID</p>
              <p className="font-mono text-lg font-bold text-brand-charcoal">{settings.upi_id}</p>
            </div>
          )}
          <p className="text-center text-sm text-brand-muted">
            Scan the QR or pay to the UPI ID, then upload your payment screenshot
          </p>
          <label>
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            <Button className="w-full" disabled={uploading} asChild>
              <span>{uploading ? "Uploading..." : "Upload Payment Screenshot"}</span>
            </Button>
          </label>
          <Button variant="ghost" className="w-full" onClick={onComplete}>
            Skip for now — I&apos;ll send screenshot on WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
