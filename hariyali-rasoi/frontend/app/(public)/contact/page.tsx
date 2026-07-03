import { ContactSection } from "@/components/public/ContactSection";
import { ReviewForm } from "@/components/public/ReviewForm";

export default function ContactPage() {
  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <p className="font-hand text-xl text-brand-saffron">reach out anytime</p>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-brand-charcoal md:text-4xl">
          Contact Us
        </h1>
        <p className="mt-1 text-brand-muted">We&apos;d love to hear from you</p>
        <div className="mt-8">
          <ContactSection />
        </div>
        <div className="mt-12 max-w-lg">
          <ReviewForm />
        </div>
      </div>
    </div>
  );
}
