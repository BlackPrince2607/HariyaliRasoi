"use client";

import { Phone, MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/hooks/useStore";
import {
  buildWhatsAppLink,
  DEFAULT_WHATSAPP_GREETING,
  resolveWhatsappNumber,
} from "@/lib/utils/whatsapp";
import { useCartStore } from "@/store/cartStore";
import { FloatingCategoryDock } from "@/components/public/FloatingCategoryDock";
import { cn } from "@/lib/utils/cn";

const HIDE_CART_BAR_PATHS = ["/cart", "/order-confirmation"];

export function StickyContactBar() {
  const pathname = usePathname();
  const { settings } = useStore();
  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const whatsapp = resolveWhatsappNumber(
    settings?.whatsapp,
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  );
  const whatsappHref = buildWhatsAppLink(
    whatsapp,
    settings?.whatsapp_greeting ||
      process.env.NEXT_PUBLIC_WHATSAPP_GREETING ||
      DEFAULT_WHATSAPP_GREETING
  );
  const phone = settings?.phone || "";

  const hideCartBar = HIDE_CART_BAR_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  const cartBarVisible = itemCount > 0 && !hideCartBar;
  const checkoutBarVisible = pathname === "/cart" && itemCount > 0;
  const showCategoryDock = pathname === "/menu";

  if (!whatsapp && !phone && !showCategoryDock) return null;

  return (
    <div
      className={cn(
        "fixed right-4 z-50 flex flex-col items-end gap-2",
        cartBarVisible && "bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] md:bottom-4",
        checkoutBarVisible && "bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] lg:bottom-4",
        !cartBarVisible && !checkoutBarVisible && "bottom-4 pb-[env(safe-area-inset-bottom,0px)]"
      )}
    >
      {showCategoryDock && <FloatingCategoryDock />}
      {whatsapp && whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700"
          aria-label="WhatsApp"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
      )}
      {phone && (
        <a
          href={`tel:${phone}`}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-saffron text-white shadow-lg hover:bg-brand-turmeric"
          aria-label="Call"
        >
          <Phone className="h-5 w-5" />
        </a>
      )}
    </div>
  );
}
