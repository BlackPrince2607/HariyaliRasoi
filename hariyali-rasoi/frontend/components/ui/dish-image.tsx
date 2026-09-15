"use client";

import Image from "next/image";
import { useState } from "react";
import { LeafMotif } from "@/components/ui/motifs";
import { cn } from "@/lib/utils/cn";

interface DishImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  /** Emoji/text to show when no image is available (defaults to leaf silhouette). */
  fallbackEmoji?: string;
  /** Prefer fill layout (parent must be position:relative with size). Default true. */
  fill?: boolean;
}

/** Image with a branded leaf-silhouette placeholder when missing or failed to load. */
export function DishImage({
  src,
  alt,
  className,
  sizes,
  fallbackEmoji,
  fill = true,
}: DishImageProps) {
  const [errored, setErrored] = useState(false);
  const showFallback = !src || errored;

  if (showFallback) {
    return (
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-brand-cream to-brand-surface text-brand-leaf/40",
          className
        )}
      >
        {fallbackEmoji ? (
          <span className="text-5xl opacity-70">{fallbackEmoji}</span>
        ) : (
          <LeafMotif className="h-12 w-12" />
        )}
      </div>
    );
  }

  const isExternalCdn =
    src.includes("media-assets.swiggy.com") || src.includes("res.cloudinary.com");

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized={isExternalCdn}
        sizes={sizes ?? "(max-width: 768px) 100vw, 33vw"}
        className={cn("object-cover", className)}
        onError={() => setErrored(true)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={800}
      unoptimized={isExternalCdn}
      sizes={sizes ?? "(max-width: 768px) 100vw, 33vw"}
      className={cn("h-full w-full object-cover", className)}
      onError={() => setErrored(true)}
    />
  );
}
