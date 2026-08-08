# HAN Manifesto — Design Spec

**Date:** 2026-08-08  
**Status:** Approved for planning  
**Locale:** Turkish (site content)

## Goal

Ship a single-page **principles manifesto** for **HAN** (*Hub for Agent Networks*): a public, sales-free statement of how commerce data should work for agents and marketplaces — grounded in the UCP marketplace / panel architecture docs. No product signup, no signatures.

## Non-goals

- Signature / GitHub OAuth / Supabase
- Waitlist, auth, pricing, feature marketing page
- UCP panel, connectors, SEO engine, write-back jobs
- Three.js / heavy 3D (optional later; not MVP)
- Bilingual UI (English later if needed)

## Reference

Visual *rhythm* inspired by [manifesto.masterfabric.co](https://manifesto.masterfabric.co/) (long-form principles, one column, quiet chrome) — **not** a fork of its mono + signature stack. Style direction: **Grid Ledger**.

## Content structure

Single scroll page, Turkish copy derived from:

- `ucp-marketplace-sistem.md`
- `ucp-panel-urun-mimari-dokumani.md`

### Header

- Brand: **HAN**
- Subline: Hub for Agent Networks
- Hero thesis (example): “Ticaret verisi ajanlar için ortak bir dil konuşmalı.”
- 1–2 sentence intro

### Sections

1. **UCP nedir, ne değildir** — UCP is the common schema / protocol layer; it is not the analysis, SEO, or recommendation engine.
2. **Tek çatı ilkesi** — marketplace → connector → normalize once → analyze once; new marketplaces do not rewrite intelligence.
3. **Zekâ üst katmanda** — scoring, SEO, recommendations live above UCP; rules-first, LLM secondary for fuzzy rewrite/extract tasks.
4. **Agent-ready katalog** — product data must be readable by Google, ChatGPT, Perplexity and similar agents; GMC/UCP readiness as a principle.
5. **İnsan onayı** — suggested fixes require human approval before platform write-back.
6. **Güvenli otomasyon** — chunked updates, rate-limits, jitter, audit trail, rollback.
7. **Taahhüt** — short closing commitment lines (HAN-specific; not Masterfabric’s developer-culture close).

No feature checklist, no platform logo parade as primary content.

## Visual design — Grid Ledger

| Token | Value |
|-------|--------|
| Background | `#FAFAF8` with subtle grid |
| Headline | Serif (e.g. Georgia / comparable webfont) |
| Body | Sans (system or distinctive non-default sans; avoid Inter/Roboto as brand face) |
| Accent | Amber `#B45309` for labels / section indices |
| Layout | Centered single column, generous reading measure |
| Motion | Light only (2–3 intentional cues: e.g. grid fade-in, section underline, brand reveal) — no signature canvas |

Avoid: purple SaaS gradients, JetBrains Mono clone of Masterfabric manifesto, cards-as-decoration, CTA clusters.

## Technical architecture

| Piece | Choice |
|-------|--------|
| App | Next.js App Router + TypeScript |
| Styling | Tailwind CSS |
| Content | Markdown file(s) under `content/` (e.g. `content/manifesto.md`) rendered on the home page |
| Deploy target | Static-friendly Next site (Vercel-compatible); no backend required for MVP |
| Project path | `/Users/emrah/Desktop/han-manifesto` |

### Components (logical)

- `app/page.tsx` — composition of manifesto
- Markdown pipeline (remark/MDX or simple markdown render)
- Presentational sections only; no client auth state

### Data flow

Author edits Markdown → build/render → static HTML. No runtime DB.

### Error handling / testing

- Broken Markdown should fail the build or show a clear empty state in dev
- Smoke: page loads, headings present, mobile readable
- No e2e auth paths

## Success criteria

- Reader understands HAN + UCP role split in under one scroll of core sections
- Page feels related to the UCP product docs, not a generic AI landing page
- Zero signature/auth surface
- Turkish-only, accessible typography, works on mobile and desktop

## Brand assets

- Favicon, icons, and any wordmarks must be **HAN-original** (Grid Ledger palette).
- Do **not** reuse Masterfabric favicons, logos, or brand files.
- Do **not** ship Next.js / Vercel scaffold icons as product branding.

## Open items (non-blocking)

- Exact webfont pairing beyond “serif + sans” (plan locks Newsreader + IBM Plex Sans)
- Final hero thesis wording polish during implementation
- Hosting subdomain — decide at deploy time (HAN-branded; not Masterfabric assets)
