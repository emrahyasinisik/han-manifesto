import type { Locale } from "@/lib/i18n";

export type Severity = "critical" | "medium" | "low";

export type IssueKind = "title" | "description" | "image" | "attribute";

export type Store = {
  id: string;
  platform: "Shopify" | "Trendyol" | "Hepsiburada";
  name: string;
  status: "connected" | "syncing" | "error";
  products: number;
};

export type Issue = {
  id: string;
  kind: IssueKind;
  field: string;
  severity: Severity;
  problem: string;
  suggestion: string;
  before: string;
  after: string;
  beforeVisual?: string;
  afterVisual?: string;
};

export type DemoProduct = {
  id: string;
  title: string;
  platform: Store["platform"];
  ucpScore: number;
  imageCount: number;
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

const PRODUCTS_EN: DemoProduct[] = [
  {
    id: "p1",
    title: "Linen Shirt",
    platform: "Shopify",
    ucpScore: 41,
    imageCount: 1,
    issues: [
      {
        id: "i1",
        kind: "title",
        field: "name",
        severity: "critical",
        problem:
          "Name is too short for agents — missing brand, material, and color.",
        suggestion:
          "Rename using brand + product + material + color so catalog agents can ground the SKU.",
        before: "Linen Shirt",
        after: "Atelier North Linen Lounge Shirt — Sand, Unisex",
      },
      {
        id: "i2",
        kind: "description",
        field: "description",
        severity: "medium",
        problem: "Description is too thin for UCP / agent-ready quality.",
        suggestion:
          "Expand with material, fit, care, and use-case; keep keywords natural.",
        before: "Soft linen shirt for summer.",
        after:
          "Breathable European linen lounge shirt in sand. Relaxed fit, mother-of-pearl buttons, garment-washed for soft hand-feel. Pair with tailored trousers or travel layers. Machine wash cold; line dry.",
      },
      {
        id: "i3",
        kind: "image",
        field: "photos",
        severity: "critical",
        problem:
          "Only one photo; crop is tight and background competes with the garment.",
        suggestion:
          "Use a clean hero + detail + lifestyle set (3–5 images) with readable framing.",
        before: "1 photo · busy background · tight crop",
        after: "5 photos · clean hero · detail + lifestyle",
        beforeVisual: "Single cluttered shot",
        afterVisual: "Hero + detail pack",
      },
    ],
  },
  {
    id: "p2",
    title: "Ceramic Pour-Over Set",
    platform: "Trendyol",
    ucpScore: 58,
    imageCount: 1,
    issues: [
      {
        id: "i4",
        kind: "image",
        field: "photos",
        severity: "critical",
        problem: "Single image; no scale reference for agents or shoppers.",
        suggestion: "Add angles including scale and pour-in-use context.",
        before: "1 image · no scale",
        after: "5 images · scale + pour + packing",
        beforeVisual: "Lone product tile",
        afterVisual: "Multi-angle set",
      },
      {
        id: "i5",
        kind: "title",
        field: "name",
        severity: "medium",
        problem: "Name omits material and set composition.",
        suggestion: "State ceramic + dripper + carafe in the title.",
        before: "Ceramic Pour-Over Set",
        after: "Stoneware Pour-Over Set — Dripper + Carafe",
      },
      {
        id: "i6",
        kind: "description",
        field: "description",
        severity: "low",
        problem: "Missing capacity and care details agents expect.",
        suggestion: "Add volume, glaze type, and dishwasher guidance.",
        before: "Nice ceramic coffee set.",
        after:
          "Matte stoneware pour-over set: 02 dripper and 600ml carafe. Food-safe glaze. Hand wash recommended to preserve finish.",
      },
    ],
  },
  {
    id: "p3",
    title: "Wool Cap — Charcoal",
    platform: "Hepsiburada",
    ucpScore: 73,
    imageCount: 3,
    issues: [
      {
        id: "i7",
        kind: "description",
        field: "description",
        severity: "low",
        problem: "Near-duplicate copy of another colorway (cannibalization).",
        suggestion: "Differentiate knit density and seasonality for charcoal.",
        before: "Warm wool cap for cold days.",
        after:
          "Charcoal merino blend cap with a denser knit for wind. Mid-weight for city winters; unlined brim keeps silhouette clean.",
      },
      {
        id: "i8",
        kind: "image",
        field: "photos",
        severity: "medium",
        problem: "No on-model or texture close-up; agents under-index material.",
        suggestion: "Add fabric macro + wear shot beside the packshot.",
        before: "3 packshots only",
        after: "Packshot + macro + on-model",
        beforeVisual: "Flat packshots",
        afterVisual: "Texture + wear",
      },
    ],
  },
  {
    id: "p4",
    title: "OAK DESK TRAY BEST ORGANIZER WOOD TRAY",
    platform: "Shopify",
    ucpScore: 36,
    imageCount: 2,
    issues: [
      {
        id: "i9",
        kind: "title",
        field: "name",
        severity: "critical",
        problem: "ALL CAPS / keyword stuffing hurts agent parsing and SEO.",
        suggestion: "Sentence case; primary keyword near the front.",
        before: "OAK DESK TRAY BEST ORGANIZER WOOD TRAY",
        after: "Oak Desk Tray — Catchall Organizer",
      },
      {
        id: "i10",
        kind: "image",
        field: "photos",
        severity: "medium",
        problem: "Photos are dark; edge of tray is clipped.",
        suggestion:
          "Re-light on paper-neutral background; full silhouette in frame.",
        before: "Dark · clipped edges",
        after: "Even light · full tray in frame",
        beforeVisual: "Dark clipped shot",
        afterVisual: "Clear full frame",
      },
      {
        id: "i11",
        kind: "attribute",
        field: "attributes",
        severity: "medium",
        problem: "Material / dimensions missing on normalized UCP item.",
        suggestion: "Fill schema attributes used by GMC / UCP mapping.",
        before: "material: — · size: —",
        after: "material: oak · size: 28×18×3 cm",
      },
    ],
  },
];

const PRODUCTS_TR: DemoProduct[] = [
  {
    id: "p1",
    title: "Keten Gömlek",
    platform: "Shopify",
    ucpScore: 41,
    imageCount: 1,
    issues: [
      {
        id: "i1",
        kind: "title",
        field: "name",
        severity: "critical",
        problem:
          "İsim ajanlar için çok kısa — marka, malzeme ve renk eksik.",
        suggestion:
          "Marka + ürün + malzeme + renk ile yeniden adlandırın; katalog ajanları SKU’yu bağlayabilsin.",
        before: "Keten Gömlek",
        after: "Atelier North Keten Lounge Gömlek — Kum, Unisex",
      },
      {
        id: "i2",
        kind: "description",
        field: "description",
        severity: "medium",
        problem: "Açıklama UCP / agent-ready kalite için çok zayıf.",
        suggestion:
          "Malzeme, kalıp, bakım ve kullanım senaryosu ekleyin; anahtar kelimeleri doğal tutun.",
        before: "Yaz için yumuşak keten gömlek.",
        after:
          "Nefes alan Avrupa keteninden kum rengi lounge gömlek. Rahat kalıp, sedef düğmeler, yumuşak tutuş için yıkamalı kumaş. Takım pantolon veya seyahat katmanlarıyla. Soğuk makine; asarak kurutun.",
      },
      {
        id: "i3",
        kind: "image",
        field: "photos",
        severity: "critical",
        problem:
          "Tek fotoğraf; kırpım sıkı ve arka plan giysiyle yarışıyor.",
        suggestion:
          "Temiz hero + detay + yaşam tarzı seti (3–5 görsel) kullanın.",
        before: "1 foto · kalabalık fon · sıkı kırpım",
        after: "5 foto · temiz hero · detay + lifestyle",
        beforeVisual: "Tek dağınık kare",
        afterVisual: "Hero + detay paketi",
      },
    ],
  },
  {
    id: "p2",
    title: "Seramik Pour-Over Set",
    platform: "Trendyol",
    ucpScore: 58,
    imageCount: 1,
    issues: [
      {
        id: "i4",
        kind: "image",
        field: "photos",
        severity: "critical",
        problem: "Tek görsel; ajanlar veya alıcılar için ölçek referansı yok.",
        suggestion: "Ölçek ve kullanım anı dahil açılar ekleyin.",
        before: "1 görsel · ölçek yok",
        after: "5 görsel · ölçek + döküm + paket",
        beforeVisual: "Yalnız ürün karesi",
        afterVisual: "Çok açılı set",
      },
      {
        id: "i5",
        kind: "title",
        field: "name",
        severity: "medium",
        problem: "İsim malzeme ve set içeriğini atlıyor.",
        suggestion: "Başlıkta seramik + dripper + karaf belirtin.",
        before: "Seramik Pour-Over Set",
        after: "Stoneware Pour-Over Set — Dripper + Karaf",
      },
      {
        id: "i6",
        kind: "description",
        field: "description",
        severity: "low",
        problem: "Ajanların beklediği hacim ve bakım detayları eksik.",
        suggestion: "Hacim, sır tipi ve bulaşık makinesi rehberi ekleyin.",
        before: "Güzel seramik kahve seti.",
        after:
          "Mat stoneware pour-over seti: 02 dripper ve 600ml karaf. Gıdaya uygun sır. Finish korumak için elde yıkama önerilir.",
      },
    ],
  },
  {
    id: "p3",
    title: "Yün Şapka — Antrasit",
    platform: "Hepsiburada",
    ucpScore: 73,
    imageCount: 3,
    issues: [
      {
        id: "i7",
        kind: "description",
        field: "description",
        severity: "low",
        problem: "Başka renk varyantıyla neredeyse aynı metin (kannibalizasyon).",
        suggestion: "Antrasit için örgü yoğunluğu ve sezonu ayırt edin.",
        before: "Soğuk günler için sıcak yün şapka.",
        after:
          "Rüzgara karşı daha sıkı örgüyle antrasit merino karışım şapka. Şehir kışları için orta gramaj; astarsız siper silueti temiz tutar.",
      },
      {
        id: "i8",
        kind: "image",
        field: "photos",
        severity: "medium",
        problem: "Modelde veya doku close-up yok; ajanlar malzemeyi zayıf indeksler.",
        suggestion: "Packshot yanına kumaş makro + giyim karesi ekleyin.",
        before: "Yalnızca 3 packshot",
        after: "Packshot + makro + modelde",
        beforeVisual: "Düz packshotlar",
        afterVisual: "Doku + giyim",
      },
    ],
  },
  {
    id: "p4",
    title: "MEŞE MASA TEPSİSİ EN İYİ ORGANİZER AHŞAP TEPSİ",
    platform: "Shopify",
    ucpScore: 36,
    imageCount: 2,
    issues: [
      {
        id: "i9",
        kind: "title",
        field: "name",
        severity: "critical",
        problem: "TAM KAPİTAL / anahtar kelime doldurma ajan parse ve SEO’yu bozar.",
        suggestion: "Cümle düzeni; birincil anahtar kelime önde.",
        before: "MEŞE MASA TEPSİSİ EN İYİ ORGANİZER AHŞAP TEPSİ",
        after: "Meşe Masa Tepsisi — Catchall Organizer",
      },
      {
        id: "i10",
        kind: "image",
        field: "photos",
        severity: "medium",
        problem: "Fotoğraflar karanlık; tepsi kenarı kırpılmış.",
        suggestion:
          "Kâğıt-nötr fonda yeniden ışıklandırın; siluet çerçevede tam kalsın.",
        before: "Karanlık · kırpık kenarlar",
        after: "Dengeli ışık · tam tepsi çerçevede",
        beforeVisual: "Karanlık kırpık kare",
        afterVisual: "Net tam kare",
      },
      {
        id: "i11",
        kind: "attribute",
        field: "attributes",
        severity: "medium",
        problem: "Normalize UCP öğesinde malzeme / ölçü eksik.",
        suggestion: "GMC / UCP eşlemesinde kullanılan şema alanlarını doldurun.",
        before: "material: — · size: —",
        after: "material: meşe · size: 28×18×3 cm",
      },
    ],
  },
];

/** @deprecated Prefer getDemoProducts(locale) */
export const DEMO_PRODUCTS = PRODUCTS_EN;

export function getDemoProducts(locale: Locale): DemoProduct[] {
  return locale === "tr" ? PRODUCTS_TR : PRODUCTS_EN;
}

export function averageScore(products: DemoProduct[]): number {
  if (products.length === 0) return 0;
  const sum = products.reduce((acc, p) => acc + p.ucpScore, 0);
  return Math.round(sum / products.length);
}

export function countBySeverity(
  products: DemoProduct[],
): Record<Severity, number> {
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
