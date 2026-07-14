// Dummy data for the Daniliya admin portal (the platform command centre).
// Admins oversee marketplace, services, affiliates, influencers and payouts.

export const admin = {
  name: "Samuel Iliya",
  role: "superadmin",
  initials: "SI",
};

export const currentUser = {
  firstName: "Jane",
  initials: "JF",
  code: "DEX-GXY7",
};

export const LANDING_URL =
  process.env.NEXT_PUBLIC_LANDING_URL || "http://localhost:3000";

export const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

/* ── Grouped sidebar nav ─────────────────────────────────── */
export const navGroups = [
  { group: "Overview", items: [{ href: "/", label: "Command centre", icon: "grid" }] },
  {
    group: "People",
    items: [
      { href: "/affiliates", label: "Affiliates", icon: "trending-up" },
      { href: "/influencers", label: "Influencers", icon: "megaphone" },
      { href: "/vendors", label: "Vendors", icon: "store" },
    ],
  },
  {
    group: "Commerce",
    items: [
      { href: "/orders", label: "Orders", icon: "receipt" },
      { href: "/products", label: "Products", icon: "package" },
      { href: "/bookings", label: "Bookings", icon: "calendar" },
    ],
  },
  {
    group: "Money",
    items: [
      { href: "/payouts", label: "Payouts", icon: "wallet" },
      { href: "/finance", label: "Finance", icon: "chart" },
    ],
  },
  {
    group: "Growth",
    items: [
      { href: "/campaigns", label: "Campaigns", icon: "rocket" },
      { href: "/reviews", label: "Reviews", icon: "star" },
      { href: "/support", label: "Support", icon: "support" },
    ],
  },
  {
    group: "System",
    items: [
      { href: "/settings", label: "Settings", icon: "settings" },
      { href: "/audit-log", label: "Audit Log", icon: "search" },
    ],
  },
];

/* ── Command centre ──────────────────────────────────────── */
export const overviewStats = [
  { label: "GMV", value: "₦8,420,000", icon: "trending-up", accent: "bg-brand", soft: "bg-brand text-white", delta: "12.5%", up: true },
  { label: "Orders", value: "412", icon: "receipt", accent: "bg-green-500", soft: "bg-green-500 text-white", delta: "8.2%", up: true },
  { label: "Total users", value: "934", icon: "users", accent: "bg-blue-500", soft: "bg-blue-500 text-white", delta: "5.1%", up: true },
  { label: "Pending payouts", value: "₦2,140,000", icon: "wallet", accent: "bg-[#6d3fa0]", soft: "bg-[#6d3fa0] text-white", delta: "3.4%", up: false },
];

export const weeklyRevenue = [
  { day: "Mon", value: 150 },
  { day: "Tue", value: 90 },
  { day: "Wed", value: 165 },
  { day: "Thur", value: 70 },
  { day: "Fri", value: 175 },
  { day: "Sat", value: 210 },
  { day: "Sun", value: 120 },
];

export const orderAttribution = [
  { label: "Affiliates", pct: 42, color: "bg-brand" },
  { label: "Influencers", pct: 21, color: "bg-orange-500" },
  { label: "Direct", pct: 24, color: "bg-green-500" },
];

export const attentionItems = [
  { text: "3 vendor products awaiting review", href: "/products", tone: "amber" as const },
  { text: "2 influencer applications pending", href: "/influencers", tone: "blue" as const },
  { text: "1 affiliate flagged for review", href: "/affiliates", tone: "red" as const },
];

export const payoutBatches = [
  { ref: "PB-2026-27A", audience: "Affiliates", count: 128, amount: "₦1,280,000", status: "Queued" },
  { ref: "PB-2026-27B", audience: "Influencers", count: 41, amount: "₦512,000", status: "Queued" },
  { ref: "PB-2026-27C", audience: "Vendors", count: 22, amount: "₦348,000", status: "Review" },
];

/* ── People: Affiliates / Influencers / Vendors ──────────── */
export type UserStatus = "Active" | "Pending" | "Suspended" | "Approved" | "Denied";

export type AffiliateTier = "Gold" | "Platinum" | "NIL";
export type AffiliateStatus = "Approved" | "Rejected";

// Platform aggregate cards on the list header (matches design).
export const affiliateSummary = {
  active: 10,
  rejected: 5,
  pendingPayouts: "₦200,600",
  lifetimePayouts: "₦717,600",
};

export const affiliates = [
  { id: "AFF-1201", name: "Adaeze Okonkwo", code: "ADA-9021", bank: "GTBank ****8821", tier: "Gold" as AffiliateTier, clicks: 2840, conv: 84, earnings: "₦148,000", status: "Approved" as AffiliateStatus, state: "Active", tierPct: 18, city: "Abuja", joined: "2025-11-04", email: "adaeze@gmail.com", phone: "+234 802 111 8821", nin: "8821-4410-9022", lifetimeEarnings: "₦147,200", pendingPayout: "₦84,500", sevenDayClicks: 341, sevenDayConv: 13, refundRate: "1.4%", assessment: 88, referral: "https://daniliya.ng/?ref=ADA-9021" },
  { id: "AFF-1202", name: "Kelechi Nwosu", code: "KLC-7712", bank: "Access ****3390", tier: "NIL" as AffiliateTier, clicks: 5210, conv: 34, earnings: "₦96,000", status: "Rejected" as AffiliateStatus, state: "Suspended", tierPct: 0, city: "Lagos", joined: "2025-12-02", email: "kelechi@gmail.com", phone: "+234 806 220 7712", nin: "7712-2210-4415", lifetimeEarnings: "₦96,000", pendingPayout: "₦0", sevenDayClicks: 612, sevenDayConv: 4, refundRate: "6.2%", assessment: 41, referral: "https://daniliya.ng/?ref=KLC-7712" },
  { id: "AFF-1203", name: "Blessing Adamu", code: "BLS-3388", bank: "Kuda ****1180", tier: "NIL" as AffiliateTier, clicks: 1230, conv: 12, earnings: "₦42,000", status: "Rejected" as AffiliateStatus, state: "Suspended", tierPct: 0, city: "Kano", joined: "2026-01-19", email: "blessing@gmail.com", phone: "+234 810 552 3388", nin: "3388-9910-2201", lifetimeEarnings: "₦42,000", pendingPayout: "₦0", sevenDayClicks: 150, sevenDayConv: 2, refundRate: "4.8%", assessment: 38, referral: "https://daniliya.ng/?ref=BLS-3388" },
  { id: "AFF-1204", name: "Emeka Obi", code: "EMK-2211", bank: "GTBank ****6642", tier: "Gold" as AffiliateTier, clicks: 340, conv: 55, earnings: "₦210,000", status: "Approved" as AffiliateStatus, state: "Active", tierPct: 16, city: "Enugu", joined: "2025-10-28", email: "emeka@gmail.com", phone: "+234 803 110 2211", nin: "2211-6640-1180", lifetimeEarnings: "₦210,000", pendingPayout: "₦52,000", sevenDayClicks: 88, sevenDayConv: 9, refundRate: "1.1%", assessment: 82, referral: "https://daniliya.ng/?ref=EMK-2211" },
  { id: "AFF-1205", name: "Beke Agbor", code: "BKE-5501", bank: "Moniepoint ****7788", tier: "NIL" as AffiliateTier, clicks: 2840, conv: 33, earnings: "₦88,000", status: "Rejected" as AffiliateStatus, state: "Suspended", tierPct: 0, city: "Calabar", joined: "2026-02-11", email: "beke@gmail.com", phone: "+234 802 447 5501", nin: "5501-7780-3390", lifetimeEarnings: "₦88,000", pendingPayout: "₦0", sevenDayClicks: 300, sevenDayConv: 3, refundRate: "5.5%", assessment: 44, referral: "https://daniliya.ng/?ref=BKE-5501" },
  { id: "AFF-1206", name: "Davina Rachel", code: "FTB-6600", bank: "Wema ****9014", tier: "Gold" as AffiliateTier, clicks: 2840, conv: 54, earnings: "₦168,000", status: "Approved" as AffiliateStatus, state: "Active", tierPct: 17, city: "Ibadan", joined: "2025-11-22", email: "davina@gmail.com", phone: "+234 806 990 6600", nin: "6600-9010-7714", lifetimeEarnings: "₦168,000", pendingPayout: "₦36,000", sevenDayClicks: 260, sevenDayConv: 7, refundRate: "1.9%", assessment: 79, referral: "https://daniliya.ng/?ref=FTB-6600" },
  { id: "AFF-1207", name: "Princess Tereza", code: "PRT-9021", bank: "GTBank ****4412", tier: "Platinum" as AffiliateTier, clicks: 3120, conv: 54, earnings: "₦255,000", status: "Approved" as AffiliateStatus, state: "Active", tierPct: 24, city: "Abuja", joined: "2025-09-30", email: "princess@gmail.com", phone: "+234 803 220 9021", nin: "9021-4410-8821", lifetimeEarnings: "₦255,000", pendingPayout: "₦72,000", sevenDayClicks: 400, sevenDayConv: 11, refundRate: "0.9%", assessment: 91, referral: "https://daniliya.ng/?ref=PRT-9021" },
];

export type Affiliate = (typeof affiliates)[number];

// Payouts & Assessment tab data (design-shaped; derived from the affiliate).
export function affiliatePayoutData(a: Affiliate) {
  const seed = Number(a.id.replace(/\D/g, ""));
  const letter = String.fromCharCode(65 + (seed % 6));
  const history =
    a.status === "Rejected"
      ? []
      : [
          { batch: `PB-2026-26${letter}`, date: "2026-06-29", amount: "₦930,000", status: "Paid" },
          { batch: `PB-2026-25${letter}`, date: "2026-06-22", amount: "₦480,000", status: "Paid" },
          { batch: `PB-2026-24${letter}`, date: "2026-06-15", amount: "₦216,000", status: "Paid" },
        ];
  return {
    summary: {
      toDate: history.length,
      totalPaid: a.lifetimeEarnings,
      pendingRelease: a.pendingPayout,
      lastPayout: history[0]?.date ?? "—",
    },
    history,
    bank: a.bank,
    bankNote: a.status === "Approved" ? "Verified · Last payout 2026-06-23" : "Unverified",
  };
}

// Assessment breakdown for the Payouts & Assessment tab.
export function affiliateAssessment(a: Affiliate) {
  return {
    score: a.assessment,
    date: "2025-11-05",
    breakdown: [
      ["Pending release", Math.min(100, a.assessment + 4)] as [string, number],
      ["Compliance", a.assessment] as [string, number],
      ["Content quality", Math.max(0, a.assessment - 12)] as [string, number],
    ],
  };
}

// Products this affiliate promotes (Products tab).
const AFF_PRODUCTS = [
  { name: "The Builder's Handbook", revenue: "₦930,000" },
  { name: "Sparkle Home Kit", revenue: "₦480,000" },
  { name: "Amber Candle 200ml", revenue: "₦216,000" },
  { name: "Handbook Gift Bundle", revenue: "₦200,000" },
];
export function affiliateProducts(a: Affiliate) {
  const seed = Number(a.id.replace(/\D/g, ""));
  return AFF_PRODUCTS.map((p, i) => ({
    ...p,
    sold: ((seed + i * 13) % 60) + 8,
    commission: "₦232,500",
    last: `${(i % 3) + 1} days ago`,
  }));
}

export type InfluencerStatus = "Approved" | "Pending" | "Rejected";

export const influencerSummary = {
  active: 10,
  awaiting: 5,
  pendingPayouts: "₦200,600",
  lifetimePayouts: "₦717,600",
};

export const influencers = [
  { id: "INF-2401", name: "Ibrahim Musa", handle: "@ibrahim.builds", code: "IBM-9021", followers: "123k", campaigns: 2, earnings: "₦148,000", status: "Approved" as InfluencerStatus, niche: "Building & DIY", joined: "2026-01-14", email: "ibrahim@creators.ng", phone: "+234 803 114 9021", city: "Kaduna" },
  { id: "INF-2402", name: "Zara Yakubu", handle: "@skyline.live", code: "ZRA-4412", followers: "299k", campaigns: 4, earnings: "₦148,000", status: "Pending" as InfluencerStatus, niche: "Lifestyle", joined: "2026-05-02", email: "zara@creators.ng", phone: "+234 806 552 4412", city: "Abuja" },
  { id: "INF-2403", name: "Maya Brooks", handle: "@maya.makes", code: "MYA-3388", followers: "2,342", campaigns: 2, earnings: "₦148,000", status: "Approved" as InfluencerStatus, niche: "Crafts", joined: "2026-02-19", email: "maya@creators.ng", phone: "+234 810 447 3388", city: "Lagos" },
  { id: "INF-2404", name: "Evan Reed", handle: "@evan.designs", code: "EVN-2211", followers: "43k", campaigns: 5, earnings: "₦148,000", status: "Pending" as InfluencerStatus, niche: "Design", joined: "2026-05-20", email: "evan@creators.ng", phone: "+234 802 990 2211", city: "Port Harcourt" },
  { id: "INF-2405", name: "Sofia Lane", handle: "@sofia.creates", code: "SFA-6600", followers: "210k", campaigns: 6, earnings: "₦148,000", status: "Approved" as InfluencerStatus, niche: "Beauty", joined: "2025-12-11", email: "sofia@creators.ng", phone: "+234 803 220 6600", city: "Ibadan" },
  { id: "INF-2406", name: "Jasper Cole", handle: "@jasper.art", code: "JSP-5501", followers: "12k", campaigns: 2, earnings: "₦148,000", status: "Pending" as InfluencerStatus, niche: "Art", joined: "2026-06-01", email: "jasper@creators.ng", phone: "+234 806 990 5501", city: "Enugu" },
  { id: "INF-2407", name: "Nina Patel", handle: "@nina.draws", code: "NNA-9021", followers: "1M", campaigns: 1, earnings: "₦148,000", status: "Approved" as InfluencerStatus, niche: "Illustration", joined: "2025-10-30", email: "nina@creators.ng", phone: "+234 803 114 7712", city: "Abuja" },
];

export type Influencer = (typeof influencers)[number];

export function influencerStats(i: Influencer) {
  const seed = Number(i.id.replace(/\D/g, ""));
  return {
    lifetimeEarnings: "₦147,200",
    conversions: 40 + (seed % 60),
    followers: i.followers,
    pendingPayout: i.status === "Approved" ? "₦84,500" : "₦0",
    engagement: `${(2 + (seed % 40) / 10).toFixed(1)}%`,
    role: `${i.niche} creator`,
    bank: "GTBank ****8821",
    bankFull: "GTBank ****4412",
    bankNote: i.status === "Approved" ? "Verified · Last payout 2026-06-23" : "Unverified",
  };
}
export function influencerSocial(i: Influencer) {
  const h = i.handle.replace("@", "");
  return [
    { platform: "Instagram", handle: i.handle, stat: `${i.followers} followers` },
    { platform: "YouTube", handle: `@${h}`, stat: "45k subscribers" },
    { platform: "X", handle: i.handle, stat: "34k followers" },
    { platform: "TikTok", handle: `@${h}`, stat: "23k followers" },
  ];
}
// Campaigns tab — campaign / posts / reach / conv / earnings / status.
const INF_CAMPAIGNS = [
  { campaign: "Handbook Push · Q3", brand: "Daniliya Books", posts: 4, reach: "218,000", conv: 142, earnings: "₦520,000", status: "Live" },
  { campaign: "Sparkle Launch Bundle", brand: "Sparkle & Co.", posts: 2, reach: "128,000", conv: 234, earnings: "₦210,000", status: "Live" },
  { campaign: "Amber & Oak Holiday", brand: "Amber & Oak", posts: 5, reach: "96,000", conv: 68, earnings: "₦162,000", status: "Ended" },
];
export function influencerCampaignRows(i: Influencer) {
  const n = Math.max(1, Math.min(3, i.campaigns || 1));
  return INF_CAMPAIGNS.slice(0, n);
}

export function influencerPayoutSummary(i: Influencer) {
  const rows = influencerPayoutRows(i);
  return {
    toDate: rows.length,
    totalPaid: "₦620,000",
    pendingRelease: i.status === "Approved" ? "₦84,500" : "₦0",
    lastPayout: rows[0]?.date ?? "—",
  };
}
export function influencerPayoutRows(i: Influencer) {
  if (i.status !== "Approved") return [] as { batch: string; date: string; amount: string; status: string }[];
  const seed = Number(i.id.replace(/\D/g, ""));
  const l = String.fromCharCode(65 + (seed % 6));
  return [
    { batch: `PB-2026-26${l}`, date: "2026-06-29", amount: "₦930,000", status: "Paid" },
    { batch: `PB-2026-25${l}`, date: "2026-06-22", amount: "₦480,000", status: "Paid" },
    { batch: `PB-2026-24${l}`, date: "2026-06-15", amount: "₦216,000", status: "Paid" },
  ];
}

// Content tab — recent content submissions (media cards).
export function influencerContentRows(i: Influencer) {
  const campaign = influencerCampaignRows(i)[0]?.campaign.split(" · ")[0] ?? "Handbook Push";
  return Array.from({ length: 3 }, (_, k) => ({
    title: `${campaign} · Reel #${k + 1}`,
    status: "Approved",
    views: "12.4k views",
  }));
}

export type VendorStatus = "Approved" | "Pending" | "Rejected";

export const vendorSummary = {
  active: 10,
  awaiting: 5,
  productsLive: 239,
  feeProfit: "₦1,717,600",
};

export const vendors = [
  { id: "VND-901", name: "Sparkle & Co.", code: "VND-901", category: "Cleaning supplies", city: "Lagos", products: 24, earnings: "₦148,000", status: "Approved" as VendorStatus, legalName: "Sparkle & Co. Ltd", rc: "RC-1204882", email: "hello@sparkle.ng", phone: "+234 802 118 9021", address: "12 Adeola Odeku, Victoria Island, Lagos", onboarded: "2025-08-14", takeRate: 10, payoutCycle: "Weekly · Monday", rating: 4.7, reviews: 214, gmv30: "₦2,120,000", orders30: 118, platformEarned: "₦212,000", lifetimeEarned: "₦1,696,000", attributedOrders: 24, attributionSub: "3 affiliate · 2 influencer", pendingPayout: "₦318,000", nextPayout: "Mon, Jul 6" },
  { id: "VND-902", name: "Amber & Oak", code: "VND-902", category: "Home fragrance", city: "Lagos", products: 12, earnings: "₦148,000", status: "Pending" as VendorStatus, legalName: "Amber & Oak Ltd", rc: "RC-2209471", email: "hello@amberoak.ng", phone: "+234 806 552 4412", address: "8 Bourdillon Rd, Ikoyi, Lagos", onboarded: "2026-04-11", takeRate: 12, payoutCycle: "Weekly · Monday", rating: 4.3, reviews: 66, gmv30: "₦840,000", orders30: 52, platformEarned: "₦100,800", lifetimeEarned: "₦420,000", attributedOrders: 9, attributionSub: "2 affiliate · 1 influencer", pendingPayout: "₦0", nextPayout: "—" },
  { id: "VND-903", name: "Naija Wellness", code: "VND-903", category: "Personal care", city: "Abuja", products: 6, earnings: "₦148,000", status: "Approved" as VendorStatus, legalName: "Naija Wellness Ltd", rc: "RC-3388120", email: "hello@naijawellness.ng", phone: "+234 810 447 3388", address: "22 Aminu Kano Cres, Wuse 2, Abuja", onboarded: "2026-02-19", takeRate: 10, payoutCycle: "Weekly · Monday", rating: 4.8, reviews: 130, gmv30: "₦1,240,000", orders30: 74, platformEarned: "₦124,000", lifetimeEarned: "₦680,000", attributedOrders: 15, attributionSub: "4 affiliate · 3 influencer", pendingPayout: "₦96,000", nextPayout: "Mon, Jul 6" },
  { id: "VND-904", name: "Green Fields Farm", code: "VND-904", category: "Organic food", city: "Abuja", products: 5, earnings: "₦148,000", status: "Pending" as VendorStatus, legalName: "Green Fields Farm Ltd", rc: "RC-4820193", email: "hello@greenfields.ng", phone: "+234 802 990 2211", address: "Plot 14 Kubwa Expressway, Abuja", onboarded: "2026-05-20", takeRate: 10, payoutCycle: "Weekly · Monday", rating: 4.1, reviews: 21, gmv30: "₦360,000", orders30: 28, platformEarned: "₦36,000", lifetimeEarned: "₦120,000", attributedOrders: 4, attributionSub: "1 affiliate · 0 influencer", pendingPayout: "₦0", nextPayout: "—" },
  { id: "VND-905", name: "Sofia Chairs", code: "VND-905", category: "Furniture", city: "Lagos", products: 6, earnings: "₦148,000", status: "Rejected" as VendorStatus, legalName: "Sofia Chairs Ltd", rc: "RC-5501778", email: "hello@sofiachairs.ng", phone: "+234 803 220 6600", address: "45 Admiralty Way, Lekki, Lagos", onboarded: "2026-03-02", takeRate: 12, payoutCycle: "Weekly · Monday", rating: 3.4, reviews: 40, gmv30: "₦280,000", orders30: 18, platformEarned: "₦33,600", lifetimeEarned: "₦88,000", attributedOrders: 2, attributionSub: "1 affiliate · 0 influencer", pendingPayout: "₦0", nextPayout: "—" },
  { id: "VND-906", name: "Jasper Studio", code: "VND-906", category: "Art", city: "Lagos", products: 2, earnings: "₦148,000", status: "Pending" as VendorStatus, legalName: "Jasper Studio Ltd", rc: "RC-6600901", email: "hello@jasperstudio.ng", phone: "+234 806 990 5501", address: "3 Glover Rd, Ikoyi, Lagos", onboarded: "2026-06-01", takeRate: 12, payoutCycle: "Weekly · Monday", rating: 4.0, reviews: 12, gmv30: "₦150,000", orders30: 9, platformEarned: "₦18,000", lifetimeEarned: "₦52,000", attributedOrders: 2, attributionSub: "0 affiliate · 1 influencer", pendingPayout: "₦0", nextPayout: "—" },
  { id: "VND-907", name: "Nina Home", code: "VND-907", category: "Cleaning supplies", city: "Abuja", products: 1, earnings: "₦148,000", status: "Approved" as VendorStatus, legalName: "Nina Home Ltd", rc: "RC-9021441", email: "hello@ninahome.ng", phone: "+234 803 114 7712", address: "10 Gana St, Maitama, Abuja", onboarded: "2025-10-30", takeRate: 10, payoutCycle: "Weekly · Monday", rating: 4.6, reviews: 88, gmv30: "₦520,000", orders30: 33, platformEarned: "₦52,000", lifetimeEarned: "₦255,000", attributedOrders: 6, attributionSub: "2 affiliate · 1 influencer", pendingPayout: "₦40,000", nextPayout: "Mon, Jul 6" },
];

export type Vendor = (typeof vendors)[number];

export function vendorBestProduct(v: Vendor) {
  const seed = Number(v.id.replace(/\D/g, ""));
  const names = ["Home Sparkle Kit (Large)", "Amber Candle 200ml", "Herbal Body Wash", "Organic Veg Box", "Oak Dining Chair", "Canvas Print A2", "Micro-fibre Bundle"];
  return { name: names[seed % names.length], sold: 40 + (seed % 40), revenue: v.gmv30, take: v.platformEarned };
}
// Products tab — product / price / stock / sold 30d / revenue / programs.
const VND_PRODUCTS = [
  { name: "Home Sparkle Kit (Large)", price: "₦24,500", stock: 42, sold: 68, revenue: "₦1,666,000", programs: ["Affiliate", "Influencer"] },
  { name: "Bathroom Deep-Clean Bundle", price: "₦14,000", stock: 23, sold: 234, revenue: "₦476,000", programs: ["Affiliate"] },
  { name: "Eco Multi-Surface Spray", price: "₦4,500", stock: 12, sold: 68, revenue: "₦162,000", programs: ["Influencer"] },
];
export function vendorProductRows(v: Vendor) {
  const n = Math.max(1, Math.min(3, v.products || 1));
  return VND_PRODUCTS.slice(0, n);
}

// Orders tab — order / customer / revenue / channel / status / date.
const VND_ORDERS = [
  { ref: "ORD-40021", customer: "Tunde Adebayo", revenue: "₦1,666,000", channel: "affiliate", status: "Shipped", date: "Jul 1" },
  { ref: "ORD-40024", customer: "Fatima Bello", revenue: "₦476,000", channel: "affiliate", status: "Packed", date: "Jul 4" },
  { ref: "ORD-40015", customer: "Grace Bello", revenue: "₦162,000", channel: "Direct", status: "Delivered", date: "Jul 15" },
];
export function vendorOrderRows(v: Vendor) {
  const n = Math.max(1, Math.min(3, v.orders30 > 30 ? 3 : 2));
  return VND_ORDERS.slice(0, n);
}

// Finance tab — payout history.
export function vendorPayoutRows(v: Vendor) {
  if (v.status !== "Approved") return [] as { batch: string; date: string; amount: string; status: string }[];
  const seed = Number(v.id.replace(/\D/g, ""));
  const l = String.fromCharCode(65 + (seed % 6));
  return [
    { batch: `PB-2026-26${l}`, date: "2026-06-29", amount: "₦930,000", status: "Paid" },
    { batch: `PB-2026-25${l}`, date: "2026-06-22", amount: "₦480,000", status: "Paid" },
    { batch: `PB-2026-24${l}`, date: "2026-06-15", amount: "₦216,000", status: "Paid" },
  ];
}

/* ── Commerce ────────────────────────────────────────────── */
export const orderSummary = {
  total: 100,
  newOrders: 10,
  completed: 25,
  feeProfit: "₦1,717,600",
};

export const adminOrders = [
  { ref: "ORD-40021", date: "2026-07-01 09:14", customer: "Chinelo Adigwe", city: "Lagos", address: "14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria", phone: "+234 802 555 0199", vendor: "Sparkle & Co.", vendorCity: "Lagos", channel: "Affiliate", channelHandle: "DAN-462", channelFollowers: "", total: "₦25,000", status: "New", items: [{ name: "Eco Dish Soap 500ml", qty: 2, price: 12500 }], payment: { method: "Card · Paystack", ref: "PAY-2202-88211", status: "Paid" }, deliveryAt: "2026-06-30 15:02" },
  { ref: "ORD-40022", date: "2026-07-01 09:14", customer: "Adaeze Okonkwo", city: "Lagos", address: "14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria", phone: "+234 802 555 0199", vendor: "Amber & Oak", vendorCity: "Lagos", channel: "Influencer", channelHandle: "@Richflex", channelFollowers: "23k followers", total: "₦25,000", status: "Confirmed", items: [{ name: "Amber Candle 200ml", qty: 2, price: 12500 }], payment: { method: "Card · Paystack", ref: "PAY-2202-88214", status: "Paid" }, deliveryAt: "2026-06-30 15:02" },
  { ref: "ORD-40023", date: "2026-07-01 09:14", customer: "Grace Bello", city: "Abuja", address: "22 Aminu Kano Cres, Wuse 2, Abuja, Nigeria", phone: "+234 803 221 7788", vendor: "Naija Wellness", vendorCity: "Abuja", channel: "Web", channelHandle: "", channelFollowers: "", total: "₦18,000", status: "Packed", items: [{ name: "Herbal Body Wash", qty: 1, price: 18000 }], payment: { method: "Transfer · Wema", ref: "PAY-2202-88220", status: "Paid" }, deliveryAt: "2026-06-29 11:20" },
  { ref: "ORD-40024", date: "2026-07-01 09:14", customer: "Fatima Bello", city: "Kano", address: "5 Zoo Rd, Kano, Nigeria", phone: "+234 806 010 3345", vendor: "Sparkle & Co.", vendorCity: "Lagos", channel: "Affiliate", channelHandle: "DAN-518", channelFollowers: "", total: "₦88,000", status: "Shipped", items: [{ name: "Home Sparkle Kit (Large)", qty: 1, price: 88000 }], payment: { method: "Card · Paystack", ref: "PAY-2202-88231", status: "Paid" }, deliveryAt: "2026-06-28 09:40" },
  { ref: "ORD-40025", date: "2026-07-01 09:14", customer: "Kelechi Nwosu", city: "Enugu", address: "3 Ogui Rd, Enugu, Nigeria", phone: "+234 810 552 6642", vendor: "Amber & Oak", vendorCity: "Lagos", channel: "Direct", channelHandle: "", channelFollowers: "", total: "₦42,000", status: "Delivered", items: [{ name: "Oak Diffuser Set", qty: 1, price: 42000 }], payment: { method: "Card · Paystack", ref: "PAY-2202-88240", status: "Paid" }, deliveryAt: "2026-06-27 16:10" },
];

export type ProductStatus = "Published" | "Rejected" | "Pending";
export type ProductScope = "Platform" | "Vendor";

export const productSummary = {
  total: 100,
  published: 100,
  salesFromProducts: "25",
  feeProfit: "₦1,717,600",
};

export const adminProducts = [
  { id: "p1", name: "Side stool", category: "Chair", scope: "Vendor" as ProductScope, source: "Marketplace", vendor: "Sofia Chairs", price: "₦12,500", status: "Published" as ProductStatus, salesPrice: "₦12,500", costPrice: "₦11,000", stock: 200, minStock: 11, marginPct: 12, profitPerUnit: "₦1,500", unitsSold: 55, revenue: "₦1,000,500", totalProfit: "₦501,600", channels: 3, rating: 4.2, reviews: 43 },
  { id: "p2", name: "Wooden frame mirror", category: "Home decor", scope: "Vendor" as ProductScope, source: "Marketplace", vendor: "Sparkle & Co.", price: "₦15,000", status: "Rejected" as ProductStatus, salesPrice: "₦15,000", costPrice: "₦9,300", stock: 42, minStock: 8, marginPct: 38, profitPerUnit: "₦5,700", unitsSold: 12, revenue: "₦180,000", totalProfit: "₦68,400", channels: 1, rating: 3.9, reviews: 11 },
  { id: "p3", name: "Landscape painting", category: "Art", scope: "Vendor" as ProductScope, source: "Marketplace", vendor: "Jasper Studio", price: "₦15,000", status: "Published" as ProductStatus, salesPrice: "₦15,000", costPrice: "₦8,000", stock: 15, minStock: 5, marginPct: 47, profitPerUnit: "₦7,000", unitsSold: 34, revenue: "₦510,000", totalProfit: "₦238,000", channels: 2, rating: 4.6, reviews: 22 },
  { id: "p4", name: "Work Stool", category: "Chair", scope: "Vendor" as ProductScope, source: "Marketplace", vendor: "Sofia Chairs", price: "₦15,000", status: "Published" as ProductStatus, salesPrice: "₦15,000", costPrice: "₦10,200", stock: 88, minStock: 10, marginPct: 32, profitPerUnit: "₦4,800", unitsSold: 41, revenue: "₦615,000", totalProfit: "₦196,800", channels: 3, rating: 4.4, reviews: 30 },
  { id: "p5", name: "Classy Mirror", category: "Home decor", scope: "Vendor" as ProductScope, source: "Marketplace", vendor: "Sparkle & Co.", price: "₦15,000", status: "Published" as ProductStatus, salesPrice: "₦15,000", costPrice: "₦9,000", stock: 60, minStock: 12, marginPct: 40, profitPerUnit: "₦6,000", unitsSold: 28, revenue: "₦420,000", totalProfit: "₦168,000", channels: 2, rating: 4.5, reviews: 19 },
  { id: "p6", name: "Amber Candle 200ml", category: "Home fragrance", scope: "Vendor" as ProductScope, source: "Marketplace", vendor: "Amber & Oak", price: "₦12,500", status: "Pending" as ProductStatus, salesPrice: "₦12,500", costPrice: "₦6,800", stock: 234, minStock: 33, marginPct: 46, profitPerUnit: "₦5,700", unitsSold: 62, revenue: "₦775,000", totalProfit: "₦353,400", channels: 2, rating: 4.7, reviews: 51 },
  { id: "p7", name: "The Builder's Handbook", category: "Digital", scope: "Platform" as ProductScope, source: "Digital", vendor: "Daniliya Books", price: "₦15,000", status: "Published" as ProductStatus, salesPrice: "₦15,000", costPrice: "₦4,000", stock: 999, minStock: 0, marginPct: 73, profitPerUnit: "₦11,000", unitsSold: 620, revenue: "₦9,300,000", totalProfit: "₦6,820,000", channels: 3, rating: 4.8, reviews: 214 },
  { id: "p8", name: "The Daniliya Method", category: "Digital", scope: "Platform" as ProductScope, source: "Digital", vendor: "Daniliya Books", price: "₦15,000", status: "Pending" as ProductStatus, salesPrice: "₦15,000", costPrice: "₦4,000", stock: 999, minStock: 0, marginPct: 73, profitPerUnit: "₦11,000", unitsSold: 0, revenue: "₦0", totalProfit: "₦0", channels: 0, rating: 0, reviews: 0 },
];

export type AdminProduct = (typeof adminProducts)[number];

// Real product photography (public/images/products) mapped deterministically by name.
const PRODUCT_IMAGES = [
  "/images/products/executive-hygiene-bundle.jpg",
  "/images/products/premium-laundry-starter-kit.jpg",
  "/images/products/branded-uniform-set.jpg",
  "/images/products/affiliate-success-course.jpg",
  "/images/products/the-daniliya-method.jpg",
  "/images/products/ghost-boys.jpg",
];
function imageIndex(key: string) {
  // Admin catalogue products get a unique image each; other keys (order items) hash in.
  const idx = adminProducts.findIndex((p) => p.name === key || p.id === key);
  if (idx >= 0) return idx;
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h;
}
export function productImage(key: string) {
  return PRODUCT_IMAGES[imageIndex(key) % PRODUCT_IMAGES.length];
}
export function productGallery(key: string) {
  const start = imageIndex(key) % PRODUCT_IMAGES.length;
  return Array.from({ length: 4 }, (_, k) => PRODUCT_IMAGES[(start + k) % PRODUCT_IMAGES.length]);
}

export type BookingStatus = "Requested" | "In progress" | "Completed" | "Confirmed";

export const bookingSummary = {
  requested: 100,
  confirmed: 10,
  inProgress: 25,
  completedValue: "₦1,717,600",
};

export const bookings = [
  { ref: "BKG-5502", date: "2025-11-04", customer: "Chinelo Adigwe", email: "chinelo@gmail.com", city: "Abuja", phone: "+234 802 111 8821", status: "Requested" as BookingStatus, service: "Dry cleaning", amount: "₦45,000", attachments: 3, address: "14 Admiralty Way, Lekki Phase 1, Lagos", description: "I need a deep clean for my office all 10 rooms, one board room, 12 toilets and kitchen" },
  { ref: "BKG-5503", date: "2025-11-04", customer: "Ibrahim Sani", email: "ibrahim@gmail.com", city: "Lagos", phone: "+234 806 552 3390", status: "Completed" as BookingStatus, service: "Industrial cleaning", amount: "₦120,000", attachments: 3, address: "Plot 5 Ikeja Industrial Estate, Lagos", description: "Warehouse floor and windows — end of quarter deep clean across two levels." },
  { ref: "BKG-5504", date: "2025-11-04", customer: "Grace Okoro", email: "grace@gmail.com", city: "Lagos", phone: "+234 810 447 7712", status: "Requested" as BookingStatus, service: "Laundry", amount: "₦18,000", attachments: 3, address: "22 Bourdillon Rd, Ikoyi, Lagos", description: "Weekly laundry service for a family of five, delicate fabrics and ironing included." },
  { ref: "BKG-5505", date: "2025-11-04", customer: "Tunde Balogun", email: "tunde@gmail.com", city: "Lagos", phone: "+234 803 220 6600", status: "In progress" as BookingStatus, service: "Industrial cleaning", amount: "₦85,000", attachments: 3, address: "8 Adeola Odeku, Victoria Island, Lagos", description: "Office end-of-tenancy clean — 6 rooms, reception, and two rest rooms." },
  { ref: "BKG-5506", date: "2025-11-04", customer: "Ada Nwosu", email: "ada@gmail.com", city: "Lagos", phone: "+234 806 990 5501", status: "Confirmed" as BookingStatus, service: "Dry cleaning", amount: "₦32,000", attachments: 3, address: "3 Glover Rd, Ikoyi, Lagos", description: "Curtains and rugs across a 4-bedroom duplex, pickup and delivery." },
];

/* ── Growth / Money ──────────────────────────────────────── */
export type CampaignStatus = "Live" | "Scheduled" | "Draft" | "Paused" | "Ended";
export type CampaignScope = "Platform" | "Vendor";

export const adminCampaigns = [
  {
    id: "CMP-A21", scope: "Platform" as CampaignScope, name: "Handbook Push · Q3", title: "Marketplace commission",
    product: "Daniliya Books", type: "CPA", status: "Live" as CampaignStatus,
    spent: 812000, budget: 2000000, conversions: 412, windowStart: "2026-06-15", windowEnd: "2026-07-30",
    briefHeadline: "Nigeria's #1 practical builder playbook — real numbers, real stories.",
    briefSub: "Drive 1,000 net-new Handbook sales in Q3 via affiliate creators tier Gold and above.",
    totalSales: 200, revenue: "₦255,500", creators: 100, postsLive: 148,
    utm: "https://daniliya.ng/products/builders-handbook?utm_source=influencer&utm_campaign=jun-book&via=ADA",
    promo: "BUILD-ADA",
    checklist: ["Download brand assets", "Add UTM link to bio / pinned comment", "Mention promo code on camera", "Publish post within campaign window", "Submit proof of post to Daniliya"],
    deliverables: ["1× Instagram Reel (45–60s)", "3× WhatsApp Status frames", "1× X / Twitter thread (5 posts)"],
    assets: ["Hero image", "Story frame", "Carousel pack", "Caption pack", "Caption pack"],
  },
  {
    id: "CMP-A22", scope: "Vendor" as CampaignScope, name: "Sparkle Spring Sale", title: "Marketplace commission",
    product: "Sparkle & Co.", type: "Hybrid", status: "Scheduled" as CampaignStatus,
    spent: 0, budget: 1500000, conversions: 0, windowStart: "2026-06-15", windowEnd: "2026-07-30",
    briefHeadline: "Spring-clean every Lagos home with Sparkle.", briefSub: "Recruit lifestyle creators to drive first-time Sparkle orders.",
    totalSales: 0, revenue: "₦0", creators: 0, postsLive: 0,
    utm: "https://daniliya.ng/vendors/sparkle?utm_source=influencer&utm_campaign=spring", promo: "SPARKLE-10",
    checklist: ["Download brand assets", "Add UTM link to bio", "Publish within window", "Submit proof"],
    deliverables: ["1× Instagram Reel (30s)", "2× Story frames"],
    assets: ["Hero image", "Story frame"],
  },
  {
    id: "CMP-A23", scope: "Platform" as CampaignScope, name: "Books Launch Teaser", title: "Marketplace commission",
    product: "Daniliya Books", type: "CPA", status: "Draft" as CampaignStatus,
    spent: 0, budget: 2000000, conversions: 0, windowStart: "2026-06-15", windowEnd: "2026-07-30",
    briefHeadline: "Tease the next Daniliya bestseller.", briefSub: "Warm up the audience ahead of launch week.",
    totalSales: 0, revenue: "₦0", creators: 0, postsLive: 0,
    utm: "https://daniliya.ng/products/next-book?utm_source=influencer", promo: "TEASE-ADA",
    checklist: ["Download brand assets", "Draft caption", "Submit for review"],
    deliverables: ["1× Instagram Reel"], assets: ["Hero image"],
  },
  {
    id: "CMP-A24", scope: "Platform" as CampaignScope, name: "Meal-Prep Momentum", title: "Marketplace commission",
    product: "Naija Eats", type: "CPA", status: "Live" as CampaignStatus,
    spent: 640000, budget: 1200000, conversions: 280, windowStart: "2026-06-15", windowEnd: "2026-07-30",
    briefHeadline: "Fresh meals, zero prep.", briefSub: "Drive weekly meal-box subscriptions via food creators.",
    totalSales: 140, revenue: "₦168,000", creators: 42, postsLive: 61,
    utm: "https://daniliya.ng/vendors/naija-eats?utm_source=influencer", promo: "EATS-FRESH",
    checklist: ["Download brand assets", "Add UTM link", "Publish within window", "Submit proof"],
    deliverables: ["1× Instagram Reel", "2× Story frames"], assets: ["Hero image", "Story frame", "Carousel pack"],
  },
  {
    id: "CMP-A25", scope: "Vendor" as CampaignScope, name: "Amber Ambience", title: "Marketplace commission",
    product: "Amber & Oak", type: "Hybrid", status: "Scheduled" as CampaignStatus,
    spent: 0, budget: 1500000, conversions: 0, windowStart: "2026-06-15", windowEnd: "2026-07-30",
    briefHeadline: "Set the mood with Amber & Oak.", briefSub: "Home-fragrance creators drive first orders.",
    totalSales: 0, revenue: "₦0", creators: 0, postsLive: 0,
    utm: "https://daniliya.ng/vendors/amber-oak?utm_source=influencer", promo: "AMBER-08",
    checklist: ["Download brand assets", "Publish within window", "Submit proof"],
    deliverables: ["1× Instagram Reel"], assets: ["Hero image"],
  },
  {
    id: "CMP-A26", scope: "Vendor" as CampaignScope, name: "Chairs Clearance", title: "Marketplace commission",
    product: "Sofia Chairs", type: "CPA", status: "Draft" as CampaignStatus,
    spent: 0, budget: 2000000, conversions: 0, windowStart: "2026-06-15", windowEnd: "2026-07-30",
    briefHeadline: "Seats that sell themselves.", briefSub: "Furniture creators move end-of-line stock.",
    totalSales: 0, revenue: "₦0", creators: 0, postsLive: 0,
    utm: "https://daniliya.ng/vendors/sofia-chairs?utm_source=influencer", promo: "CHAIRS-15",
    checklist: ["Download brand assets", "Submit for review"], deliverables: ["1× Instagram Reel"], assets: ["Hero image"],
  },
];

export type AdminCampaign = (typeof adminCampaigns)[number];

// Influencer post submissions shown on a campaign detail's "Post submissions" tab.
export const campaignSubmissions = [
  { influencer: "Balogun Tawio", followers: "23k" },
  { influencer: "Jerome Bell", followers: "89k" },
  { influencer: "Cameron Williamson", followers: "10k" },
  { influencer: "Courtney Henry", followers: "1M" },
  { influencer: "Savannah Nguyen", followers: "2.5M" },
];

export type PayoutStatus = "Scheduled" | "Review" | "Paid" | "Failed";

export const payoutSummary = {
  queued: "₦12,180,000",
  queuedSub: "238 recipients across 3 batches",
  paidLastCycle: "₦9,730,000",
  failed: 1,
  failedRef: "PB-2026-25I",
};

export const adminPayouts = [
  { ref: "PB-2026-27A", type: "Affiliate", runDate: "2026-07-06 9:00", recipients: 198, total: "₦4,120,033", status: "Scheduled" as PayoutStatus },
  { ref: "PB-2026-27B", type: "Influencer", runDate: "2026-07-06 9:00", recipients: 124, total: "₦1,120,033", status: "Review" as PayoutStatus },
  { ref: "PB-2026-27C", type: "Vendor", runDate: "2026-07-06 9:00", recipients: 34, total: "₦6,120,033", status: "Paid" as PayoutStatus },
  { ref: "PB-2026-25I", type: "Affiliate", runDate: "2026-07-06 9:00", recipients: 45, total: "₦5,120,033", status: "Failed" as PayoutStatus },
  { ref: "PB-2026-27D", type: "Affiliate", runDate: "2026-07-06 9:00", recipients: 12, total: "₦1,120,033", status: "Scheduled" as PayoutStatus },
];

export type AdminPayout = (typeof adminPayouts)[number];

export function payoutRecipients(p: AdminPayout) {
  return Array.from({ length: Math.min(6, p.recipients) }, (_, i) => ({
    name: ["Balogun Taiwo", "Chioma Eze", "Ada Okafor", "Emeka Obi", "Sofia Lane", "Nina Patel"][i % 6],
    type: p.type,
    expected: "₦4,120,033",
  }));
}

export const financeStats = [
  { label: "Total profits", value: "₦5,180,000", sub: "Pure profits from sales and commissions", accent: "bg-green-500" },
  { label: "Total amount paid out", value: "₦1,480,000", sub: "from 300 payouts", accent: "bg-orange-500" },
];

// Revenue vs Profits, last 7 days (₦ thousands ×40 → ₦M scale like the command centre chart).
export const financeSeries = [
  { day: "Mon", revenue: 210, profit: 80 },
  { day: "Tue", revenue: 185, profit: 155 },
  { day: "Wed", revenue: 125, profit: 95 },
  { day: "Thur", revenue: 150, profit: 135 },
  { day: "Fri", revenue: 150, profit: 135 },
  { day: "Sat", revenue: 150, profit: 135 },
  { day: "Sun", revenue: 150, profit: 135 },
];

/* ── System ──────────────────────────────────────────────── */
export const auditLog = [
  { time: "2026-07-01 09:22", actor: "Samuel Iliya", action: "Approved vendor", target: "VND-903 Naija Wellness", ip: "102.89.34.10" },
  { time: "2026-07-01 09:22", actor: "Ade Balogun", action: "Released payout batch", target: "PB-2026-26A", ip: "197.210.65.22" },
  { time: "2026-07-01 09:22", actor: "Ify Nnamdi", action: "Refunded Order", target: "ORD-40026 · ₦18,500", ip: "105.112.11.9" },
  { time: "2026-07-01 09:22", actor: "Dexter O.", action: "Rejected Affiliate", target: "AFF-1204 Emeka Obi", ip: "154.113.7.44" },
  { time: "2026-07-01 09:22", actor: "System", action: "Flagged Vendor", target: "RVW-9013", ip: "—" },
];

export const team = [
  { name: "Samuel Iliya", email: "samuel@daniliya.ng", role: "Superadmin", lastActive: "just now" },
  { name: "Ade Balogun", email: "ade@daniliya.ng", role: "Finance", lastActive: "3m ago" },
  { name: "Ify Nnamdi", email: "ify@daniliya.ng", role: "Support", lastActive: "1h ago" },
  { name: "Chiamaka Umeh", email: "chi@daniliya.ng", role: "Finance", lastActive: "yesterday" },
  { name: "Marcus Danjuma", email: "marcus@daniliya.ng", role: "User manager", lastActive: "3d ago" },
];

export const notificationSettings = [
  "New vendor application",
  "Payout batch requires review",
  "Failed transfer alert",
  "High-priority support ticket",
  "Weekly finance digest",
];
