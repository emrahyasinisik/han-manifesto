"use client";

import dynamic from "next/dynamic";
import type { ManifestoDoc } from "@/lib/manifesto";
import type { Locale } from "@/lib/i18n";
import { HanMark } from "@/components/HanMark";
import { ManifestoHeader } from "@/components/ManifestoHeader";
import { ManifestoSection } from "@/components/ManifestoSection";
import { Reveal } from "@/components/Reveal";

const ProtocolField = dynamic(
  () =>
    import("@/components/ProtocolField").then((m) => m.ProtocolField),
  { ssr: false },
);

type Props = {
  doc: ManifestoDoc;
  locale: Locale;
  viewDemoLabel: string;
};

export function ManifestoExperience({ doc, locale, viewDemoLabel }: Props) {
  return (
    <main className="grid-ledger relative z-0 min-h-screen overflow-x-clip">
      <ProtocolField />
      <div className="paper-vignette pointer-events-none absolute inset-0 z-[1]" />

      <div className="manifesto-content relative z-10 mx-auto max-w-3xl px-6 py-16 md:max-w-4xl md:px-8 md:py-24 lg:py-28">
        <ManifestoHeader
          {...doc.frontmatter}
          locale={locale}
          viewDemoLabel={viewDemoLabel}
        />

        <div className="manifesto-sections mt-2 md:mt-4">
          {doc.sections.map((section, index) => (
            <Reveal key={section.index} delayMs={Math.min(index * 50, 200)}>
              <ManifestoSection {...section} />
            </Reveal>
          ))}
        </div>

        <Reveal delayMs={80}>
          <HanMark
            brand={doc.frontmatter.brand}
            subline={doc.frontmatter.subline}
          />
        </Reveal>
      </div>
    </main>
  );
}
