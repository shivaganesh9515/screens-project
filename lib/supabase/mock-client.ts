// Mock Supabase client for local development
// When env vars are missing, this mock is used instead of the real Supabase client.
// All data is stored in-memory and persists via the mockData module.

import { mockData, cloneData } from "./mock-data";

// =============================================
// Mock Query Builder
// =============================================

class MockQueryBuilder {
  private table: string;
  private filters: Array<(rows: any[]) => any[]> = [];
  private orderClause: { column: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private headOnly = false;
  private singleRow = false;
  private insertData: any = null;
  private updateData: any = null;
  private isDeleteOp = false;
  private isInsertOp = false;
  private isUpdateOp = false;

  constructor(table: string) {
    this.table = table;
  }

  select(columns?: string, options?: { count?: "exact" | "planned" | "estimated"; head?: boolean }) {
    if (options?.head) this.headOnly = true;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((rows: any[]) => rows.filter((r: any) => r[column] === value));
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push((rows: any[]) => rows.filter((r: any) => r[column] !== value));
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push((rows: any[]) => rows.filter((r: any) => values.includes(r[column])));
    return this;
  }

  is(column: string, value: any) {
    this.filters.push((rows: any[]) => rows.filter((r: any) => r[column] === value || (r[column] === null && value === null)));
    return this;
  }

  order(column: string, { ascending = true } = {}) {
    this.orderClause = { column, ascending };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.singleRow = true;
    return this;
  }

  insert(data: any) {
    this.isInsertOp = true;
    this.insertData = data;
    return this;
  }

  update(data: any) {
    this.isUpdateOp = true;
    this.updateData = data;
    return this;
  }

  delete() {
    this.isDeleteOp = true;
    return this;
  }

  private execute() {
    const tableData = getTableData(this.table);
    if (!tableData) return { data: null, error: new Error(`Table "${this.table}" not found`), count: null };

    // Handle INSERT
    if (this.isInsertOp) {
      const items = Array.isArray(this.insertData) ? this.insertData : [this.insertData];
      for (const item of items) {
        const newItem = {
          id: item.id || `${this.table}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          org_id: item.org_id || "org-1",
          created_at: new Date().toISOString(),
          ...item,
        };
        tableData.push(newItem);
      }
      console.log(`[Mock] Inserted ${items.length} row(s) into "${this.table}"`);
      return { data: cloneData(items), error: null, count: items.length };
    }

    // Build data set from filters
    let data = [...tableData];
    for (const filter of this.filters) {
      data = filter(data);
    }

    // Handle DELETE
    if (this.isDeleteOp) {
      const ids = data.map((r: any) => r.id);
      // Remove from original array
      for (let i = tableData.length - 1; i >= 0; i--) {
        if (ids.includes(tableData[i].id)) {
          tableData.splice(i, 1);
        }
      }
      console.log(`[Mock] Deleted ${ids.length} row(s) from "${this.table}"`);
      return { data: null, error: null, count: ids.length };
    }

    // Handle UPDATE
    if (this.isUpdateOp) {
      for (const row of data) {
        Object.assign(row, this.updateData);
      }
      console.log(`[Mock] Updated ${data.length} row(s) in "${this.table}"`);
      return { data: cloneData(data), error: null, count: data.length };
    }

    // Handle SELECT
    // Apply ordering
    if (this.orderClause) {
      const { column, ascending } = this.orderClause;
      data = [...data].sort((a, b) => {
        const aVal = a[column];
        const bVal = b[column];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === "string") {
          return ascending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return ascending ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      });
    }

    // Apply limit
    if (this.limitCount) {
      data = data.slice(0, this.limitCount);
    }

    const count = data.length;

    // head-only query: return only count
    if (this.headOnly) {
      return { data: null, error: null, count };
    }

    // Single row
    if (this.singleRow) {
      return { data: data[0] || null, error: data.length === 0 ? new Error("No rows found") : null, count };
    }

    return { data: cloneData(data), error: null, count };
  }

  then<TResult1 = any, TResult2 = never>(
    resolve?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null | undefined,
    reject?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined
  ): Promise<TResult1 | TResult2> {
    try {
      const result = this.execute();
      if (resolve) return Promise.resolve(resolve(result));
      return Promise.resolve(result as any);
    } catch (e) {
      if (reject) return Promise.reject(reject!(e));
      return Promise.reject(e);
    }
  }

  // For catch() support
  catch<TResult = never>(reject?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined): Promise<any> {
    return this.then(undefined, reject);
  }

  // For finally() support
  finally(cb?: (() => void) | null | undefined): Promise<any> {
    return this.then(
      (v) => { cb?.(); return v; },
      (e) => { cb?.(); throw e; }
    );
  }

  // For throwOnError compatibility
  throwOnError() {
    return this;
  }
}

// =============================================
// Table data access
// =============================================

function getTableData(tableName: string): any[] | null {
  const tableMap: Record<string, string> = {
    orgs: "orgs",
    org_members: "org_members",
    screen_groups: "screen_groups",
    screens: "screens",
    media_items: "media_items",
    playlists: "playlists",
    playlist_items: "playlist_items",
    templates: "templates",
    schedules: "schedules",
    play_logs: "play_logs",
    franchises: "franchises",
    advertisers: "advertisers",
    ads: "ads",
    ad_franchise_targets: "ad_franchise_targets",
    screen_locations: "screen_locations",
    screen_status_log: "screen_status_log",
  };

  const key = tableMap[tableName];
  if (!key) return null;
  return (mockData as any)[key] || [];
}

// =============================================
// Mock Storage
// =============================================

class MockStorageFileApi {
  private bucket: string;

  constructor(bucket: string) {
    this.bucket = bucket;
  }

  async upload(path: string, _file: any, _options?: any) {
    console.log(`[Mock] Uploaded ${this.bucket}/${path}`);
    return { data: { path, id: `mock-${Date.now()}` }, error: null };
  }

  async createSignedUploadUrl(path: string) {
    return {
      data: { signedUrl: `http://localhost:3000/mock-upload/${path}`, token: "mock-token", path },
      error: null,
    };
  }
}

class MockStorage {
  from(bucket: string) {
    return new MockStorageFileApi(bucket);
  }
}

// =============================================
// Mock Auth
// =============================================

let currentUser: any = {
  id: "user-1",
  email: "admin@example.com",
  user_metadata: { full_name: "Admin User" },
  app_metadata: {},
  aud: "authenticated",
  created_at: "2025-01-01T00:00:00Z",
};

class MockAuth {
  async getUser() {
    return { data: { user: currentUser }, error: null };
  }

  async signInWithPassword({ email, password: _password }: { email: string; password: string }) {
    // Accept any email for mock mode - creates a user on the fly
    if (email) {
      currentUser = {
        id: "user-1",
        email,
        user_metadata: { full_name: email === "admin@example.com" ? "Admin User" : email.split("@")[0] },
        app_metadata: {},
        aud: "authenticated",
        created_at: "2025-01-01T00:00:00Z",
      };
      return { data: { user: currentUser, session: { access_token: "mock-token", refresh_token: "mock-refresh" } }, error: null };
    }
    return { data: { user: null, session: null }, error: { message: "Invalid login credentials", status: 400 } };
  }

  async signUp({ email, password: _password, options }: { email: string; password: string; options?: { data?: any } }) {
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      user_metadata: options?.data || {},
      app_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    };
    currentUser = newUser;
    return { data: { user: newUser, session: { access_token: "mock-token", refresh_token: "mock-refresh" } }, error: null };
  }

  async resetPasswordForEmail(_email: string, _options?: any) {
    return { data: {}, error: null };
  }

  async signOut() {
    currentUser = null;
    return { error: null };
  }

  onAuthStateChange(_callback: (event: string, session: any) => void) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
}

// =============================================
// Main Mock Client
// =============================================

class MockSupabaseClient {
  auth: MockAuth;
  storage: MockStorage;

  constructor() {
    this.auth = new MockAuth();
    this.storage = new MockStorage();
  }

  from(table: string) {
    return new MockQueryBuilder(table);
  }

  channel(_name: string) {
    return {
      subscribe: (callback?: (status: string) => void) => {
        if (callback) setTimeout(() => callback("SUBSCRIBED"), 0);
        return { unsubscribe: () => {} };
      },
      send: (_payload: any) => {},
    };
  }

  rpc(_fn: string, _params?: any) {
    return { data: null, error: null };
  }
}

// Singleton instance
let instance: MockSupabaseClient | null = null;

export function createMockClient() {
  if (!instance) {
    instance = new MockSupabaseClient();
  }
  return instance;
}
