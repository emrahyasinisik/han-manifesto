type Props = {
  index: string;
  title: string;
  html: string;
};

export function ManifestoSection({ index, title, html }: Props) {
  return (
    <section className="manifesto-section">
      <div className="manifesto-section__rail" aria-hidden>
        <span className="ms-index manifesto-section__index font-serif">
          {index}
        </span>
        <span className="ms-rule manifesto-section__spine" />
      </div>

      <div className="manifesto-section__main">
        <h2 className="ms-title manifesto-section__title font-serif">{title}</h2>
        <div className="ms-body manifesto-section__panel">
          <div
            className="prose-manifesto manifesto-section__prose"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </section>
  );
}
