"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils/cn";

const links = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/events", label: "Events" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const [mounted, setMounted] = useState(false);

  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const prevCountRef = useRef(itemCount);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (itemCount > prevCountRef.current) {
      setCartBounce(true);
      const t = setTimeout(() => setCartBounce(false), 650);
      prevCountRef.current = itemCount;
      return () => clearTimeout(t);
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const mobileMenu = open && mounted ? (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-brand-charcoal md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
        <span className="font-hand text-2xl text-brand-saffron">Hariyali Rasoi</span>
        <button
          type="button"
          aria-label="Close menu"
          className="rounded-full p-2 text-white/70 hover:text-white"
          onClick={() => setOpen(false)}
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col justify-center gap-2 px-8">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className={cn(
              "rounded-2xl px-4 py-4 font-[family-name:var(--font-playfair)] text-3xl font-bold transition-colors",
              pathname === l.href
                ? "text-brand-saffron"
                : "text-white/85 hover:text-brand-gold"
            )}
          >
            {l.label}
          </Link>
        ))}
        <Link
          href="/menu"
          onClick={() => setOpen(false)}
          className="mt-4 rounded-2xl px-4 py-4 text-center font-semibold text-white [background:var(--gradient-saffron)]"
        >
          Order Now →
        </Link>
      </nav>

      <p className="pb-8 text-center font-hand text-lg text-brand-gold/70">
        ghar ka khana, with love
      </p>
    </div>
  ) : null;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 glass-nav transition-all duration-300",
          scrolled
            ? "border-t-2 border-brand-saffron border-b border-brand-gold/30 shadow-[var(--shadow-warm)] h-14"
            : "border-b border-brand-gold/30 h-16"
        )}
      >
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 leading-none"
            onClick={() => setOpen(false)}
          >
            <span className="font-hand text-2xl text-brand-saffron">Hariyali</span>
            <span className="font-[family-name:var(--font-playfair)] text-xl font-bold text-brand-charcoal">
              Rasoi
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  data-active={active}
                  className={cn(
                    "nav-underline text-sm font-medium transition-colors",
                    active ? "text-brand-saffron" : "text-brand-charcoal/80 hover:text-brand-charcoal"
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/menu"
              className="hidden sm:inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:brightness-110 hover:scale-[1.02] [background:var(--gradient-saffron)]"
            >
              Order Now
            </Link>

            <Link
              href="/cart"
              aria-label="View cart"
              className="relative rounded-full p-2.5 transition-colors hover:bg-brand-saffron/10"
            >
              <ShoppingBag
                className={cn(
                  "h-5 w-5 text-brand-charcoal",
                  cartBounce && "animate-cart-bounce"
                )}
              />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-saffron text-xs font-bold text-white">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="rounded-full p-2 text-brand-charcoal transition-colors hover:bg-brand-cream md:hidden"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {mounted && mobileMenu ? createPortal(mobileMenu, document.body) : null}
    </>
  );
}
