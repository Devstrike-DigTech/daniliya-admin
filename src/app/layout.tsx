import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import DashboardShell, { type ShellUser } from "@/components/DashboardShell";
import ConfirmProvider from "@/components/ConfirmDialog";
import { apiFetchSafe } from "@/lib/api";
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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Null on the auth pages (no cookie yet) — the shell isn't rendered there anyway.
  const me = await apiFetchSafe<ShellUser>("/auth/me");

  return (
    <html lang="en" className={`${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full">
        <ConfirmProvider>
          <DashboardShell user={me}>{children}</DashboardShell>
        </ConfirmProvider>
      </body>
    </html>
  );
}
