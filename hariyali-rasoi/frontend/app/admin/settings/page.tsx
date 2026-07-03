"use client";

import { useEffect, useState } from "react";
import { getStoreSettings, updateStoreSettings } from "@/lib/api/admin";
import type { StoreSettings } from "@/lib/api/types";
import { StoreToggle } from "@/components/admin/StoreToggle";
import { OrderNotificationSettings } from "@/components/admin/OrderNotificationSettings";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [form, setForm] = useState<Partial<StoreSettings>>({});

  useEffect(() => {
    getStoreSettings().then((s) => { setSettings(s); setForm(s); }).catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      const updated = await updateStoreSettings(form);
      setSettings(updated);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  if (!settings) return <p className="text-brand-muted">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <p className="font-hand text-xl text-brand-saffron">tune your kitchen</p>
      <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-brand-charcoal md:text-3xl">Store Settings</h1>
      <div className="mt-6">
        <StoreToggle isOpen={settings.is_open} onToggle={(v) => setSettings({ ...settings, is_open: v })} />
      </div>
      <div className="mt-6 space-y-4 rounded-2xl border border-brand-gold/35 bg-brand-surface p-6 shadow-[var(--shadow-card)]">
        {(["store_name", "phone", "whatsapp", "email", "address", "upi_id", "closed_message", "whatsapp_greeting"] as const).map((field) => (
          <div key={field}>
            <Label className="capitalize">{field.replace(/_/g, " ")}</Label>
            {field === "closed_message" || field === "address" || field === "whatsapp_greeting" ? (
              <Textarea
                value={(form[field] as string) || ""}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="mt-1"
              />
            ) : (
              <Input
                value={(form[field] as string) || ""}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="mt-1"
              />
            )}
          </div>
        ))}
        <div className="grid grid-cols-3 gap-4">
          {(["delivery_fee", "free_delivery_threshold", "min_order_amount"] as const).map((field) => (
            <div key={field}>
              <Label className="capitalize">{field.replace(/_/g, " ")}</Label>
              <Input
                type="number"
                value={form[field] ?? ""}
                onChange={(e) => setForm({ ...form, [field]: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
          ))}
        </div>
        <div>
          <Label>UPI QR Code</Label>
          {form.upi_qr_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.upi_qr_url}
              alt="UPI QR preview"
              className="mt-2 h-32 w-32 rounded-xl border border-brand-gold/40 bg-white object-contain p-2"
            />
          )}
          <Input value={form.upi_qr_url || ""} onChange={(e) => setForm({ ...form, upi_qr_url: e.target.value })} className="mt-1" />
          <div className="mt-2">
            <ImageUploader bucket="upi" onUpload={(url) => setForm({ ...form, upi_qr_url: url })} />
          </div>
        </div>
        <Button onClick={handleSave}>Save Settings</Button>
      </div>
      <OrderNotificationSettings />
    </div>
  );
}
