// SQLite Client — replaces the Supabase mock client
// Provides the same .from().select().eq().order().single() chaining API
// but executes real SQL against the local SQLite database

import { getDb } from "./connection";

// =============================================
// Helper: Strip Supabase nested join syntax from select columns
// Converts: "id, name, advertisers(name), ad_franchise_targets(franchises(name))"
// To:       "id, name"
// =============================================
function stripNestedJoins(columns: string): string {
  // Remove anything like: tablename(col1, col2) or tablename (col1, col2)
  // These are Supabase ORM-level joins that SQLite doesn't support
  let result = columns;
  // Remove parenthesized groups recursively
  while (result.includes("(") && result.includes(")")) {
    result = result.replace(/\w+\s*\([^()]*\)/g, "").trim();
  }
  // Clean up double commas and trailing commas
  result = result.replace(/,+/g, ",").replace(/,\s*$/, "").trim();
  // If we stripped everything, fall back to *
  return result || "*";
}

// =============================================
// SQL Query Builder — chainable API like Supabase
// =============================================

type Row = Record<string, any>;

class SqliteQueryBuilder {
  private table: string;
  private rawSelectColumns = "*";
  private filters: Array<{ sql: string; params: any[] }> = [];
  private orderClause: { column: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private offsetCount: number | null = null;
  private headOnly = false;
  private singleRow = false;
  private isInsertOp = false;
  private isUpdateOp = false;
  private isDeleteOp = false;
  private insertData: any = null;
  private updateData: any = null;
  private countType: "exact" | "planned" | "estimated" | null = null;

  constructor(table: string) {
    this.table = table;
  }

  select(columns?: string, options?: { count?: "exact" | "planned" | "estimated"; head?: boolean }) {
    if (columns) this.rawSelectColumns = columns;
    if (options?.head) this.headOnly = true;
    if (options?.count) this.countType = options.count;
    return this;
  }

  eq(column: string, value: any) {
    if (value === null) {
      this.filters.push({ sql: `"${column}" IS ?`, params: [value] });
    } else {
      this.filters.push({ sql: `"${column}" = ?`, params: [value] });
    }
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push({ sql: `"${column}" != ?`, params: [value] });
    return this;
  }

  gt(column: string, value: any) {
    this.filters.push({ sql: `"${column}" > ?`, params: [value] });
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push({ sql: `"${column}" >= ?`, params: [value] });
    return this;
  }

  lt(column: string, value: any) {
    this.filters.push({ sql: `"${column}" < ?`, params: [value] });
    return this;
  }

  lte(column: string, value: any) {
    this.filters.push({ sql: `"${column}" <= ?`, params: [value] });
    return this;
  }

  in(column: string, values: any[]) {
    if (values.length === 0) {
      this.filters.push({ sql: "1=0", params: [] }); // impossible condition
      return this;
    }
    const placeholders = values.map(() => "?").join(",");
    this.filters.push({ sql: `"${column}" IN (${placeholders})`, params: [...values] });
    return this;
  }

  is(column: string, value: any) {
    if (value === null) {
      this.filters.push({ sql: `"${column}" IS NULL`, params: [] });
    } else {
      this.filters.push({ sql: `"${column}" = ?`, params: [value] });
    }
    return this;
  }

  like(column: string, pattern: string) {
    this.filters.push({ sql: `"${column}" LIKE ?`, params: [pattern] });
    return this;
  }

  ilike(column: string, pattern: string) {
    this.filters.push({ sql: `LOWER("${column}") LIKE ?`, params: [pattern.toLowerCase()] });
    return this;
  }

  or(filterString: string) {
    // Supabase .or() syntax: "column1.eq.val1,column2.eq.val2" → (col1 = ? OR col2 = ?)
    const clauses = filterString.split(",");
    const orParts: string[] = [];
    const orParams: any[] = [];
    for (const clause of clauses) {
      const match = clause.match(/^(.+?)\.(eq|neq|gt|gte|lt|lte|like|ilike|is)\.(.+)$/);
      if (!match) continue;
      const [, col, op, val] = match;
      const column = `"${col}"`;
      const value = val === "null" ? null : val;
      switch (op) {
        case "eq":
          if (value === null) {
            orParts.push(`${column} IS NULL`);
          } else {
            orParts.push(`${column} = ?`);
            orParams.push(value);
          }
          break;
        case "neq":
          if (value === null) {
            orParts.push(`${column} IS NOT NULL`);
          } else {
            orParts.push(`${column} != ?`);
            orParams.push(value);
          }
          break;
        case "gt":
          orParts.push(`${column} > ?`); orParams.push(Number(value)); break;
        case "gte":
          orParts.push(`${column} >= ?`); orParams.push(Number(value)); break;
        case "lt":
          orParts.push(`${column} < ?`); orParams.push(Number(value)); break;
        case "lte":
          orParts.push(`${column} <= ?`); orParams.push(Number(value)); break;
        case "like":
          orParts.push(`${column} LIKE ?`); orParams.push(value); break;
        case "ilike":
          orParts.push(`LOWER(${column}) LIKE ?`); orParams.push(String(value).toLowerCase()); break;
        case "is":
          orParts.push(`${column} IS ${value === null ? "NULL" : "?"}`);
          if (value !== null) orParams.push(value);
          break;
      }
    }
    if (orParts.length > 0) {
      this.filters.push({
        sql: `(${orParts.join(" OR ")})`,
        params: orParams,
      });
    }
    return this;
  }

  contains(column: string, value: any) {
    // For SQLite, treat array contains as JSON array check
    // Supabase .contains("tags", ["tag1"]) → we check if the JSON array includes the value
    this.filters.push({ sql: `"${column}" LIKE ?`, params: [`%${JSON.stringify(value).slice(1, -1)}%`] });
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

  offset(count: number) {
    this.offsetCount = count;
    return this;
  }

  single() {
    this.singleRow = true;
    return this;
  }

  range(from: number, to: number) {
    // Supabase .range(from, to) — inclusive on both ends
    this.limitCount = to - from + 1;
    this.offsetCount = from;
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

  private execute(): { data: any; error: any; count: number | null } {
    const db = getDb();

    try {
      if (this.isInsertOp) {
        return this.executeInsert(db);
      }
      if (this.isDeleteOp) {
        return this.executeDelete(db);
      }
      if (this.isUpdateOp) {
        return this.executeUpdate(db);
      }
      return this.executeSelect(db);
    } catch (err: any) {
      console.error(`[DB Error] ${err.message}`);
      return { data: null, error: err, count: null };
    }
  }

  private buildWhereClause(): { whereSql: string; params: any[] } {
    if (this.filters.length === 0) {
      return { whereSql: "", params: [] };
    }
    const clauses = this.filters.map((f) => f.sql);
    const params = this.filters.flatMap((f) => f.params);
    return { whereSql: `WHERE ${clauses.join(" AND ")}`, params };
  }

  private executeInsert(db: any): { data: any; error: any; count: number | null } {
    const items = Array.isArray(this.insertData) ? this.insertData : [this.insertData];
    const inserted: Row[] = [];

    for (const item of items) {
      const columns = Object.keys(item);
      const values = Object.values(item);
      const placeholders = columns.map(() => "?").join(", ");
      const colNames = columns.map((c) => `"${c}"`).join(", ");

      const stmt = db.prepare(`INSERT INTO "${this.table}" (${colNames}) VALUES (${placeholders})`);
      const result = stmt.run(...values);

      // Fetch back the inserted row
      const id = item.id || (result as any).lastInsertRowid?.toString();
      if (id) {
        const row = db.prepare(`SELECT * FROM "${this.table}" WHERE id = ?`).get(id);
        if (row) inserted.push(row);
      }
    }

    return {
      data: Array.isArray(this.insertData) ? inserted : inserted[0] || null,
      error: null,
      count: inserted.length,
    };
  }

  private executeDelete(db: any): { data: any; error: any; count: number | null } {
    const { whereSql, params } = this.buildWhereClause();
    const selectSql = `SELECT id FROM "${this.table}" ${whereSql}`;
    const idsToDelete = db.prepare(selectSql).all(...params) as Row[];

    if (idsToDelete.length > 0) {
      const idPlaceholders = idsToDelete.map(() => "?").join(",");
      const deleteSql = `DELETE FROM "${this.table}" WHERE id IN (${idPlaceholders})`;
      db.prepare(deleteSql).run(...idsToDelete.map((r: Row) => r.id));
    }

    return { data: null, error: null, count: idsToDelete.length };
  }

  private executeUpdate(db: any): { data: any; error: any; count: number | null } {
    const { whereSql, params } = this.buildWhereClause();
    const selectSql = `SELECT id FROM "${this.table}" ${whereSql}`;
    const rowsToUpdate = db.prepare(selectSql).all(...params) as Row[];

    if (rowsToUpdate.length > 0) {
      const setColumns = Object.keys(this.updateData);
      const setValues = Object.values(this.updateData);
      const setClause = setColumns.map((c) => `"${c}" = ?`).join(", ");

      const idPlaceholders = rowsToUpdate.map(() => "?").join(",");
      const updateSql = `UPDATE "${this.table}" SET ${setClause} WHERE id IN (${idPlaceholders})`;
      db.prepare(updateSql).run(...setValues, ...rowsToUpdate.map((r: Row) => r.id));

      const fetchSql = `SELECT * FROM "${this.table}" WHERE id IN (${idPlaceholders})`;
      const updatedRows = db.prepare(fetchSql).all(...rowsToUpdate.map((r: Row) => r.id));
      return { data: updatedRows, error: null, count: updatedRows.length };
    }

    return { data: [], error: null, count: 0 };
  }

  private executeSelect(db: any): { data: any; error: any; count: number | null } {
    // Strip Supabase nested join syntax from select columns
    const selectColumns = stripNestedJoins(this.rawSelectColumns);

    let sql = `SELECT ${selectColumns} FROM "${this.table}"`;
    const { whereSql, params } = this.buildWhereClause();
    sql += ` ${whereSql}`;

    if (this.orderClause) {
      const dir = this.orderClause.ascending ? "ASC" : "DESC";
      sql += ` ORDER BY "${this.orderClause.column}" ${dir}`;
    }

    if (this.limitCount !== null) {
      sql += ` LIMIT ${this.limitCount}`;
    }

    if (this.offsetCount !== null) {
      sql += ` OFFSET ${this.offsetCount}`;
    }

    // Count query
    let count: number | null = null;
    if (this.countType || this.headOnly) {
      const countResult = db.prepare(`SELECT COUNT(*) as cnt FROM "${this.table}" ${whereSql}`).get(...params) as { cnt: number };
      count = countResult?.cnt ?? 0;
    }

    if (this.headOnly) {
      return { data: null, error: null, count };
    }

    const rows = db.prepare(sql).all(...params) as Row[];

    if (this.singleRow) {
      return {
        data: rows[0] || null,
        error: rows.length === 0 ? new Error("No rows found") : null,
        count: rows.length,
      };
    }

    return { data: rows, error: null, count: count ?? rows.length };
  }

  // Promise-like interface for async/await compatibility
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

  catch<TResult = never>(reject?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined): Promise<any> {
    return this.then(undefined, reject);
  }

  finally(cb?: (() => void) | null | undefined): Promise<any> {
    return this.then(
      (v) => { cb?.(); return v; },
      (e) => { cb?.(); throw e; }
    );
  }

  throwOnError() {
    return this;
  }

  [Symbol.toStringTag] = "Promise";
}

// =============================================
// SQLite Client — matches Supabase client interface
// =============================================

class SqliteClient {
  // Auth mock — supports getUser() for server components
  auth = {
    getUser: async () => {
      // Server components check the session cookie via middleware redirect.
      // For local dev, we read the user from the cookie directly.
      try {
        const { cookies: getCookies } = await import("next/headers");
        const cookieStore = await getCookies();
        const { verifySessionToken, COOKIE_NAME } = await import("@/lib/auth/session");
        const token = cookieStore.get(COOKIE_NAME)?.value;
        if (!token) return { data: { user: null }, error: null };
        const user = await verifySessionToken(token);
        return { data: { user: user || null }, error: null };
      } catch {
        return { data: { user: null }, error: null };
      }
    },
  };

  from(table: string) {
    return new SqliteQueryBuilder(table);
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

  storage = {
    from: (_bucket: string) => ({
      upload: async (_path: string, _file: any) => ({
        data: { path: _path },
        error: null,
      }),
      createSignedUploadUrl: async (_path: string) => ({
        data: { signedUrl: `http://localhost:3000/mock-upload/${_path}`, token: "mock-token", path: _path },
        error: null,
      }),
    }),
  };
}

let instance: SqliteClient | null = null;

export function createSqliteClient() {
  if (!instance) {
    instance = new SqliteClient();
  }
  return instance;
}
