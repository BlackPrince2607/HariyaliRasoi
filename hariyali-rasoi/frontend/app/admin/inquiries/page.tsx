"use client";

import { useEffect, useState } from "react";
import {
  getBhandaraRequests,
  getCateringRequests,
  getNgoRequests,
  updateBhandaraInquiry,
  updateCateringInquiry,
  updateNgoInquiry,
} from "@/lib/api/admin";
import type { BhandaraInquiry, CateringInquiry, NgoInquiry } from "@/lib/api/types";
import { InquiryCard } from "@/components/admin/InquiryCard";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

const TABS = ["bhandara", "catering", "ngo"] as const;

export default function AdminInquiriesPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("bhandara");
  const [bhandara, setBhandara] = useState<BhandaraInquiry[]>([]);
  const [catering, setCatering] = useState<CateringInquiry[]>([]);
  const [ngo, setNgo] = useState<NgoInquiry[]>([]);

  const refresh = () => {
    getBhandaraRequests().then(setBhandara).catch(() => {});
    getCateringRequests().then(setCatering).catch(() => {});
    getNgoRequests().then(setNgo).catch(() => {});
  };

  useEffect(() => {
    refresh();
  }, []);

  const counts = {
    bhandara: bhandara.filter((i) => i.status === "new").length,
    catering: catering.filter((i) => i.status === "new").length,
    ngo: ngo.filter((i) => i.status === "new").length,
  };

  return (
    <div>
      <p className="font-hand text-xl text-brand-saffron">events &amp; catering</p>
      <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-brand-charcoal md:text-3xl">
        Inquiries
      </h1>
      <p className="mt-1 text-sm text-brand-muted">
        Bhandara, catering, and NGO partnership requests from your website.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition-all",
              tab === t
                ? "bg-brand-saffron text-white shadow-sm"
                : "bg-brand-cream/80 text-brand-charcoal hover:bg-brand-cream"
            )}
          >
            {t}
            {counts[t] > 0 && (
              <span className="ml-1.5 rounded-full bg-white/25 px-1.5 text-xs">{counts[t]}</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {tab === "bhandara" &&
          (bhandara.length === 0 ? (
            <EmptyState motif="pot" title="No Bhandara inquiries" description="New requests will appear here." />
          ) : (
            bhandara.map((item) => (
              <InquiryCard
                key={item.id}
                title={item.name}
                subtitle={`${item.guest_count} guests · ${item.phone}`}
                phone={item.phone}
                status={item.status}
                dateLabel="Event date"
                dateValue={item.event_date}
                details={[
                  ...(item.food_requirements
                    ? [{ label: "Food requirements", value: item.food_requirements }]
                    : []),
                  ...(item.budget ? [{ label: "Budget", value: item.budget }] : []),
                ]}
                onStatusChange={async (status) => {
                  try {
                    await updateBhandaraInquiry(item.id, { status });
                    toast.success("Updated");
                    refresh();
                  } catch {
                    toast.error("Failed to update");
                  }
                }}
              />
            ))
          ))}

        {tab === "catering" &&
          (catering.length === 0 ? (
            <EmptyState motif="pot" title="No catering inquiries" description="New requests will appear here." />
          ) : (
            catering.map((item) => (
              <InquiryCard
                key={item.id}
                title={item.name}
                subtitle={`${item.event_type} · ${item.guest_count} guests · ${item.phone}`}
                phone={item.phone}
                status={item.status}
                dateLabel="Event date"
                dateValue={item.event_date}
                details={[
                  ...(item.budget ? [{ label: "Budget", value: item.budget }] : []),
                  ...(item.notes ? [{ label: "Notes", value: item.notes }] : []),
                ]}
                onStatusChange={async (status) => {
                  try {
                    await updateCateringInquiry(item.id, { status });
                    toast.success("Updated");
                    refresh();
                  } catch {
                    toast.error("Failed to update");
                  }
                }}
              />
            ))
          ))}

        {tab === "ngo" &&
          (ngo.length === 0 ? (
            <EmptyState motif="pot" title="No NGO inquiries" description="New requests will appear here." />
          ) : (
            ngo.map((item) => (
              <InquiryCard
                key={item.id}
                title={item.name}
                subtitle={`${item.organization} · ${item.phone}`}
                phone={item.phone}
                status={item.status}
                dateLabel="Required date"
                dateValue={item.required_date}
                details={[
                  ...(item.quantity_needed
                    ? [{ label: "Quantity needed", value: String(item.quantity_needed) }]
                    : []),
                  ...(item.notes ? [{ label: "Notes", value: item.notes }] : []),
                ]}
                onStatusChange={async (status) => {
                  try {
                    await updateNgoInquiry(item.id, { status });
                    toast.success("Updated");
                    refresh();
                  } catch {
                    toast.error("Failed to update");
                  }
                }}
              />
            ))
          ))}
      </div>
    </div>
  );
}
