"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type Company = { id: string; name: string };

type JobRow = {
  id: string;
  company_id: string;
  title: string;
  location: string | null;
  url: string;
  role_type: "SA" | "FT" | string;
  posted_at: string | null;
  first_seen_at: string;
  last_seen_at: string | null;
  is_active: boolean;
  companies: Company | null;
};

function fmtShortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
}

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function Home() {
  const [role, setRole] = useState<"ALL" | "SA" | "FT">("ALL");
  const [companyId, setCompanyId] = useState<string>("ALL");
  const [days, setDays] = useState<string>("30");
  const [q, setQ] = useState("");

  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch jobs whenever filters change
  useEffect(() => {
    const controller = new AbortController();

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("role", role);
        params.set("companyId", companyId);
        params.set("days", days);
        if (q.trim()) params.set("q", q.trim());

        const res = await fetch(`/api/jobs?${params.toString()}`, {
          signal: controller.signal
        });
        const json = await res.json();

        if (!res.ok) throw new Error(json?.error || "Failed to load jobs");

        setJobs(json.jobs ?? []);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setError(e?.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    run();
    return () => controller.abort();
  }, [role, companyId, days, q]);

  // Build company dropdown options from returned rows
  const companyOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const j of jobs) {
      const name = j.companies?.name ?? j.company_id;
      map.set(j.company_id, name);
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [jobs]);

  // “Last crawl” proxy = max(last_seen_at)
  const lastCrawl = useMemo(() => {
    if (!jobs.length) return null;
    let max = jobs[0].last_seen_at ?? jobs[0].first_seen_at;
    for (const j of jobs) {
      const t = j.last_seen_at ?? j.first_seen_at;
      if (t > max) max = t;
    }
    return max;
  }, [jobs]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Top bar */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_25px_hsl(var(--primary))]" />
            <Badge variant="secondary" className="text-xs">
              IB STUDENT ROLES
            </Badge>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Track Summer Analyst & Full-Time IB postings
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Pulling directly from official job boards. Clean, fast, and filterable.
          </p>
        </div>

        <Card className="w-full sm:w-[360px]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Status</div>
              <Badge className="text-xs">{loading ? "Loading" : "Live"}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            Last crawl:{" "}
            <span className="text-foreground">
              {lastCrawl ? fmtDateTime(lastCrawl) : "—"}
            </span>
            <Separator className="my-3" />
            Sources: <span className="text-foreground">Greenhouse</span>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mt-8">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <Tabs value={role} onValueChange={(v) => setRole(v as any)}>
                <TabsList>
                  <TabsTrigger value="ALL">All</TabsTrigger>
                  <TabsTrigger value="SA">Summer</TabsTrigger>
                  <TabsTrigger value="FT">Full-Time</TabsTrigger>
                </TabsList>
              </Tabs>

              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All companies</SelectItem>
                  {companyOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={days} onValueChange={setDays}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last 365 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <Input
                className="w-full lg:w-[320px]"
                placeholder="Search title, location…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mt-6 grid grid-cols-1 gap-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {error ? (
              <span className="text-destructive">Error: {error}</span>
            ) : (
              <>
                Showing <span className="text-foreground">{jobs.length}</span> roles
              </>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            Sorted by newest
          </Badge>
        </div>

        {jobs.map((j) => {
          const companyName = j.companies?.name ?? "Unknown company";
          const firstSeen = fmtShortDate(j.first_seen_at);
          const roleLabel =
            j.role_type === "SA"
              ? "Summer Analyst"
              : j.role_type === "FT"
              ? "Full-Time"
              : j.role_type;

          return (
            <Card
              key={j.id}
              className="transition hover:border-primary/50 hover:shadow-[0_0_40px_hsl(var(--primary)/0.12)]"
            >
              <CardContent className="p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <a
                      href={j.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-base font-semibold leading-tight hover:underline"
                    >
                      {j.title}
                    </a>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {companyName} • {j.location ?? "—"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className="text-xs">{roleLabel}</Badge>
                    <Badge variant="secondary" className="text-xs">
                      First seen {firstSeen}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-10 text-xs text-muted-foreground">
        Built to scale into ER, ECM/DCM, and other student tracks.
      </div>
    </main>
  );
}
