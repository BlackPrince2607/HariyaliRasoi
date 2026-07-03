"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getGallery, createGalleryItem, deleteGalleryItem } from "@/lib/api/admin";
import type { GalleryItem } from "@/lib/api/types";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [alt, setAlt] = useState("");

  const refresh = () => getGallery().then(setItems).catch(() => {});
  useEffect(() => { refresh(); }, []);

  const handleUpload = async (url: string) => {
    try {
      await createGalleryItem({ url, alt, album: "food" });
      setAlt("");
      refresh();
      toast.success("Image added to gallery");
    } catch {
      toast.error("Failed to add image");
    }
  };

  return (
    <div>
      <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-brand-charcoal md:text-3xl">Gallery</h1>
      <div className="mt-6 flex gap-2">
        <Input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Image description" />
        <ImageUploader bucket="gallery" onUpload={handleUpload} />
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-2xl border border-brand-gold/35 bg-brand-surface shadow-[var(--shadow-card)]">
            <div className="relative aspect-square">
              <Image src={item.url} alt={item.alt || ""} fill className="object-cover" />
            </div>
            <div className="flex items-center justify-between p-3">
              <span className="truncate text-sm text-brand-charcoal">{item.alt || "—"}</span>
              <Button size="sm" variant="destructive" onClick={async () => { await deleteGalleryItem(item.id); refresh(); }}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
