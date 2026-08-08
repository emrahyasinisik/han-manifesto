import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DemoPanel } from "@/components/demo/DemoPanel";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.meta.demoTitle,
    description: dict.meta.demoDescription,
    alternates: {
      languages: {
        en: "/en/demo",
        tr: "/tr/demo",
      },
    },
  };
}

export default async function DemoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  return <DemoPanel locale={locale} copy={dict.demo} />;
}
