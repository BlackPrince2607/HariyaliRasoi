"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getBanners, createBanner, deleteBanner } from "@/lib/api/admin";
import type { Banner } from "@/lib/api/types";
import { BannerForm } from "@/components/admin/BannerForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [creating, setCreating] = useState(false);

  const refresh = () => getBanners(false).then(setBanners).catch(() => {});
  useEffect(() => { refresh(); }, []);

  const handleCreate = async (data: Partial<Banner>) => {
    try {
      await createBanner(data);
      setCreating(false);
      refresh();
      toast.success("Banner created");
    } catch {
      toast.error("Failed to create banner");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-brand-charcoal md:text-3xl">Banners</h1>
        <Button onClick={() => setCreating(true)}>Add Banner</Button>
      </div>
      {creating && (
        <div className="mt-6 rounded-2xl border border-brand-gold/35 bg-brand-surface p-6 shadow-[var(--shadow-card)]">
          <BannerForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />
        </div>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {banners.map((b) => (
          <div key={b.id} className="overflow-hidden rounded-2xl border border-brand-gold/35 bg-brand-surface shadow-[var(--shadow-card)]">
            <div className="relative aspect-video">
              <Image src={b.image_url} alt={b.title || ""} fill className="object-cover" />
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="font-medium text-brand-charcoal">{b.title || "Untitled"}</span>
              <Button size="sm" variant="destructive" onClick={async () => { await deleteBanner(b.id); refresh(); }}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
