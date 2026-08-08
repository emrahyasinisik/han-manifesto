type Props = { html: string };

export function ManifestoCommitment({ html }: Props) {
  return (
    <footer className="relative mt-10 border-t-2 border-[var(--color-ink)] py-14 md:mt-12 md:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-6 top-10 h-24 w-24 rounded-full bg-[var(--color-amber)]/10 blur-2xl md:-left-10"
      />
      <p className="mb-6 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-amber)] md:tracking-[0.18em]">
        Taahhüt
      </p>
      <div
        className="prose-manifesto prose-manifesto-commitment relative font-serif text-xl leading-relaxed text-[var(--color-ink)] md:text-2xl"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </footer>
  );
}
