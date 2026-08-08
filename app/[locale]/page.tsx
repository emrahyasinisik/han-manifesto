import { ManifestoExperience } from "@/components/ManifestoExperience";
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

  const doc = await loadManifesto(locale);
  return <ManifestoExperience doc={doc} />;
}
