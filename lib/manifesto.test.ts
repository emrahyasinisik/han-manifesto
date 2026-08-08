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

    const doc = await loadManifesto(join(dir, "manifesto.md"));

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
