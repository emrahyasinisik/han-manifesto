type Props = {
  brand: string;
  subline: string;
  title: string;
  intro: string;
};

export function ManifestoHeader({ brand, subline, title, intro }: Props) {
  return (
    <header className="mb-12 animate-fade-up md:mb-16">
      <p className="mb-4 max-w-full text-xs font-semibold uppercase leading-relaxed tracking-[0.12em] text-[var(--color-amber)] md:tracking-[0.16em]">
        {brand} · {subline}
      </p>
      <h1 className="font-serif text-pretty text-3xl font-semibold leading-snug tracking-tight sm:text-4xl md:text-5xl md:leading-tight">
        {title}
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--color-muted)] md:mt-6 md:text-lg">
        {intro}
      </p>
    </header>
  );
}
