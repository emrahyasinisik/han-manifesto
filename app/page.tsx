import { ManifestoExperience } from "@/components/ManifestoExperience";
import { loadManifesto } from "@/lib/manifesto";

export default async function HomePage() {
  const doc = await loadManifesto();
  return <ManifestoExperience doc={doc} />;
}
