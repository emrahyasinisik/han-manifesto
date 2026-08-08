type Props = {
  brand: string;
  subline: string;
  title: string;
  intro: string;
};

export function ManifestoHeader({ brand, subline, title, intro }: Props) {
  return (
    <header className="mb-16 animate-fade-up">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-amber)]">
        {brand} · {subline}
      </p>
      <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
        {title}
      </h1>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
        {intro}
      </p>
    </header>
  );
}
