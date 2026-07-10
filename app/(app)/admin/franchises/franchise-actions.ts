"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  Franchise,
  FranchiseWithDetails,
  CreateFranchiseInput,
  UpdateFranchiseInput,
  OrgMember,
} from "./types";

export async function getFranchises(): Promise<FranchiseWithDetails[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!member) throw new Error("Not a member of any organization");

  const { data: franchises, error: franchisesError } = await supabase
    .from("franchises")
    .select("*")
    .eq("org_id", member.org_id)
    .order("created_at", { ascending: false });

  if (franchisesError) throw new Error("Failed to fetch franchises");

  const franchisesWithDetails: FranchiseWithDetails[] = await Promise.all(
    (franchises || []).map(async (franchise: Franchise) => {
      const { count: screenCount } = await supabase
        .from("screens")
        .select("*", { count: "exact", head: true })
        .eq("franchise_id", franchise.id);

      let managerName: string | undefined;
      let managerEmail: string | undefined;

      if (franchise.managed_by) {
        const { data: managerData } = await supabase
          .from("org_members")
          .select("user_id, users(email, raw_user_meta_data)")
          .eq("user_id", franchise.managed_by)
          .eq("org_id", member.org_id)
          .single();

        if (managerData) {
          const userData = managerData.users as any;
          managerEmail = userData?.email;
          managerName = userData?.raw_user_meta_data?.full_name || managerEmail;
        }
      }

      return {
        ...franchise,
        screen_count: screenCount || 0,
        manager_name: managerName,
        manager_email: managerEmail,
      };
    })
  );

  return franchisesWithDetails;
}

export async function getFranchiseManagers(): Promise<OrgMember[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!member) throw new Error("Not a member of any organization");

  const { data: managers, error: managersError } = await supabase
    .from("org_members")
    .select("user_id, role, users(email, raw_user_meta_data)")
    .eq("org_id", member.org_id)
    .eq("role", "franchise_manager");

  if (managersError) throw new Error("Failed to fetch managers");

  return (managers || []) as unknown as OrgMember[];
}

export async function createFranchise(input: CreateFranchiseInput): Promise<Franchise> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: member } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .single();

  if (!member) throw new Error("Not a member of any organization");

  const { data: franchise, error: franchiseError } = await supabase
    .from("franchises")
    .insert({
      org_id: member.org_id,
      name: input.name,
      managed_by: input.managed_by,
    })
    .select()
    .single();

  if (franchiseError) throw new Error("Failed to create franchise");

  revalidatePath("/admin/franchises");
  return franchise;
}

export async function updateFranchise(
  franchiseId: string,
  input: UpdateFranchiseInput
): Promise<Franchise> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: franchise, error: franchiseError } = await supabase
    .from("franchises")
    .update({
      name: input.name,
      managed_by: input.managed_by,
    })
    .eq("id", franchiseId)
    .select()
    .single();

  if (franchiseError) throw new Error("Failed to update franchise");

  revalidatePath("/admin/franchises");
  return franchise;
}
