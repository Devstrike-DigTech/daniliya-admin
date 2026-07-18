import type { Metadata } from "next";
import { apiFetchSafe } from "@/lib/api";
import BookingsView, { type AdminBooking } from "./BookingsView";

export const metadata: Metadata = { title: "Bookings" };

export default async function BookingsPage() {
  const bookings = await apiFetchSafe<AdminBooking[]>("/admin/bookings");
  return <BookingsView bookings={bookings ?? []} />;
}
