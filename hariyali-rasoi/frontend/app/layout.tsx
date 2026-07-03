import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, DM_Mono, Kalam } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Hariyali Rasoi — Home-style Indian Food",
    template: "%s | Hariyali Rasoi",
  },
  description:
    "Fresh homestyle Indian meals delivered daily. Order thalis, sabzi, catering & bhandara from Hariyali Rasoi cloud kitchen.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Hariyali Rasoi",
    title: "Hariyali Rasoi — Home-style Indian Food",
    description: "Fresh homestyle Indian meals delivered daily. Order online or on WhatsApp.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable} ${kalam.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#FFF8F0",
              border: "1px solid rgba(212, 169, 106, 0.5)",
              color: "#2C1A0E",
              fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
            },
          }}
        />
      </body>
    </html>
  );
}
