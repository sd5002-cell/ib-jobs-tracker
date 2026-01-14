import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function escapeLike(input: string) {
  // Escape % and _ which are wildcards in SQL LIKE.
  // Also escape backslash itself.
  return input.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const role = searchParams.get("role") ?? "ALL";
  const companyId = searchParams.get("companyId") ?? "ALL";
  const qRaw = (searchParams.get("q") ?? "").trim();
  const days = Number(searchParams.get("days") ?? "30");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(url, anon);

  let query = supabase
    .from("jobs")
    .select(
      `
      id,
      company_id,
      title,
      location,
      url,
      role_type,
      posted_at,
      first_seen_at,
      last_seen_at,
      is_active,
      companies:companies ( id, name )
    `
    )
    .eq("is_active", true)
    .order("first_seen_at", { ascending: false });

  if (role !== "ALL") query = query.eq("role_type", role);
  if (companyId !== "ALL") query = query.eq("company_id", companyId);

  if (Number.isFinite(days) && days > 0) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte("first_seen_at", cutoff);
  }

  // ---- SEARCH (handles spaces safely) ----
  if (qRaw) {
    const q = escapeLike(qRaw);
    const pattern = `%${q}%`;

    // 1) Find matching company IDs by name
    const { data: companies, error: compErr } = await supabase
      .from("companies")
      .select("id")
      .ilike("name", pattern);

    if (compErr) {
      return NextResponse.json({ error: compErr.message }, { status: 500 });
    }

    const ids = (companies ?? []).map((c) => c.id);

    // 2) Apply safe OR logic:
    //    - title ilike
    //    - location ilike
    //    - OR company_id in ids (if any)
    //
    // NOTE: PostgREST "or()" still used, but with no spaces in syntax tokens
    // and we do NOT inject raw strings that break parsing.
    if (ids.length > 0) {
      query = query.or(`title.ilike.${pattern},location.ilike.${pattern},company_id.in.(${ids.join(",")})`);
    } else {
      query = query.or(`title.ilike.${pattern},location.ilike.${pattern}`);
    }
  }
  // ---------------------------------------

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ jobs: data ?? [] });
}
