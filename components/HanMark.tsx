type Props = {
  brand?: string;
  subline?: string;
};

export function HanMark({
  brand = "HAN",
  subline = "Hub for Agent Networks",
}: Props) {
  return (
    <footer className="han-mark" aria-label={`${brand} — ${subline}`}>
      <div aria-hidden className="han-mark__rule" />
      <p className="han-mark__wordmark font-serif">{brand}</p>
      <p className="han-mark__subline">{subline}</p>
    </footer>
  );
}
