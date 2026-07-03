import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LotusMotif } from "@/components/ui/motifs";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <LotusMotif className="h-16 w-20 text-brand-leaf/40" />
      <h1 className="mt-4 font-[family-name:var(--font-playfair)] text-6xl font-bold text-brand-saffron">404</h1>
      <p className="mt-3 font-hand text-xl text-brand-muted">looks like this dish is off the menu</p>
      <p className="mt-1 text-brand-charcoal/70">This page doesn&apos;t exist.</p>
      <Button asChild className="mt-6">
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}
