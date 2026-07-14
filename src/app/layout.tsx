import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import DashboardShell from "@/components/DashboardShell";
import "./globals.css";

// Fallback until the real Product Sans files are dropped in public/fonts/.
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-fallback",
});

export const metadata: Metadata = {
  title: {
    default: "Command centre",
    template: "%s | Daniliya Admin",
  },
  description:
    "The Daniliya operations console — manage affiliates, influencers, vendors, orders, payouts and finance.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full">
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
