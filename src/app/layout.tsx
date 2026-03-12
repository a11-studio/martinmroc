import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Designer portfolio — interactive desktop experience",
  openGraph: {
    title: "Portfolio",
    description: "Designer portfolio — interactive desktop experience",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full overflow-hidden bg-[#6b8fd6] antialiased">
        {children}
      </body>
    </html>
  );
}
