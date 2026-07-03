"use client";

import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils/cn";
import { MobileCartBar } from "./MobileCartBar";

const HIDE_CART_BAR_PATHS = ["/cart", "/order-confirmation"];

export function PublicMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  const hideCartBar = HIDE_CART_BAR_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  const showCartBar = itemCount > 0 && !hideCartBar;

  return (
    <>
      <main
        className={cn(
          "flex-1",
          showCartBar && "pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:pb-0"
        )}
      >
        {children}
      </main>
      <MobileCartBar show={showCartBar} />
    </>
  );
}
