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
