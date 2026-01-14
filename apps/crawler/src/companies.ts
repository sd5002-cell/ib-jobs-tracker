import { supabase } from "./db.js";

export type Company = {
  id: string;
  name: string;
  connector: string;
  config: any;
};

export async function fetchActiveCompanies(): Promise<Company[]> {
  const { data, error } = await supabase
    .from("companies")
    .select("id,name,connector,config,active")
    .eq("active", true);

  if (error) throw error;

  return (data ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    connector: c.connector,
    config: c.config ?? {}
  }));
}
