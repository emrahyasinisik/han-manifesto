"use client";

import dynamic from "next/dynamic";
import type { ManifestoDoc } from "@/lib/manifesto";
import { ManifestoCommitment } from "@/components/ManifestoCommitment";
import { ManifestoHeader } from "@/components/ManifestoHeader";
import { ManifestoSection } from "@/components/ManifestoSection";
import { Reveal } from "@/components/Reveal";

const AmbientNetwork = dynamic(
  () =>
    import("@/components/AmbientNetwork").then((mod) => mod.AmbientNetwork),
  { ssr: false },
);

type Props = {
  doc: ManifestoDoc;
};

export function ManifestoExperience({ doc }: Props) {
  return (
    <main className="grid-ledger relative min-h-screen overflow-x-clip">
      <div className="paper-vignette pointer-events-none absolute inset-0 z-[1]" />
      <AmbientNetwork />

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-16 md:px-8 md:py-24 lg:py-28">
        <ManifestoHeader {...doc.frontmatter} />

        <div className="mt-4 space-y-0">
          {doc.sections.map((section, index) => (
            <Reveal key={section.index} delayMs={Math.min(index * 40, 160)}>
              <ManifestoSection {...section} />
            </Reveal>
          ))}
        </div>

        <Reveal delayMs={80}>
          <ManifestoCommitment html={doc.commitmentHtml} />
        </Reveal>
      </div>
    </main>
  );
}
