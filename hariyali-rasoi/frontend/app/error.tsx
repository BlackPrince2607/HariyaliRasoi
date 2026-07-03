"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-brand-cream px-4">
        <div className="max-w-md text-center">
          <p className="font-hand text-xl text-brand-saffron">something went wrong</p>
          <h1 className="mt-2 font-[family-name:var(--font-playfair)] text-2xl font-bold text-brand-charcoal">
            We hit a snag
          </h1>
          <p className="mt-2 text-sm text-brand-muted">
            Please try again, or order directly on WhatsApp.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={reset}>Try again</Button>
            <Button asChild variant="outline">
              <Link href="/">Go home</Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
