import Link from "next/link";
import { LeafMotif } from "@/components/ui/motifs";

export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-brand-charcoal text-white">
      {/* Large decorative leaf in background */}
      <LeafMotif className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 text-white opacity-[0.04]" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-white">
              Hariyali Rasoi
            </h3>
          </div>
          <p className="mt-1 font-hand text-lg text-brand-gold">made with love, served like family</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">
            Home-style Indian food made with love. Fresh, wholesome meals delivered to your door —
            plus catering for events, bhandara & community partnerships.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white/60">
            Explore
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-white/60">
            <li><Link href="/menu" className="transition-colors hover:text-brand-saffron">Menu</Link></li>
            <li><Link href="/events" className="transition-colors hover:text-brand-saffron">Events & Catering</Link></li>
            <li><Link href="/contact" className="transition-colors hover:text-brand-saffron">Contact</Link></li>
            <li><Link href="/cart" className="transition-colors hover:text-brand-saffron">Cart</Link></li>
            <li><Link href="/track-order" className="transition-colors hover:text-brand-saffron">Track Order</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white/60">
            Get in touch
          </h4>
          <p className="mt-4 text-sm text-white/60">
            WhatsApp us for orders & event enquiries
          </p>
          <Link
            href="/contact"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-saffron hover:underline"
          >
            Contact us →
          </Link>
          <p className="mt-6 text-xs text-white/30">
            <Link href="/auth/login" className="hover:text-white/50">Admin login</Link>
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/10 py-5 px-4">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="font-hand text-lg text-brand-saffron">
            Made with 🤍 by the Hariyali family
          </p>
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Hariyali Rasoi · All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
