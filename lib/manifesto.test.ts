import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { loadManifesto } from "./manifesto";

describe("loadManifesto", () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const d of dirs) rmSync(d, { recursive: true, force: true });
  });

  it("parses frontmatter and numbered sections without requiring Commitment", async () => {
    const dir = mkdtempSync(join(tmpdir(), "han-manifesto-"));
    dirs.push(dir);
    writeFileSync(
      join(dir, "manifesto.md"),
      `---
brand: HAN
subline: Hub for Agent Networks
date: 2026-08-08
title: Commerce data should speak one language to agents.
intro: Without a shared schema, agents relearn every marketplace.
---

## What UCP is — and is not

UCP is the shared schema; it is not an analysis engine.

## One roof

Normalize via connectors; write analysis once.
`,
      "utf8",
    );

    const doc = await loadManifesto(join(dir, "manifesto.md"));

    expect(doc.frontmatter.brand).toBe("HAN");
    expect(doc.frontmatter.subline).toBe("Hub for Agent Networks");
    expect(doc.frontmatter.date).toBe("2026-08-08");
    expect(doc.sections).toHaveLength(2);
    expect(doc.sections[0]).toMatchObject({
      index: "01",
      title: "What UCP is — and is not",
    });
    expect(doc.sections[0].html).toContain("shared schema");
    expect(doc.commitmentHtml).toBe("");
  });

  it("loads locale markdown files from content/", async () => {
    const en = await loadManifesto("en");
    const tr = await loadManifesto("tr");
    expect(en.frontmatter.title).toMatch(/Commerce data/i);
    expect(tr.frontmatter.title).toMatch(/Ticaret verisi/i);
    expect(en.frontmatter.date).toBe("2026-08-08");
    expect(tr.frontmatter.date).toBe(en.frontmatter.date);
    expect(en.sections.length).toBeGreaterThan(0);
    expect(tr.sections.length).toBe(en.sections.length);
  });

  it("treats optional Commitment / Taahhüt as commitmentHtml, not a numbered section", async () => {
    const dir = mkdtempSync(join(tmpdir(), "han-manifesto-"));
    dirs.push(dir);
    writeFileSync(
      join(dir, "manifesto.md"),
      `---
brand: HAN
subline: Hub for Agent Networks
date: 2026-08-08
title: Title
intro: Intro
---

## Principle

Body.

## Commitment

Optional closing line.
`,
      "utf8",
    );

    const doc = await loadManifesto(join(dir, "manifesto.md"));
    expect(doc.sections).toHaveLength(1);
    expect(doc.commitmentHtml).toContain("Optional closing line");
  });
});
