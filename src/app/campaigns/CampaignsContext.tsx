"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import {
  adminCampaigns,
  type AdminCampaign,
  type CampaignScope,
  type CampaignStatus,
} from "@/lib/dashboard";

// Campaigns carry a few author-only fields the seed data doesn't include.
export type Campaign = AdminCampaign & {
  target?: string;
  doText?: string;
  dontText?: string;
  audience?: string[];
  checked?: string[]; // completed posting-checklist items
};

export type CampaignInput = {
  name: string;
  target: string; // vendor name or "Platform"
  product: string;
  budget: number;
  windowStart: string;
  windowEnd: string;
  deliverables: string[];
  checklist: string[];
  brief: string;
  doText: string;
  dontText: string;
  audience: string[];
  assets: string[];
};

type Ctx = {
  campaigns: Campaign[];
  getCampaign: (id: string) => Campaign | undefined;
  addCampaign: (input: CampaignInput, status: CampaignStatus) => Campaign;
  updateCampaign: (id: string, patch: Partial<Campaign>) => void;
  setStatus: (id: string, status: CampaignStatus) => void;
};

const CampaignsCtx = createContext<Ctx | null>(null);

const slug = (s: string) =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "campaign";

function buildCampaign(input: CampaignInput, status: CampaignStatus): Campaign {
  const scope: CampaignScope = input.target === "Platform" ? "Platform" : "Vendor";
  const id = `CMP-${Date.now().toString(36).slice(-4).toUpperCase()}`;
  const promo = `${slug(input.name).split("-")[0].toUpperCase().slice(0, 6)}-NEW`;
  return {
    id,
    scope,
    name: input.name || "Untitled campaign",
    title: "Marketplace commission",
    product: input.product || input.target,
    type: "CPA",
    status,
    spent: 0,
    budget: input.budget || 0,
    conversions: 0,
    windowStart: input.windowStart || "—",
    windowEnd: input.windowEnd || "—",
    briefHeadline: input.brief ? input.brief.split(/[.\n]/)[0].trim() : input.name,
    briefSub: input.brief || "",
    totalSales: 0,
    revenue: "₦0",
    creators: 0,
    postsLive: 0,
    utm: `https://daniliya.ng/c/${slug(input.name)}?utm_source=influencer&utm_campaign=${slug(input.name)}`,
    promo,
    checklist: input.checklist.length ? input.checklist : ["Download brand assets", "Submit proof of post"],
    deliverables: input.deliverables.length ? input.deliverables : ["1× Instagram Reel"],
    assets: input.assets,
    target: input.target,
    doText: input.doText,
    dontText: input.dontText,
    audience: input.audience,
    checked: [],
  };
}

export function CampaignsProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => adminCampaigns as Campaign[]);

  const getCampaign = useCallback(
    (id: string) => campaigns.find((c) => c.id === id),
    [campaigns],
  );

  const addCampaign = useCallback((input: CampaignInput, status: CampaignStatus) => {
    const created = buildCampaign(input, status);
    setCampaigns((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateCampaign = useCallback((id: string, patch: Partial<Campaign>) => {
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const setStatus = useCallback((id: string, status: CampaignStatus) => {
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  }, []);

  return (
    <CampaignsCtx.Provider value={{ campaigns, getCampaign, addCampaign, updateCampaign, setStatus }}>
      {children}
    </CampaignsCtx.Provider>
  );
}

export function useCampaigns() {
  const ctx = useContext(CampaignsCtx);
  if (!ctx) throw new Error("useCampaigns must be used within CampaignsProvider");
  return ctx;
}
