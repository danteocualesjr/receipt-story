import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Receipt → Story",
  description: "Turn a receipt into a one-line memory",
  openGraph: {
    title: "Receipt → Story",
    description: "Upload a receipt photo and turn it into a memory worth keeping.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Receipt → Story",
    description: "Upload a receipt photo and turn it into a memory worth keeping.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0e0c",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
