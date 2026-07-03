"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { CalendarHeart, HandHeart, PartyPopper, Users } from "lucide-react";
import {
  submitBhandaraRequest,
  submitCateringRequest,
  submitNgoRequest,
} from "@/lib/api/admin";
import { SectionHeader } from "./SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import { LeafMotif } from "@/components/ui/motifs";

type EventType = "bhandara" | "catering" | "ngo";

const TABS: {
  id: EventType;
  label: string;
  icon: typeof PartyPopper;
  blurb: string;
}[] = [
  {
    id: "bhandara",
    label: "Bhandara",
    icon: HandHeart,
    blurb: "Community feasts for temples, gurudwaras & social gatherings",
  },
  {
    id: "catering",
    label: "Catering",
    icon: PartyPopper,
    blurb: "Weddings, birthdays, corporate events & private celebrations",
  },
  {
    id: "ngo",
    label: "NGO Partnership",
    icon: Users,
    blurb: "Nutritious meals for communities & outreach programmes",
  },
];

export function EventsInquiry() {
  const searchParams = useSearchParams();
  const initial = (searchParams.get("type") as EventType) || "bhandara";
  const [active, setActive] = useState<EventType>(
    TABS.some((t) => t.id === initial) ? initial : "bhandara"
  );
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      if (active === "bhandara") {
        await submitBhandaraRequest({
          ...data,
          guest_count: Number(data.guest_count),
        });
      } else if (active === "catering") {
        await submitCateringRequest({
          ...data,
          guest_count: Number(data.guest_count),
        });
      } else {
        await submitNgoRequest({
          ...data,
          quantity_needed: data.quantity_needed
            ? Number(data.quantity_needed)
            : undefined,
        });
      }
      toast.success("Request submitted! We'll contact you soon.");
      reset();
      setSubmitted(true);
    } catch {
      toast.error("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (id: EventType) => {
    setActive(id);
    setSubmitted(false);
  };

  return (
    <div className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-4xl">
        <SectionHeader
          eyebrow="Events & partnerships"
          title="Book catering for your occasion"
          subtitle="Bhandara feasts, private catering, and NGO meal partnerships — one form, tailored to your needs."
        />

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const selected = active === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => switchTab(tab.id)}
                className={cn(
                  "group rounded-2xl border p-4 text-left transition-all duration-300",
                  selected
                    ? "border-brand-saffron bg-brand-surface shadow-[var(--shadow-card)] ring-2 ring-brand-saffron/20"
                    : "border-brand-gold/35 bg-brand-surface/60 hover:border-brand-saffron/40 hover:bg-brand-surface"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                    selected
                      ? "bg-brand-saffron text-white"
                      : "bg-brand-cream text-brand-leaf group-hover:bg-brand-saffron/10"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-3 font-semibold text-brand-charcoal">{tab.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-brand-muted">
                  {tab.blurb}
                </p>
              </button>
            );
          })}
        </div>

        {submitted ? (
          <div className="mt-8 animate-fade-in rounded-3xl border border-brand-gold/35 bg-brand-surface p-8 text-center shadow-[var(--shadow-card)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-leaf/12 text-brand-leaf">
              <LeafMotif className="h-10 w-10" />
            </div>
            <p className="mt-5 font-hand text-2xl text-brand-saffron">shukriya!</p>
            <h3 className="mt-1 font-[family-name:var(--font-playfair)] text-2xl font-bold text-brand-charcoal">
              Your request is in
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-brand-muted">
              Thank you for reaching out. Our family will personally review your{" "}
              {TABS.find((t) => t.id === active)?.label.toLowerCase()} enquiry and get back to you
              within 24 hours.
            </p>
            <Button onClick={() => setSubmitted(false)} variant="outline" className="mt-6">
              Submit another request
            </Button>
          </div>
        ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 animate-fade-in rounded-3xl border border-brand-gold/35 bg-brand-surface p-6 shadow-[var(--shadow-card)] md:p-8"
        >
          <div className="mb-6 flex items-center gap-3 border-b border-brand-gold/30 pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-leaf/10 text-brand-leaf">
              <CalendarHeart className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-brand-charcoal">
                {TABS.find((t) => t.id === active)?.label} enquiry
              </p>
              <p className="text-sm text-brand-muted">
                Fill in the details and we&apos;ll get back within 24 hours
              </p>
            </div>
          </div>

          {active === "ngo" ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Contact Name *</Label>
                  <Input {...register("name", { required: true })} className="mt-1.5" />
                </div>
                <div>
                  <Label>Organization *</Label>
                  <Input {...register("organization", { required: true })} className="mt-1.5" />
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Phone *</Label>
                  <Input {...register("phone", { required: true })} className="mt-1.5" />
                </div>
                <div>
                  <Label>Required Date *</Label>
                  <Input type="date" {...register("required_date", { required: true })} className="mt-1.5" />
                </div>
              </div>
              <div className="mt-4">
                <Label>Quantity Needed (meals)</Label>
                <Input type="number" {...register("quantity_needed")} className="mt-1.5" />
              </div>
              <div className="mt-4">
                <Label>Notes</Label>
                <Textarea {...register("notes")} className="mt-1.5" rows={4} />
              </div>
            </>
          ) : active === "catering" ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Your Name *</Label>
                  <Input {...register("name", { required: true })} className="mt-1.5" />
                </div>
                <div>
                  <Label>Phone *</Label>
                  <Input {...register("phone", { required: true })} className="mt-1.5" />
                </div>
              </div>
              <div className="mt-4">
                <Label>Event Type *</Label>
                <Input
                  {...register("event_type", { required: true })}
                  className="mt-1.5"
                  placeholder="Wedding, birthday, corporate lunch..."
                />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Event Date *</Label>
                  <Input type="date" {...register("event_date", { required: true })} className="mt-1.5" />
                </div>
                <div>
                  <Label>Guest Count *</Label>
                  <Input type="number" {...register("guest_count", { required: true })} className="mt-1.5" />
                </div>
              </div>
              <div className="mt-4">
                <Label>Budget</Label>
                <Input {...register("budget")} className="mt-1.5" placeholder="e.g. ₹50,000 – ₹1,00,000" />
              </div>
              <div className="mt-4">
                <Label>Notes</Label>
                <Textarea {...register("notes")} className="mt-1.5" rows={4} />
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Your Name *</Label>
                  <Input {...register("name", { required: true })} className="mt-1.5" />
                </div>
                <div>
                  <Label>Phone *</Label>
                  <Input {...register("phone", { required: true })} className="mt-1.5" />
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Event Date *</Label>
                  <Input type="date" {...register("event_date", { required: true })} className="mt-1.5" />
                </div>
                <div>
                  <Label>Guest Count *</Label>
                  <Input type="number" {...register("guest_count", { required: true })} className="mt-1.5" />
                </div>
              </div>
              <div className="mt-4">
                <Label>Food Requirements</Label>
                <Textarea
                  {...register("food_requirements")}
                  className="mt-1.5"
                  rows={3}
                  placeholder="Veg only, specific dishes, Jain food, etc."
                />
              </div>
              <div className="mt-4">
                <Label>Budget Range</Label>
                <Input {...register("budget")} className="mt-1.5" placeholder="e.g. ₹30,000 – ₹80,000" />
              </div>
            </>
          )}

          <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto" disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
        )}
      </div>
    </div>
  );
}
