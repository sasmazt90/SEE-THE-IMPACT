import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "See The Impact – Sustainability Scores for Brands & Products",
  description: "See The Impact helps users compare brands, analyze products, and understand sustainability scores through real-time AI-powered insights.",
  keywords: "sustainability, eco score, brand score, product analysis, environmental impact, green alternatives, see the impact",
  authors: [{ name: "See The Impact" }],
  metadataBase: new URL("https://seetheimpact.com"),
  alternates: {
    canonical: "https://seetheimpact.com",
  },
  openGraph: {
    title: "See The Impact – Sustainability Scores for Brands & Products",
    description: "Instantly see the environmental footprint behind brands and products, powered by AI.",
    url: "https://seetheimpact.com",
    siteName: "See The Impact",
    type: "website",
    images: [
      {
        url: "/branding/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "See The Impact - Sustainability Analytics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "See The Impact – Sustainability Scores for Brands & Products",
    description: "Analyze the sustainability impact of brands and products with AI.",
    images: ["/branding/opengraph-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://seetheimpact.com" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
