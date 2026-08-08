type Props = {
  index: string;
  title: string;
  html: string;
};

export function ManifestoSection({ index, title, html }: Props) {
  return (
    <section className="border-t border-[var(--color-grid)] py-10 md:py-12">
      <div className="mb-4 inline-block border border-[var(--color-ink)] bg-[var(--color-paper)] px-3 py-1 text-xs font-semibold tracking-wide">
        {index}
      </div>
      <h2 className="font-serif mb-4 text-2xl font-semibold">{title}</h2>
      <div
        className="prose-manifesto max-w-2xl"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
