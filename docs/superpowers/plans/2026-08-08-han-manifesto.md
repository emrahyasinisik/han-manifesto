# HAN Manifesto Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a Turkish, sales-free, signature-free single-page HAN Manifesto site (Hub for Agent Networks) with Grid Ledger visuals and Markdown-driven content.

**Architecture:** Next.js App Router renders one home page. Manifesto copy lives in `content/manifesto.md` and is parsed at build/request time into typed sections. Tailwind implements Grid Ledger (paper background + CSS grid, serif headlines, sans body, amber accents). No database, auth, or signatures.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS 4 (or 3 if `create-next-app` defaults differ), `gray-matter`, `remark` + `remark-html` (or `unified` pipeline), Vitest for pure content parsing tests, Google Fonts via `next/font` — **Newsreader** (serif) + **IBM Plex Sans** (body).

## Global Constraints

- Site content language: Turkish only
- No signatures, GitHub OAuth, Supabase, waitlist, auth, or product CTAs
- Visual direction: Grid Ledger (`#FAFAF8` + subtle grid, amber `#B45309`, serif + sans — not JetBrains Mono / Masterfabric clone)
- **Brand assets must be HAN-original:** no Masterfabric favicons, logos, wordmarks, or copied brand files; replace Next.js/Vercel scaffold icons with a HAN mark (Grid Ledger amber/ink)
- Content source of truth: Markdown under `content/`
- Spec: `docs/superpowers/specs/2026-08-08-han-manifesto-design.md`
- Project root: `/Users/emrah/Desktop/han-manifesto` (implementation worktree: `.worktrees/han-manifesto`)
- Keep `.superpowers/` gitignored (already in `.gitignore`)

## File map

| Path | Responsibility |
|------|----------------|
| `package.json` | Scripts and dependencies |
| `app/layout.tsx` | Root layout, fonts, metadata |
| `app/page.tsx` | Home page composition |
| `app/globals.css` | Grid Ledger tokens, grid background, base type |
| `content/manifesto.md` | Full Turkish manifesto (frontmatter + body) |
| `lib/manifesto.ts` | Load + parse Markdown into `ManifestoDoc` |
| `lib/manifesto.test.ts` | Vitest unit tests for parser |
| `components/ManifestoHeader.tsx` | Brand, subline, hero thesis, intro |
| `components/ManifestoSection.tsx` | One numbered principle section |
| `components/ManifestoCommitment.tsx` | Closing commitment block |
| `vitest.config.ts` | Test runner config |
| `next.config.ts` | Next defaults (minimal) |

---

### Task 1: Scaffold Next.js + Tailwind + Vitest

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `vitest.config.ts` (via `create-next-app` then trim)
- Modify: `.gitignore` (ensure `node_modules/`, `.next/` present — already partially set)

**Interfaces:**
- Consumes: none
- Produces: runnable `npm run dev` / `npm run build`; `npm test` runs Vitest

- [ ] **Step 1: Scaffold the app in the existing repo root**

Run from `/Users/emrah/Desktop/han-manifesto` (do not nest an extra folder):

```bash
cd /Users/emrah/Desktop/han-manifesto
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*" --turbopack --yes
```

If create-next-app refuses non-empty directory, scaffold into a temp dir and move files up, keeping existing `docs/`, `.gitignore`, and `.git`.

- [ ] **Step 2: Add content/test dependencies**

```bash
npm install gray-matter remark remark-html
npm install -D vitest @vitejs/plugin-react jsdom
```

- [ ] **Step 3: Add Vitest config and scripts**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

In `package.json` scripts, ensure:

```json
{
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 4: Verify scaffold**

Run: `npm run build`  
Expected: Next.js build succeeds (default page OK).

Run: `npm test`  
Expected: Vitest exits 0 with “No test files found” or 0 tests — acceptable until Task 2; if Vitest errors on config, fix config first.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
chore: scaffold Next.js app with Tailwind and Vitest

EOF
)"
```

---

### Task 2: Manifesto Markdown schema + parser (TDD)

**Files:**
- Create: `content/manifesto.md` (minimal fixture first), `lib/manifesto.ts`, `lib/manifesto.test.ts`

**Interfaces:**
- Consumes: file at `content/manifesto.md`
- Produces:

```ts
export type ManifestoFrontmatter = {
  brand: string;
  subline: string;
  title: string;
  intro: string;
};

export type ManifestoSection = {
  index: string; // e.g. "01"
  title: string;
  html: string; // rendered HTML for section body
};

export type ManifestoDoc = {
  frontmatter: ManifestoFrontmatter;
  sections: ManifestoSection[];
  commitmentHtml: string;
};

export async function loadManifesto(): Promise<ManifestoDoc>;
```

Parsing rules:
- Frontmatter via `gray-matter`
- Body split on headings `## ` — each `##` becomes a section except the heading exactly `## Taahhüt` (case-sensitive Turkish title) which maps to `commitmentHtml`
- Section `index` is zero-padded from order among non-commitment sections (`01`, `02`, …)
- Section body Markdown → HTML via `remark` + `remark-html`

- [ ] **Step 1: Write the failing test**

Create `lib/manifesto.test.ts`:

```ts
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("loadManifesto", () => {
  const dirs: string[] = [];

  afterEach(() => {
    vi.resetModules();
    for (const d of dirs) rmSync(d, { recursive: true, force: true });
  });

  it("parses frontmatter, numbered sections, and Taahhüt", async () => {
    const dir = mkdtempSync(join(tmpdir(), "han-manifesto-"));
    dirs.push(dir);
    writeFileSync(
      join(dir, "manifesto.md"),
      `---
brand: HAN
subline: Hub for Agent Networks
title: Ticaret verisi ajanlar için ortak bir dil konuşmalı.
intro: Ortak şema olmadan ajanlar ve paneller her pazaryerini yeniden öğrenir.
---

## UCP nedir, ne değildir

UCP ortak şemadır; analiz motoru değildir.

## Tek çatı ilkesi

Connector ile normalize et, analizi bir kez yaz.

## Taahhüt

Ortak dil. Üst katmanda zekâ. Onay olmadan yazma.
`,
      "utf8",
    );

    vi.doMock("node:fs/promises", async () => {
      const actual = await vi.importActual<typeof import("node:fs/promises")>(
        "node:fs/promises",
      );
      return {
        ...actual,
        readFile: async () =>
          actual.readFile(join(dir, "manifesto.md"), "utf8"),
      };
    });

    const { loadManifesto } = await import("./manifesto");
    const doc = await loadManifesto();

    expect(doc.frontmatter.brand).toBe("HAN");
    expect(doc.frontmatter.subline).toBe("Hub for Agent Networks");
    expect(doc.sections).toHaveLength(2);
    expect(doc.sections[0]).toMatchObject({
      index: "01",
      title: "UCP nedir, ne değildir",
    });
    expect(doc.sections[0].html).toContain("ortak şema");
    expect(doc.commitmentHtml).toContain("Onay olmadan yazma");
  });
});
```

Note: If mocking `fs` is brittle, implement `loadManifesto(path?: string)` with default `join(process.cwd(), "content/manifesto.md")` and pass the temp path from the test instead of mocking.

Preferred simpler API for the plan:

```ts
export async function loadManifesto(
  filePath?: string,
): Promise<ManifestoDoc>;
```

Then the test calls `loadManifesto(join(dir, "manifesto.md"))` with no mock.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`  
Expected: FAIL — `Cannot find module './manifesto'` or `loadManifesto is not a function`.

- [ ] **Step 3: Implement `lib/manifesto.ts`**

```ts
import { readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

export type ManifestoFrontmatter = {
  brand: string;
  subline: string;
  title: string;
  intro: string;
};

export type ManifestoSection = {
  index: string;
  title: string;
  html: string;
};

export type ManifestoDoc = {
  frontmatter: ManifestoFrontmatter;
  sections: ManifestoSection[];
  commitmentHtml: string;
};

async function mdToHtml(markdown: string): Promise<string> {
  const result = await remark().use(html).process(markdown);
  return String(result);
}

function splitSections(body: string): { title: string; body: string }[] {
  const parts = body.split(/^## /m).filter((p) => p.trim().length > 0);
  return parts.map((part) => {
    const nl = part.indexOf("\n");
    const title = (nl === -1 ? part : part.slice(0, nl)).trim();
    const sectionBody = nl === -1 ? "" : part.slice(nl + 1).trim();
    return { title, body: sectionBody };
  });
}

export async function loadManifesto(
  filePath = path.join(process.cwd(), "content/manifesto.md"),
): Promise<ManifestoDoc> {
  const raw = await readFile(filePath, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = data as ManifestoFrontmatter;

  for (const key of ["brand", "subline", "title", "intro"] as const) {
    if (typeof frontmatter[key] !== "string" || !frontmatter[key].trim()) {
      throw new Error(`manifesto frontmatter missing string: ${key}`);
    }
  }

  const chunks = splitSections(content.trim());
  const sections: ManifestoSection[] = [];
  let commitmentHtml = "";

  for (const chunk of chunks) {
    const rendered = await mdToHtml(chunk.body);
    if (chunk.title === "Taahhüt") {
      commitmentHtml = rendered;
      continue;
    }
    const index = String(sections.length + 1).padStart(2, "0");
    sections.push({ index, title: chunk.title, html: rendered });
  }

  if (!commitmentHtml) {
    throw new Error('manifesto.md must include a "## Taahhüt" section');
  }

  return { frontmatter, sections, commitmentHtml };
}
```

- [ ] **Step 4: Align the test with `loadManifesto(path)` (no fs mock)**

Update the test to call `loadManifesto(join(dir, "manifesto.md"))` and remove `vi.doMock`.

- [ ] **Step 5: Run tests**

Run: `npm test`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/manifesto.ts lib/manifesto.test.ts
git commit -m "$(cat <<'EOF'
feat: parse manifesto markdown into typed sections

EOF
)"
```

---

### Task 3: Full Turkish manifesto content

**Files:**
- Create/overwrite: `content/manifesto.md`

**Interfaces:**
- Consumes: parser from Task 2
- Produces: complete copy for all 6 principle sections + Taahhüt matching the design spec

- [ ] **Step 1: Write `content/manifesto.md`**

Use this content (polish wording only if grammar requires; keep structure):

```md
---
brand: HAN
subline: Hub for Agent Networks
title: Ticaret verisi ajanlar için ortak bir dil konuşmalı.
intro: HAN, pazaryeri verisini ortak bir şemaya indirgeyip üstünde güvenilir zekâ kurmanın ilkelerini ortaya koyar. Satış vaadi değil; nasıl inşa edeceğimizin taahhüdü.
---

## UCP nedir, ne değildir

**UCP ortak şemadır.** Katalog, sipariş ve kimlik bağlama için ajanların ve sistemlerin konuşabileceği canonical biçimler sunar.

**UCP analiz motoru değildir.** SEO skoru, öneri metni veya kâr-zarar hesabı protokolün işi değildir; bunlar bizim katmanımızda yaşar.

Bu ayrım bozulursa mimari çürür: her pazaryeri için yeniden “zeka” yazmaya başlarız.

## Tek çatı ilkesi

Her pazaryeri bir **connector** ile gelir: ham veriyi çeker, yorumlamaz.

Connector çıktısı **UCP normalizasyon** ile tek dile çevrilir.

Analiz bir kez yazılır. Yeni bir pazaryeri eklemek, üst katmanları yeniden yazmak demek değildir.

## Zekâ üst katmanda

Skor, SEO sinyalleri ve öneriler normalize verinin üzerinde çalışır.

**Kural önce gelir** — ölçüm tekrarlanabilir ve denetlenebilir kalır.

**LLM ikincildir** — yalnızca bulanık işlerde (yeniden yazım, anahtar kelime çıkarımı) devreye girer; skoru gizlice değiştirmez.

Metrik, skor ve karar/öneri birbirine karıştırılmaz.

## Agent-ready katalog

Ürün feed’i yalnızca vitrin için değildir; Google, ChatGPT, Perplexity ve benzeri ajanlar için de okunabilir olmalıdır.

Eksik alan, şişirilmiş başlık, tekraren içerik ve zayıf nitelikler ajan keşfini ve güveni düşürür.

Uyum, “güzel görünmek” değil; **ajanların doğru anlaması**dır.

## İnsan onayı

Öneri üretmek yetmez. Platforma geri yazmadan önce insan onayı gerekir.

Onay, güven içindir; aynı zamanda modelin öğreneceği geri bildirimdir.

Tam otomatik düzeltme, hesap riskini ve hatalı yayını kullanıcıya yükler — bunu reddederiz.

## Güvenli otomasyon

Onaylanan değişiklikler tek patlamada değil, **parça parça** ve rate-limit’e saygılı uygulanır.

İsteklere jitter eklenir; kuyruk bir üründe düşse bile durmaz; her deneme audit log’a yazılır.

Güncelleme öncesi eski veri saklanır — **rollback** bir lüks değil, güvenlik ağıdır.

## Taahhüt

Ortak şemaya map et.

Zekâyı üst katmanda tut.

Kuralı önce, modeli sonra çağır.

Onaysız yazma.

Ajanlar için okunur katalog bırak.
```

- [ ] **Step 2: Parser smoke on real file**

Run:

```bash
npx tsx -e "import { loadManifesto } from './lib/manifesto.ts'; const d = await loadManifesto(); console.log(d.sections.length, d.frontmatter.brand, d.commitmentHtml.slice(0,80))"
```

If `tsx` missing: `npm install -D tsx` then re-run.

Expected: `6 HAN` and HTML snippet containing commitment lines.

- [ ] **Step 3: Commit**

```bash
git add content/manifesto.md
git commit -m "$(cat <<'EOF'
content: add full Turkish HAN manifesto

EOF
)"
```

---

### Task 4: Grid Ledger global styles + fonts

**Files:**
- Modify: `app/layout.tsx`, `app/globals.css`

**Interfaces:**
- Consumes: `next/font/google` — `Newsreader`, `IBM_Plex_Sans`
- Produces: CSS variables `--font-serif`, `--font-sans`, `--color-paper`, `--color-ink`, `--color-amber`, grid background utility `.grid-ledger`

- [ ] **Step 1: Wire fonts in `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { IBM_Plex_Sans, Newsreader } from "next/font/google";
import "./globals.css";

const serif = Newsreader({
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
  display: "swap",
});

const sans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HAN Manifesto",
  description:
    "Hub for Agent Networks — ticaret verisinin ajanlar için ortak dili üzerine ilkeler.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Implement Grid Ledger tokens in `app/globals.css`**

```css
@import "tailwindcss";

:root {
  --color-paper: #fafaf8;
  --color-ink: #111111;
  --color-muted: #525252;
  --color-amber: #b45309;
  --color-grid: #e5e5e0;
  --font-serif: "Newsreader", Georgia, "Times New Roman", serif;
  --font-sans: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;
}

body {
  background-color: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-sans);
}

.grid-ledger {
  background-color: var(--color-paper);
  background-image:
    linear-gradient(var(--color-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-grid) 1px, transparent 1px);
  background-size: 24px 24px;
}

.font-serif {
  font-family: var(--font-serif);
}

.prose-manifesto {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--color-muted);
}

.prose-manifesto p {
  margin: 0.85rem 0;
}

.prose-manifesto strong {
  color: var(--color-ink);
  font-weight: 600;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-up {
  animation: fade-up 0.7s ease-out both;
}

.animate-fade-up-delay {
  animation: fade-up 0.7s ease-out 0.12s both;
}
```

If the project uses Tailwind v3 (`@tailwind base` style), adapt imports to that scaffold instead of inventing a second Tailwind major version.

- [ ] **Step 3: Temporary page sanity check**

Set `app/page.tsx` to a minimal shell using `grid-ledger` and brand text; run `npm run dev` and confirm paper+grid + fonts load.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/globals.css app/page.tsx
git commit -m "$(cat <<'EOF'
style: add Grid Ledger tokens and HAN fonts

EOF
)"
```

---

### Task 5: Presentational components + home page

**Files:**
- Create: `components/ManifestoHeader.tsx`, `components/ManifestoSection.tsx`, `components/ManifestoCommitment.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `loadManifesto()` → `ManifestoDoc`
- Produces: server-rendered home page with header, sections 01–06, commitment; no client auth

- [ ] **Step 1: Create `components/ManifestoHeader.tsx`**

```tsx
type Props = {
  brand: string;
  subline: string;
  title: string;
  intro: string;
};

export function ManifestoHeader({ brand, subline, title, intro }: Props) {
  return (
    <header className="mb-16 animate-fade-up">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-amber)]">
        {brand} · {subline}
      </p>
      <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
        {title}
      </h1>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
        {intro}
      </p>
    </header>
  );
}
```

- [ ] **Step 2: Create `components/ManifestoSection.tsx`**

```tsx
type Props = {
  index: string;
  title: string;
  html: string;
};

export function ManifestoSection({ index, title, html }: Props) {
  return (
    <section className="border-t border-[var(--color-grid)] py-12 animate-fade-up-delay">
      <div className="mb-4 inline-block border border-[var(--color-ink)] bg-[var(--color-paper)] px-3 py-1 text-xs font-semibold tracking-wide">
        {index} · {title}
      </div>
      <h2 className="font-serif sr-only">{title}</h2>
      <div
        className="prose-manifesto max-w-2xl"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
```

Keep visible `h2` for a11y: prefer showing the title in serif under the badge instead of `sr-only` if design allows — **use visible title**:

```tsx
<h2 className="font-serif mb-4 text-2xl font-semibold">{title}</h2>
```

Badge shows `{index}` only or `{index} ·` prefix above the heading.

- [ ] **Step 3: Create `components/ManifestoCommitment.tsx`**

```tsx
type Props = { html: string };

export function ManifestoCommitment({ html }: Props) {
  return (
    <footer className="mt-8 border-t-2 border-[var(--color-ink)] py-16">
      <p className="mb-6 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-amber)]">
        Taahhüt
      </p>
      <div
        className="prose-manifesto font-serif text-xl leading-relaxed text-[var(--color-ink)] md:text-2xl"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </footer>
  );
}
```

- [ ] **Step 4: Wire `app/page.tsx`**

```tsx
import { ManifestoCommitment } from "@/components/ManifestoCommitment";
import { ManifestoHeader } from "@/components/ManifestoHeader";
import { ManifestoSection } from "@/components/ManifestoSection";
import { loadManifesto } from "@/lib/manifesto";

export default async function HomePage() {
  const doc = await loadManifesto();

  return (
    <main className="grid-ledger relative min-h-screen">
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-16 md:px-8 md:py-24">
        <ManifestoHeader {...doc.frontmatter} />
        {doc.sections.map((section) => (
          <ManifestoSection key={section.index} {...section} />
        ))}
        <ManifestoCommitment html={doc.commitmentHtml} />
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Build + manual check**

Run: `npm run build`  
Expected: success.

Run: `npm run dev` → open `/`  
Check: Turkish copy, 6 sections, Taahhüt, grid background, amber labels, no sign-in UI.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx components/
git commit -m "$(cat <<'EOF'
feat: render HAN manifesto page from markdown

EOF
)"
```

---

### Task 6: Responsive polish + verification

**Files:**
- Modify: `components/ManifestoHeader.tsx`, `app/globals.css` (only if spacing/ typography tweaks needed)
- Test: manual + `npm test` + `npm run build`

**Interfaces:**
- Consumes: completed page
- Produces: mobile-readable layout; motion limited to existing fade-up classes

- [ ] **Step 1: Mobile pass**

In browser (or DevTools 390px width): ensure title wraps cleanly, badge text doesn’t overflow, commitment lines remain readable, horizontal scroll absent.

- [ ] **Step 2: Motion budget check**

Confirm only ~2–3 animations (header fade-up, section fade, optional commitment). Remove any accidental infinite/spinner leftover from scaffold.

- [ ] **Step 3: Full verification**

```bash
npm test
npm run build
```

Expected: tests PASS; production build PASS.

- [ ] **Step 4: Commit (if polish edits exist)**

```bash
git add -A
git commit -m "$(cat <<'EOF'
polish: tighten manifesto responsive typography

EOF
)"
```

If working tree clean, skip commit.

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| Turkish principles manifesto | 3, 5 |
| No signatures/auth/CTA | Global + 5 |
| HAN + Hub for Agent Networks | 3, 5 |
| Seven content blocks (6 principles + taahhüt) | 3 |
| Grid Ledger visual | 4, 5 |
| Next.js + Markdown | 1, 2, 5 |
| Mobile + desktop | 6 |

## Self-review notes

- No TBD placeholders left; font pairing locked to Newsreader + IBM Plex Sans.
- Parser API is `loadManifesto(filePath?: string)` consistently across Task 2–5.
- Tailwind v3 vs v4 CSS entry differs by scaffold — Task 4 says adapt to whatever `create-next-app` generated.
