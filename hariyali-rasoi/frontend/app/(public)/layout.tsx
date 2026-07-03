import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { StickyContactBar } from "@/components/public/StickyContactBar";
import { StoreClosedBanner } from "@/components/public/StoreClosedBanner";
import { PublicMain } from "@/components/public/PublicMain";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <StoreClosedBanner />
      <PublicMain>{children}</PublicMain>
      <Footer />
      <StickyContactBar />
    </>
  );
}
