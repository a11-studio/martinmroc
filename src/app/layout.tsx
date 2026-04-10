import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getMetadataBase } from "@/lib/site";
import {
  SEO_DESCRIPTION,
  SEO_KEYWORDS,
  SEO_SITE_NAME,
  SEO_TITLE_DEFAULT,
} from "@/lib/seo";
import PersonJsonLd from "./json-ld";

const base = getMetadataBase();

export const metadata: Metadata = {
  metadataBase: base,
  title: {
    default: SEO_TITLE_DEFAULT,
    template: `%s · ${SEO_SITE_NAME}`,
  },
  description: SEO_DESCRIPTION,
  keywords: [...SEO_KEYWORDS],
  authors: [{ name: SEO_SITE_NAME, url: "https://www.linkedin.com/in/martin-mroc/" }],
  creator: SEO_SITE_NAME,
  publisher: SEO_SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["sk_SK"],
    url: "/",
    siteName: SEO_SITE_NAME,
    title: SEO_TITLE_DEFAULT,
    description: SEO_DESCRIPTION,
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: `${SEO_SITE_NAME} — UX/UI designer, design lead, Bratislava`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_TITLE_DEFAULT,
    description: SEO_DESCRIPTION,
    images: ["/images/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/images/favicon.jpg", type: "image/jpeg", sizes: "44x44" },
    ],
    apple: [
      { url: "/images/thumbnail.jpg", type: "image/jpeg", sizes: "180x180" },
    ],
  },
  category: "design",
  classification: "Portfolio",
  applicationName: SEO_SITE_NAME,
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6b8fd6" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1c1e" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preload" href="/images/bg.png" as="image" />
        <link rel="preload" href="/images/boot-face.svg" as="image" />
        <link rel="preload" href="/images/Martin%20OS.svg" as="image" />
        <link rel="preload" href="/images/crash-face.svg" as="image" />
      </head>
      <body className="h-full overflow-hidden bg-[#6b8fd6] antialiased">
        <PersonJsonLd />
        {children}
      </body>
    </html>
  );
}
