import { Hero } from "@/components/public/Hero";
import { PromoBanners } from "@/components/public/PromoBanners";
import { TodaysSpecials } from "@/components/public/TodaysSpecials";
import { FeaturedDishes } from "@/components/public/FeaturedDishes";
import { WhyChooseUs } from "@/components/public/WhyChooseUs";
import { ReviewsCarousel } from "@/components/public/ReviewsCarousel";
import { ContactSection } from "@/components/public/ContactSection";
import { getMenuItems, getCategories } from "@/lib/api/menu";
import { getBanners, getReviews } from "@/lib/api/admin";
import type { MenuItem, Category, Banner, Review } from "@/lib/api/types";

export const dynamic = "force-dynamic";

const FALLBACK_HERO_IMAGE =
  "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_508,h_320,c_fit/0ced06b7276d9303882059c385e0c272";

function primaryImageUrl(item: MenuItem | undefined): string | null {
  if (!item?.images?.length) return null;
  return item.images.find((i) => i.is_primary)?.url ?? item.images[0]?.url ?? null;
}

async function settled<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const [specials, bestsellers, allItems, categories, banners, reviews] = await Promise.all([
    settled(getMenuItems({ is_todays_special: true, is_available: true }), [] as MenuItem[]),
    settled(getMenuItems({ is_bestseller: true, is_available: true }), [] as MenuItem[]),
    settled(getMenuItems({ is_available: true }), [] as MenuItem[]),
    settled(getCategories(), [] as Category[]),
    settled(getBanners(), [] as Banner[]),
    settled(getReviews(), [] as Review[]),
  ]);

  const heroImage =
    primaryImageUrl(bestsellers[0]) ||
    primaryImageUrl(specials[0]) ||
    primaryImageUrl(allItems[0]) ||
    FALLBACK_HERO_IMAGE;

  const specialsToShow = specials.length > 0 ? specials : bestsellers.slice(0, 8);
  const featured = bestsellers.length > 0 ? bestsellers : allItems.slice(0, 12);

  return (
    <>
      <Hero
        imageUrl={heroImage}
        dishCount={allItems.length || undefined}
        categoryCount={categories.length || undefined}
      />
      <PromoBanners banners={banners} />
      <TodaysSpecials items={specialsToShow} />
      <FeaturedDishes items={featured} />
      <WhyChooseUs />
      <ReviewsCarousel reviews={reviews} />
      <ContactSection />
    </>
  );
}
