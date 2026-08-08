type Props = { html: string };

export function ManifestoCommitment({ html }: Props) {
  return (
    <footer className="manifesto-commitment">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-6 top-12 h-28 w-28 rounded-full bg-[var(--color-amber)]/10 blur-2xl md:-left-10"
      />
      <p className="ms-label manifesto-commitment__label">Commitment</p>
      <div
        className="ms-body prose-manifesto prose-manifesto-commitment manifesto-commitment__body font-serif"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </footer>
  );
}
