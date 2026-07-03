"use client";

import { useState } from "react";
import { Phone, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buildWhatsAppLink } from "@/lib/utils/whatsapp";
import { openWhatsApp } from "@/lib/utils/openWhatsApp";
import { cn } from "@/lib/utils/cn";

const STATUSES = ["new", "contacted", "confirmed", "closed"];

interface InquiryCardProps {
  title: string;
  subtitle: string;
  phone: string;
  status: string;
  dateLabel: string;
  dateValue: string;
  details: { label: string; value: string }[];
  onStatusChange: (status: string) => void;
}

export function InquiryCard({
  title,
  subtitle,
  phone,
  status,
  dateLabel,
  dateValue,
  details,
  onStatusChange,
}: InquiryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const waHref = buildWhatsAppLink(phone, `Hi ${title}, regarding your inquiry with Hariyali Rasoi…`);

  return (
    <div className="rounded-2xl border border-brand-gold/35 bg-brand-surface p-4 shadow-[var(--shadow-card)]">
      <div
        className="flex cursor-pointer flex-wrap items-start justify-between gap-2"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <p className="font-semibold text-brand-charcoal">{title}</p>
          <p className="text-sm text-brand-muted">{subtitle}</p>
        </div>
        <Badge
          variant={status === "new" ? "warning" : status === "confirmed" ? "success" : "default"}
        >
          {status}
        </Badge>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-brand-gold/30 pt-4 text-sm text-brand-charcoal/85">
          <p>
            <strong>{dateLabel}:</strong> {dateValue}
          </p>
          {details.map((d) => (
            <p key={d.label}>
              <strong>{d.label}:</strong> {d.value}
            </p>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" asChild>
              <a href={`tel:${phone}`}>
                <Phone className="h-4 w-4" />
                Call
              </a>
            </Button>
            {waHref && (
              <Button size="sm" variant="secondary" onClick={() => openWhatsApp(waHref)}>
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
            )}
            <Select onValueChange={onStatusChange} value={status}>
              <SelectTrigger className={cn("w-36")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
