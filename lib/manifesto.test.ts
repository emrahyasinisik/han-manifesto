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

  it("parses frontmatter, numbered sections, and Commitment", async () => {
    const dir = mkdtempSync(join(tmpdir(), "han-manifesto-"));
    dirs.push(dir);
    writeFileSync(
      join(dir, "manifesto.md"),
      `---
brand: HAN
subline: Hub for Agent Networks
title: Commerce data should speak one language to agents.
intro: Without a shared schema, agents relearn every marketplace.
---

## What UCP is — and is not

UCP is the shared schema; it is not an analysis engine.

## One roof

Normalize via connectors; write analysis once.

## Commitment

Shared language. Intelligence above. No write without approval.
`,
      "utf8",
    );

    const doc = await loadManifesto(join(dir, "manifesto.md"));

    expect(doc.frontmatter.brand).toBe("HAN");
    expect(doc.frontmatter.subline).toBe("Hub for Agent Networks");
    expect(doc.sections).toHaveLength(2);
    expect(doc.sections[0]).toMatchObject({
      index: "01",
      title: "What UCP is — and is not",
    });
    expect(doc.sections[0].html).toContain("shared schema");
    expect(doc.commitmentHtml).toContain("No write without approval");
  });

  it("still accepts legacy Taahhüt commitment heading", async () => {
    const dir = mkdtempSync(join(tmpdir(), "han-manifesto-"));
    dirs.push(dir);
    writeFileSync(
      join(dir, "manifesto.md"),
      `---
brand: HAN
subline: Hub for Agent Networks
title: Title
intro: Intro
---

## Principle

Body.

## Taahhüt

Legacy commitment line.
`,
      "utf8",
    );

    const doc = await loadManifesto(join(dir, "manifesto.md"));
    expect(doc.sections).toHaveLength(1);
    expect(doc.commitmentHtml).toContain("Legacy commitment line");
  });
});
