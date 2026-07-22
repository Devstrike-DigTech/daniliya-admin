import type { Metadata } from "next";
import { apiFetchSafe } from "@/lib/api";
import type { ServiceVertical } from "./actions";
import SettingsTabs, {
  type CurrentUser,
  type PlatformConfigEntry,
  type TeamMember,
} from "./SettingsTabs";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [me, team, config, services] = await Promise.all([
    apiFetchSafe<CurrentUser>("/auth/me"),
    apiFetchSafe<TeamMember[]>("/admin/team"),
    apiFetchSafe<PlatformConfigEntry[]>("/admin/settings/config"),
    apiFetchSafe<ServiceVertical[]>("/admin/services"),
  ]);

  return (
    <SettingsTabs
      me={me}
      team={team ?? []}
      config={config ?? []}
      services={services ?? []}
    />
  );
}
