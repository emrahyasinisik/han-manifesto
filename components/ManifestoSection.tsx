type Props = {
  index: string;
  title: string;
  html: string;
};

export function ManifestoSection({ index, title, html }: Props) {
  return (
    <section className="group border-t border-[var(--color-grid)]/90 py-11 md:py-14">
      <div className="section-badge mb-5 inline-flex items-center gap-2 border border-[var(--color-ink)] bg-[var(--color-paper)]/90 px-3 py-1.5 text-xs font-semibold tracking-wide shadow-[0_1px_0_rgba(17,17,17,0.04)] backdrop-blur-[2px] transition-all duration-300 group-hover:border-[var(--color-amber)] group-hover:text-[var(--color-amber)]">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-amber)] transition-transform duration-300 group-hover:scale-125" />
        {index}
      </div>
      <h2 className="font-serif mb-4 text-2xl font-semibold tracking-tight transition-colors duration-300 group-hover:text-[var(--color-ink)] md:text-[1.65rem]">
        {title}
      </h2>
      <div
        className="prose-manifesto max-w-2xl"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
