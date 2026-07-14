import { CampaignsProvider } from "./CampaignsContext";

export default function CampaignsLayout({ children }: { children: React.ReactNode }) {
  return <CampaignsProvider>{children}</CampaignsProvider>;
}
