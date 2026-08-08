import { ManifestoExperience } from "@/components/ManifestoExperience";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale } from "@/lib/i18n";
import { loadManifesto } from "@/lib/manifesto";
import { notFound } from "next/navigation";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [doc, dict] = await Promise.all([
    loadManifesto(locale),
    Promise.resolve(getDictionary(locale)),
  ]);

  return (
    <ManifestoExperience
      doc={doc}
      locale={locale}
      viewDemoLabel={dict.manifesto.viewDemo}
    />
  );
}
