import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Receipt → Story",
  description: "Turn a receipt into a one-line memory",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
