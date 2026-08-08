import { readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import type { Locale } from "@/lib/i18n";

export type ManifestoFrontmatter = {
  brand: string;
  subline: string;
  /** ISO date (YYYY-MM-DD) when the manifesto was published. */
  date: string;
  title: string;
  intro: string;
};

export type ManifestoSection = {
  index: string;
  title: string;
  html: string;
};

export type ManifestoDoc = {
  frontmatter: ManifestoFrontmatter;
  sections: ManifestoSection[];
  /** Present only when manifesto.md includes ## Commitment / ## Taahhüt. */
  commitmentHtml: string;
};

const COMMITMENT_TITLES = new Set(["Commitment", "Taahhüt"]);

function normalizeManifestoDate(value: unknown): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return value.trim();
  }
  // gray-matter/js-yaml may parse bare YYYY-MM-DD as a Date
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  throw new Error(
    `manifesto frontmatter date must be YYYY-MM-DD, got: ${String(value)}`,
  );
}

async function mdToHtml(markdown: string): Promise<string> {
  const result = await remark().use(html).process(markdown);
  return String(result);
}

function splitSections(body: string): { title: string; body: string }[] {
  const parts = body.split(/^## /m).filter((p) => p.trim().length > 0);
  return parts.map((part) => {
    const nl = part.indexOf("\n");
    const title = (nl === -1 ? part : part.slice(0, nl)).trim();
    const sectionBody = nl === -1 ? "" : part.slice(nl + 1).trim();
    return { title, body: sectionBody };
  });
}

export function manifestoPath(locale: Locale): string {
  return path.join(process.cwd(), `content/manifesto.${locale}.md`);
}

export async function loadManifesto(
  localeOrPath: Locale | string = "en",
): Promise<ManifestoDoc> {
  const filePath =
    localeOrPath === "en" || localeOrPath === "tr"
      ? manifestoPath(localeOrPath)
      : localeOrPath;
  const raw = await readFile(filePath, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = {
    ...(data as Omit<ManifestoFrontmatter, "date"> & { date?: unknown }),
    date: normalizeManifestoDate(
      (data as { date?: unknown }).date,
    ),
  } satisfies ManifestoFrontmatter;

  for (const key of ["brand", "subline", "date", "title", "intro"] as const) {
    if (typeof frontmatter[key] !== "string" || !frontmatter[key].trim()) {
      throw new Error(`manifesto frontmatter missing string: ${key}`);
    }
  }

  const chunks = splitSections(content.trim());
  const sections: ManifestoSection[] = [];
  let commitmentHtml = "";

  for (const chunk of chunks) {
    const rendered = await mdToHtml(chunk.body);
    if (COMMITMENT_TITLES.has(chunk.title)) {
      commitmentHtml = rendered;
      continue;
    }
    const index = String(sections.length + 1).padStart(2, "0");
    sections.push({ index, title: chunk.title, html: rendered });
  }

  return { frontmatter, sections, commitmentHtml };
}
