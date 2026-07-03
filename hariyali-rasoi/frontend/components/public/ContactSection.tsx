"use client";

import { useStore } from "@/lib/hooks/useStore";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function ContactSection() {
  const { settings } = useStore();

  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <p className="font-hand text-xl text-brand-saffron">come say hello</p>
        <h2 className="mt-1 font-[family-name:var(--font-playfair)] text-3xl font-bold text-brand-charcoal md:text-4xl">
          Visit Us
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-brand-gold/35 bg-brand-surface p-6 shadow-[var(--shadow-card)]">
            {settings?.address && (
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-brand-saffron" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-sm text-brand-charcoal/70">{settings.address}</p>
                </div>
              </div>
            )}
            {settings?.phone && (
              <div className="flex gap-3">
                <Phone className="h-5 w-5 shrink-0 text-brand-saffron" />
                <div>
                  <p className="font-medium">Phone</p>
                  <a href={`tel:${settings.phone}`} className="text-sm text-brand-leaf hover:underline">
                    {settings.phone}
                  </a>
                </div>
              </div>
            )}
            {settings?.email && (
              <div className="flex gap-3">
                <Mail className="h-5 w-5 shrink-0 text-brand-saffron" />
                <div>
                  <p className="font-medium">Email</p>
                  <a href={`mailto:${settings.email}`} className="text-sm text-brand-leaf hover:underline">
                    {settings.email}
                  </a>
                </div>
              </div>
            )}
            {settings?.opening_time && (
              <div className="flex gap-3">
                <Clock className="h-5 w-5 shrink-0 text-brand-saffron" />
                <div>
                  <p className="font-medium">Hours</p>
                  <p className="text-sm text-brand-charcoal/70">
                    {settings.opening_time} – {settings.closing_time}
                  </p>
                </div>
              </div>
            )}
          </div>
          {settings?.google_maps_url && (
            <iframe
              src={settings.google_maps_url}
              className="h-64 w-full rounded-2xl border-0 md:h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Location"
            />
          )}
        </div>
      </div>
    </section>
  );
}
