"use client";

import { useMemo, useState } from "react";
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

type Job = {
  title: string;
  company: string;
  location: string;
  roleType: "SA" | "FT";
  firstSeen: string;
};

// TEMP mock data (we’ll replace with Supabase next)
const MOCK: Job[] = [
  {
    title: "2027 US Advisory Summer Analyst - NY",
    company: "LionTree",
    location: "New York, NY",
    roleType: "SA",
    firstSeen: "Jan 14"
  },
  {
    title: "2027 US Advisory Summer Analyst - SF",
    company: "LionTree",
    location: "San Francisco, CA",
    roleType: "SA",
    firstSeen: "Jan 14"
  },
  {
    title: "Investment Banking Summer Analyst",
    company: "Solomon Partners",
    location: "New York, NY",
    roleType: "SA",
    firstSeen: "Jan 14"
  }
];

export default function Home() {
  const [role, setRole] = useState<"ALL" | "SA" | "FT">("ALL");
  const [company, setCompany] = useState<string>("ALL");
  const [days, setDays] = useState<string>("30");
  const [q, setQ] = useState("");

  const companies = useMemo(() => {
    return Array.from(new Set(MOCK.map((j) => j.company))).sort();
  }, []);

  const filtered = useMemo(() => {
    return MOCK.filter((j) => {
      if (role !== "ALL" && j.roleType !== role) return false;
      if (company !== "ALL" && j.company !== company) return false;
      const text = `${j.title} ${j.company} ${j.location}`.toLowerCase();
      if (q.trim() && !text.includes(q.trim().toLowerCase())) return false;
      return true;
    });
  }, [role, company, q]);

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
              <Badge className="text-xs">Live</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            Last crawl: <span className="text-foreground">just now</span>
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

              <Select value={company} onValueChange={setCompany}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All companies</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
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
                placeholder="Search title, firm, location…"
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
            Showing <span className="text-foreground">{filtered.length}</span> roles
          </div>
          <Badge variant="outline" className="text-xs">
            Sorted by newest
          </Badge>
        </div>

        {filtered.map((j, idx) => (
          <Card
            key={idx}
            className="transition hover:border-primary/50 hover:shadow-[0_0_40px_hsl(var(--primary)/0.12)]"
          >
            <CardContent className="p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-base font-semibold leading-tight">
                    {j.title}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {j.company} • {j.location}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="text-xs">
                    {j.roleType === "SA" ? "Summer Analyst" : "Full-Time"}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    First seen {j.firstSeen}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 text-xs text-muted-foreground">
        Built to scale into ER, ECM/DCM, and other student tracks.
      </div>
    </main>
  );
}
