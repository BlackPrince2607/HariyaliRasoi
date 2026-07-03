"use client";

import { useEffect, useState } from "react";
import { getAllReviews } from "@/lib/api/admin";
import type { Review } from "@/lib/api/types";
import { ReviewModerationCard } from "@/components/admin/ReviewModerationCard";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const refresh = () => getAllReviews().then(setReviews).catch(() => {});
  useEffect(() => { refresh(); }, []);

  return (
    <div>
      <p className="font-hand text-xl text-brand-saffron">guest voices</p>
      <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-brand-charcoal md:text-3xl">Reviews</h1>
      <div className="mt-6 space-y-3">
        {reviews.map((r) => (
          <ReviewModerationCard key={r.id} review={r} onRefresh={refresh} />
        ))}
      </div>
    </div>
  );
}
