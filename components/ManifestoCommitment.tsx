type Props = { html: string };

export function ManifestoCommitment({ html }: Props) {
  return (
    <footer className="mt-8 animate-fade-up-late border-t-2 border-[var(--color-ink)] py-12 md:py-16">
      <p className="mb-6 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-amber)] md:tracking-[0.16em]">
        Taahhüt
      </p>
      <div
        className="prose-manifesto prose-manifesto-commitment font-serif text-xl leading-relaxed text-[var(--color-ink)] md:text-2xl"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </footer>
  );
}
