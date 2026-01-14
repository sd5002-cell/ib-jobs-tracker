import { supabase } from "./db.js";
import { fetchActiveCompanies } from "./companies.js";
import { fetchGreenhouseJobs } from "./connectors/greenhouse.js";
import { jobTextForExclusion, jobTextForInclusion, classifyRoleType, isIB, EXCLUDE_RE } from "./classify.js";

async function main() {
  const companies = await fetchActiveCompanies();
  const now = new Date().toISOString();

  let totalUpserted = 0;

  for (const c of companies) {
    if (c.connector !== "greenhouse") continue;

    const board = c.config?.board;
    if (!board) {
      console.log(`[SKIP] ${c.name} missing config.board`);
      continue;
    }

    const forceIbKeywords: string[] = c.config?.force_ib_keywords ?? [];

    console.log(`\nFetching ${c.name} (Greenhouse board: ${board})...`);
    const jobs = await fetchGreenhouseJobs(board);

    const rows = jobs
      .map((job) => {
        const inclusionText = jobTextForInclusion(job);
        const exclusionText = jobTextForExclusion(job);

        const roleType = classifyRoleType(inclusionText);
        if (!roleType) return null;

        if (!isIB(inclusionText, forceIbKeywords)) return null;

        if (EXCLUDE_RE.test(exclusionText)) return null;

        return {
          company_id: c.id,
          source: "greenhouse",
          external_id: String(job.id),
          title: job.title,
          location: job.location?.name ?? null,
          url: job.absolute_url,
          role_type: roleType,
          tags: ["IB"],
          posted_at: job.updated_at ?? job.created_at ?? null,
          last_seen_at: now,
          is_active: true,
          raw: job
        };
      })
      .filter(Boolean);

    const { error } = await supabase.from("jobs").upsert(rows as any[], {
      onConflict: "company_id,external_id"
    });

    if (error) throw error;

    console.log(`Upserted ${rows.length} jobs for ${c.name}`);
    totalUpserted += rows.length;
  }

  console.log(`\nDone. Total upserted this run: ${totalUpserted}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
