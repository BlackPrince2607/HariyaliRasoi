"use client";

import { useOrderAlerts } from "@/lib/hooks/useOrderAlerts";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function OrderNotificationSettings() {
  const {
    soundEnabled,
    whatsappNotifyEnabled,
    setSoundEnabled,
    setWhatsappNotifyEnabled,
  } = useOrderAlerts();

  return (
    <div className="mt-6 space-y-4 rounded-2xl border border-brand-gold/35 bg-brand-surface p-6 shadow-[var(--shadow-card)]">
      <div>
        <h2 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-brand-charcoal">
          Order Notifications
        </h2>
        <p className="mt-1 text-sm text-brand-muted">
          Control how you are alerted when a new website order arrives.
        </p>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <Label htmlFor="settings-order-sound">Order alarm sound</Label>
          <p className="text-xs text-brand-muted">
            Plays a repeating beep until you accept, reject, or stop it.
          </p>
        </div>
        <Switch
          id="settings-order-sound"
          checked={soundEnabled}
          onCheckedChange={setSoundEnabled}
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <Label htmlFor="settings-wa-notify">WhatsApp notify</Label>
          <p className="text-xs text-brand-muted">
            When sound is off, opens WhatsApp with order details automatically.
          </p>
        </div>
        <Switch
          id="settings-wa-notify"
          checked={whatsappNotifyEnabled}
          onCheckedChange={setWhatsappNotifyEnabled}
        />
      </div>
    </div>
  );
}
