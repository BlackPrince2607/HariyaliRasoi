"use client";

import { MessageCircle } from "lucide-react";
import type { Order } from "@/lib/api/types";
import { buildWhatsAppMessage, resolveWhatsappNumber } from "@/lib/utils/whatsapp";
import { openWhatsApp } from "@/lib/utils/openWhatsApp";
import { useStore } from "@/lib/hooks/useStore";
import { Button } from "@/components/ui/button";

interface WhatsAppOrderButtonProps {
  order: Order;
  whatsappNumber?: string;
}

export function WhatsAppOrderButton({ order, whatsappNumber }: WhatsAppOrderButtonProps) {
  const { settings } = useStore();
  const number = resolveWhatsappNumber(
    whatsappNumber,
    settings?.whatsapp,
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  );
  const href = buildWhatsAppMessage(order, number);
  if (!number || !href) return null;

  return (
    <Button
      variant="secondary"
      size="lg"
      className="w-full"
      onClick={() => openWhatsApp(href)}
    >
      <MessageCircle className="h-5 w-5" />
      Send Order on WhatsApp
    </Button>
  );
}
