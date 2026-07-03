"use client";

import { Star } from "lucide-react";
import type { Review } from "@/lib/api/types";
import { approveReview, deleteReview } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ReviewModerationCardProps {
  review: Review;
  onRefresh: () => void;
}

export function ReviewModerationCard({ review, onRefresh }: ReviewModerationCardProps) {
  const handleApprove = async (approved: boolean) => {
    try {
      await approveReview(review.id, approved);
      toast.success(approved ? "Review approved" : "Review hidden");
      onRefresh();
    } catch {
      toast.error("Failed to update review");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteReview(review.id);
      toast.success("Review deleted");
      onRefresh();
    } catch {
      toast.error("Failed to delete review");
    }
  };

  return (
    <div className="rounded-2xl border border-brand-gold/35 bg-brand-surface p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-brand-charcoal">{review.customer_name}</p>
          <div className="mt-1 flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-brand-saffron text-brand-saffron" : "text-brand-gold/30"}`} />
            ))}
          </div>
        </div>
        <Badge variant={review.is_approved ? "success" : "warning"}>
          {review.is_approved ? "Approved" : "Pending"}
        </Badge>
      </div>
      <p className="mt-2 text-sm text-brand-charcoal/80">{review.review}</p>
      <div className="mt-3 flex gap-2">
        {!review.is_approved && (
          <Button size="sm" variant="secondary" onClick={() => handleApprove(true)}>Approve</Button>
        )}
        {review.is_approved && (
          <Button size="sm" variant="outline" onClick={() => handleApprove(false)}>Hide</Button>
        )}
        <Button size="sm" variant="destructive" onClick={handleDelete}>Delete</Button>
      </div>
    </div>
  );
}
