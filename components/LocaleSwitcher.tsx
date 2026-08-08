"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/lib/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  labels: Dictionary["localeSwitcher"];
};

function swapLocalePath(pathname: string, next: Locale): string {
  const segments = pathname.split("/");
  if (segments.length > 1 && isLocale(segments[1] ?? "")) {
    segments[1] = next;
    return segments.join("/") || `/${next}`;
  }
  return `/${next}${pathname === "/" ? "" : pathname}`;
}

export function LocaleSwitcher({ locale, labels }: Props) {
  const pathname = usePathname() || `/${locale}`;

  return (
    <nav className="locale-switcher" aria-label={labels.label}>
      <Link
        href={swapLocalePath(pathname, "tr")}
        className={`locale-switcher__btn ${locale === "tr" ? "is-active" : ""}`}
        hrefLang="tr"
        lang="tr"
        aria-current={locale === "tr" ? "true" : undefined}
      >
        {labels.tr}
      </Link>
      <span className="locale-switcher__sep" aria-hidden>
        /
      </span>
      <Link
        href={swapLocalePath(pathname, "en")}
        className={`locale-switcher__btn ${locale === "en" ? "is-active" : ""}`}
        hrefLang="en"
        lang="en"
        aria-current={locale === "en" ? "true" : undefined}
      >
        {labels.en}
      </Link>
    </nav>
  );
}
