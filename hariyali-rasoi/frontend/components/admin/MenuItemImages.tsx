"use client";

import Image from "next/image";
import { X } from "lucide-react";
import type { MenuImage } from "@/lib/api/types";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/button";
import { LeafMotif } from "@/components/ui/motifs";
import { cn } from "@/lib/utils/cn";

interface MenuItemImagesProps {
  images: MenuImage[];
  itemName: string;
  onUpload: (url: string) => void;
  onDelete: (imageId: string) => void;
}

export function MenuItemImages({ images, itemName, onUpload, onDelete }: MenuItemImagesProps) {
  const sorted = [...images].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.display_order - b.display_order;
  });

  return (
    <div className="flex shrink-0 flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {sorted.length === 0 ? (
          <div
            className={cn(
              "flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-brand-gold/40",
              "bg-gradient-to-br from-brand-cream to-brand-surface text-brand-leaf/40"
            )}
          >
            <LeafMotif className="h-8 w-8" />
          </div>
        ) : (
          sorted.map((image) => (
            <div key={image.id} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-brand-gold/35 bg-brand-cream">
              <Image
                src={image.url}
                alt={itemName}
                fill
                sizes="80px"
                className="object-cover"
              />
              {image.is_primary && (
                <span className="absolute bottom-0 left-0 right-0 bg-brand-charcoal/70 px-1 py-0.5 text-center text-[10px] text-white">
                  Primary
                </span>
              )}
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute right-1 top-1 h-6 w-6 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                onClick={() => onDelete(image.id)}
                aria-label={`Remove image for ${itemName}`}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>
      <ImageUploader onUpload={onUpload} />
    </div>
  );
}
