type Props = {
  brand: string;
  subline: string;
  title: string;
  intro: string;
};

export function ManifestoHeader({ brand, subline, title, intro }: Props) {
  return (
    <header className="mb-14 md:mb-20">
      <p className="hero-stagger hero-stagger-1 mb-4 max-w-full text-xs font-semibold uppercase leading-relaxed tracking-[0.12em] text-[var(--color-amber)] md:tracking-[0.18em]">
        {brand}
        <span className="text-[var(--color-muted)]"> · </span>
        {subline}
      </p>
      <h1 className="hero-stagger hero-stagger-2 font-serif text-pretty text-3xl font-semibold leading-snug tracking-tight sm:text-4xl md:text-5xl md:leading-[1.12]">
        {title}
      </h1>
      <p className="hero-stagger hero-stagger-3 mt-5 max-w-2xl text-base leading-relaxed text-[var(--color-muted)] md:mt-7 md:text-lg">
        {intro}
      </p>
      <div
        aria-hidden
        className="hero-stagger hero-stagger-4 mt-10 h-px max-w-xs bg-gradient-to-r from-[var(--color-amber)] via-[var(--color-grid)] to-transparent"
      />
    </header>
  );
}
