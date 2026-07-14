import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LuxeStay | Premium Boutique Stays & Curated Vacation Rentals",
  description: "Experience absolute luxury. Explore handpicked design cabins, beachfront overwater villas, and sky-high penthouses with 24/7 dedicated concierge service.",
  metadataBase: new URL("https://luxestay.com"),
  openGraph: {
    title: "LuxeStay | Premium Vacation Rentals",
    description: "Experience absolute luxury. Explore handpicked design cabins, beachfront overwater villas, and sky-high penthouses with 24/7 dedicated concierge service.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-dark text-foreground font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
