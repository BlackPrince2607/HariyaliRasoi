import { Hero } from "@/components/public/Hero";
import { PromoBanners } from "@/components/public/PromoBanners";
import { TodaysSpecials } from "@/components/public/TodaysSpecials";
import { FeaturedDishes } from "@/components/public/FeaturedDishes";
import { WhyChooseUs } from "@/components/public/WhyChooseUs";
import { ReviewsCarousel } from "@/components/public/ReviewsCarousel";
import { ContactSection } from "@/components/public/ContactSection";
import { getMenuItems } from "@/lib/api/menu";
import { getBanners, getReviews } from "@/lib/api/admin";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let specials: Awaited<ReturnType<typeof getMenuItems>> = [];
  let bestsellers: Awaited<ReturnType<typeof getMenuItems>> = [];
  let banners: Awaited<ReturnType<typeof getBanners>> = [];
  let reviews: Awaited<ReturnType<typeof getReviews>> = [];

  try {
    [specials, bestsellers, banners, reviews] = await Promise.all([
      getMenuItems({ is_todays_special: true, is_available: true }),
      getMenuItems({ is_bestseller: true, is_available: true }),
      getBanners(),
      getReviews(),
    ]);
  } catch {
    // API may be offline during dev
  }

  return (
    <>
      <Hero />
      <PromoBanners banners={banners} />
      <TodaysSpecials items={specials} />
      <FeaturedDishes items={bestsellers} />
      <WhyChooseUs />
      <ReviewsCarousel reviews={reviews} />
      <ContactSection />
    </>
  );
}
