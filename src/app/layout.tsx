import type { Metadata, Viewport } from "next";
import { Inter, Open_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: "Lumina Bank | Online Banking",
  description: "Secure, fast and trusted online banking. Open an account with Lumina Bank today.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Lumina Bank | Online Banking",
    description: "Secure, fast and trusted online banking. Open an account with Lumina Bank today.",
    url: "https://luminabank.online",
    siteName: "Lumina Bank",
    images: [
      {
        url: "https://luminabank.online/hero.jpeg",
        width: 1224,
        height: 816,
        alt: "Lumina Bank – Secure Online Banking",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumina Bank | Online Banking",
    description: "Secure, fast and trusted online banking. Open an account with Lumina Bank today.",
    images: ["https://luminabank.online/hero.jpeg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#DB0011",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${openSans.variable}`}>
      <body className="font-sans antialiased bg-white text-[#333333]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
