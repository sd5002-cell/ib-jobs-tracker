function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function jobTextForInclusion(job: any): string {
  const title = String(job.title ?? "");
  const dept = (job.departments ?? []).map((d: any) => String(d.name)).join(" ");
  const offices = (job.offices ?? []).map((o: any) => String(o.name)).join(" ");
  const location = String(job.location?.name ?? "");
  const metadata = (job.metadata ?? []).map((m: any) => `${m.name} ${m.value}`).join(" ");
  const contentText = stripHtml(String(job.content ?? ""));
  return `${title} ${dept} ${offices} ${location} ${metadata} ${contentText}`.toLowerCase();
}

export function jobTextForExclusion(job: any): string {
  const title = String(job.title ?? "");
  const dept = (job.departments ?? []).map((d: any) => String(d.name)).join(" ");
  const metadata = (job.metadata ?? []).map((m: any) => `${m.name} ${m.value}`).join(" ");
  return `${title} ${dept} ${metadata}`;
}

export function classifyRoleType(text: string): "SA" | "FT" | null {
  if (/summer|intern|internship/.test(text)) return "SA";
  if (/full[-\s]?time|new grad|graduate|campus|analyst program/.test(text)) return "FT";
  return null;
}

export function isIB(text: string, forceIbKeywords: string[]): boolean {
  const baseIB =
    /investment\s+banking|ibd|\bm\s*&\s*a\b|mergers|acquisitions|corporate\s+finance/.test(text);
  const forcedIB = (forceIbKeywords ?? []).some((k) => text.includes(String(k).toLowerCase()));
  return baseIB || forcedIB;
}

// Exclusions ONLY on title/dept/metadata
export const EXCLUDE_RE =
  /\b(teller|branch|wealth|software|engineer|developer|product|operations|risk|compliance|audit)\b/i;
