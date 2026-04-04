import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
});

export const metadata: Metadata = {
  title: "SteigerHub MVP",
  description: "Multi-tenant SaaS MVP voor steigerbouwers met agency dashboard, dossiers en Stripe."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={`${manrope.variable} font-[family-name:var(--font-manrope)] antialiased`}>{children}</body>
    </html>
  );
}
