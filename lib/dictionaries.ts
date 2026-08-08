import type { Locale } from "@/lib/i18n";
import en from "@/dictionaries/en.json";
import tr from "@/dictionaries/tr.json";

const dictionaries = {
  en,
  tr,
} as const;

export type Dictionary = typeof en;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
