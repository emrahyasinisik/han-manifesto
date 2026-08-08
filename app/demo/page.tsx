import type { Metadata } from "next";
import { DemoPanel } from "@/components/demo/DemoPanel";

export const metadata: Metadata = {
  title: "HAN Panel Demo",
  description:
    "Interactive mock of the HAN panel — scan marketplaces, review UCP issues, approve AI suggestions.",
};

export default function DemoPage() {
  return <DemoPanel />;
}
