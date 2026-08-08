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
        <div className="animate-fade-up-delay">
          {doc.sections.map((section) => (
            <ManifestoSection key={section.index} {...section} />
          ))}
        </div>
        <ManifestoCommitment html={doc.commitmentHtml} />
      </div>
    </main>
  );
}
