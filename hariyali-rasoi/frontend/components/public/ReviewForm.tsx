"use client";

import { useState } from "react";
import { createReview } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Star } from "lucide-react";

export function ReviewForm() {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createReview({ customer_name: name, rating, review });
      toast.success("Thank you! Your review will appear after approval.");
      setName("");
      setReview("");
      setRating(5);
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-brand-gold/35 bg-brand-surface p-6 shadow-[var(--shadow-card)]"
    >
      <p className="font-hand text-lg text-brand-saffron">tell us your story</p>
      <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-brand-charcoal">
        Share Your Experience
      </h3>
      <div>
        <Label htmlFor="review-name">Your Name</Label>
        <Input id="review-name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1" />
      </div>
      <div>
        <Label>Rating</Label>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)}>
              <Star className={`h-6 w-6 ${n <= rating ? "fill-brand-saffron text-brand-saffron" : "text-brand-gold/30"}`} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="review-text">Your Review</Label>
        <Textarea id="review-text" value={review} onChange={(e) => setReview(e.target.value)} required className="mt-1" rows={3} />
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Review"}</Button>
    </form>
  );
}
