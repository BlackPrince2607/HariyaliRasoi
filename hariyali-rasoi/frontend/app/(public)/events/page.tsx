import { Suspense } from "react";
import { EventsInquiry } from "@/components/public/EventsInquiry";

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-brand-charcoal/50">Loading...</div>}>
      <EventsInquiry />
    </Suspense>
  );
}
