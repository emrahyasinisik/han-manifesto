export type Severity = "critical" | "medium" | "low";

export type Store = {
  id: string;
  platform: "Shopify" | "Trendyol" | "Hepsiburada";
  name: string;
  status: "connected" | "syncing" | "error";
  products: number;
};

export type Issue = {
  id: string;
  field: string;
  severity: Severity;
  problem: string;
  suggestion: string;
  current: string;
  proposed: string;
};

export type DemoProduct = {
  id: string;
  title: string;
  platform: Store["platform"];
  ucpScore: number;
  issues: Issue[];
};

export const DEMO_STORES: Store[] = [
  {
    id: "shopify-1",
    platform: "Shopify",
    name: "atelier-north.myshopify.com",
    status: "connected",
    products: 1284,
  },
  {
    id: "trendyol-1",
    platform: "Trendyol",
    name: "Atelier North TR",
    status: "connected",
    products: 862,
  },
  {
    id: "hb-1",
    platform: "Hepsiburada",
    name: "Atelier North HB",
    status: "syncing",
    products: 410,
  },
];

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: "p1",
    title: "Linen Lounge Shirt — Sand",
    platform: "Shopify",
    ucpScore: 41,
    issues: [
      {
        id: "i1",
        field: "title",
        severity: "critical",
        problem: "Title is short and missing primary attributes for agents.",
        suggestion:
          "Lead with brand + product + material + color so catalog agents can ground the item.",
        current: "Linen Shirt",
        proposed: "Atelier North Linen Lounge Shirt — Sand, Unisex",
      },
      {
        id: "i2",
        field: "description",
        severity: "medium",
        problem: "Description is thin for UCP / agent-ready catalog quality.",
        suggestion:
          "Add material, fit, care, and use-case sentences; keep keyword density natural.",
        current: "Soft linen shirt for summer.",
        proposed:
          "Breathable European linen lounge shirt in sand. Relaxed fit, mother-of-pearl buttons, garment-washed for soft hand-feel. Pair with tailored trousers or travel layers. Machine wash cold; line dry.",
      },
      {
        id: "i3",
        field: "attributes",
        severity: "medium",
        problem: "Material and gender attributes are empty.",
        suggestion: "Fill schema attributes used by GMC / UCP item mapping.",
        current: "material: — · gender: —",
        proposed: "material: linen · gender: unisex",
      },
    ],
  },
  {
    id: "p2",
    title: "Ceramic Pour-Over Set",
    platform: "Trendyol",
    ucpScore: 58,
    issues: [
      {
        id: "i4",
        field: "images",
        severity: "critical",
        problem: "Only one image; agents and storefronts expect a set.",
        suggestion: "Provide at least 3–5 angles including scale reference.",
        current: "1 image",
        proposed: "5 images (hero, detail, pour, lifestyle, packing)",
      },
      {
        id: "i5",
        field: "slug",
        severity: "low",
        problem: "URL slug is an opaque ID.",
        suggestion: "Use a readable, keyword-bearing slug.",
        current: "/product/884201",
        proposed: "/product/ceramic-pour-over-set",
      },
    ],
  },
  {
    id: "p3",
    title: "Wool Cap — Charcoal",
    platform: "Hepsiburada",
    ucpScore: 73,
    issues: [
      {
        id: "i6",
        field: "description",
        severity: "low",
        problem: "Near-duplicate copy of another SKU (cannibalization risk).",
        suggestion: "Differentiate fabric weight and seasonality for this colorway.",
        current: "Warm wool cap for cold days.",
        proposed:
          "Charcoal merino blend cap with a denser knit for wind. Mid-weight for city winters; unlined brim keeps silhouette clean.",
      },
    ],
  },
  {
    id: "p4",
    title: "Desk Tray — Oak",
    platform: "Shopify",
    ucpScore: 36,
    issues: [
      {
        id: "i7",
        field: "title",
        severity: "critical",
        problem: "ALL CAPS / stuffing pattern detected.",
        suggestion: "Use sentence case; put the primary keyword near the front.",
        current: "OAK DESK TRAY BEST ORGANIZER WOOD TRAY",
        proposed: "Oak Desk Tray — Catchall Organizer",
      },
      {
        id: "i8",
        field: "price",
        severity: "medium",
        problem: "Price present but currency metadata incomplete for UCP item.",
        suggestion: "Emit explicit currency on the normalized item.",
        current: "price: 890",
        proposed: "price: 890 · currency: TRY",
      },
    ],
  },
];

export function averageScore(products: DemoProduct[]): number {
  if (products.length === 0) return 0;
  const sum = products.reduce((acc, p) => acc + p.ucpScore, 0);
  return Math.round(sum / products.length);
}

export function countBySeverity(products: DemoProduct[]): Record<Severity, number> {
  const counts: Record<Severity, number> = {
    critical: 0,
    medium: 0,
    low: 0,
  };
  for (const product of products) {
    for (const issue of product.issues) {
      counts[issue.severity] += 1;
    }
  }
  return counts;
}
