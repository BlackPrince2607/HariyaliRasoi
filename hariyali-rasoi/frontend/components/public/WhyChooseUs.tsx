import { ChefHat, Heart, Truck, Users } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { LeafMotif } from "@/components/ui/motifs";

const features = [
  {
    icon: ChefHat,
    title: "100% Fresh",
    desc: "Cooked fresh daily with locally sourced ingredients",
  },
  {
    icon: Heart,
    title: "Family Recipes",
    desc: "Authentic home-style recipes passed down generations",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    desc: "Hot meals delivered straight to your doorstep",
  },
  {
    icon: Users,
    title: "Events Ready",
    desc: "Bhandara, catering & NGO meals for 50 to 500+ guests",
  },
];

export function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-brand-leaf px-4 py-16">
      {/* Subtle repeating leaf pattern overlay */}
      <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 gap-12 p-12 opacity-[0.04]">
        {Array.from({ length: 9 }).map((_, i) => (
          <LeafMotif key={i} className="h-full w-full text-white" />
        ))}
      </div>

      <div className="relative mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Why us"
          title="Why Hariyali Rasoi?"
          subtitle="Homestyle cooking with the warmth of a family kitchen — for everyday meals and special occasions alike."
          titleClassName="text-white"
          subtitleClassName="text-white/75"
          eyebrowClassName="text-white/60"
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="card-hover rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
