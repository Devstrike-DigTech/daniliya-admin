import type { Metadata } from "next";
import SettingsTabs from "./SettingsTabs";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return <SettingsTabs />;
}
