import type { Metadata } from "next";
import BookingsView from "./BookingsView";

export const metadata: Metadata = { title: "Bookings" };

export default function BookingsPage() {
  return <BookingsView />;
}
