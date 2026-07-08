export interface Franchise {
  id: string;
  org_id: string;
  managed_by: string | null;
  name: string;
  created_at: string;
}

export interface FranchiseWithDetails extends Franchise {
  screen_count: number;
  manager_name?: string;
  manager_email?: string;
}

export interface OrgMember {
  user_id: string;
  role: string;
  users?: {
    email?: string;
    raw_user_meta_data?: {
      full_name?: string;
    };
  };
}

export interface CreateFranchiseInput {
  name: string;
  managed_by: string | null;
}

export interface UpdateFranchiseInput {
  name: string;
  managed_by: string | null;
}
