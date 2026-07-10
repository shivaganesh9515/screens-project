// Client-side Supabase compatible client
// NOTE: Must NOT import 'better-sqlite3' — native modules can't be bundled for the client.
// Client components use API routes for data. This provides a lightweight stub.

class ClientStub {
  from(_table: string) {
    // Return a thenable that throws on client-side data access
    const stub = {
      select: () => stub,
      eq: () => stub,
      neq: () => stub,
      in: () => stub,
      is: () => stub,
      order: () => stub,
      limit: () => stub,
      single: () => stub,
      insert: () => stub,
      update: () => stub,
      delete: () => stub,
      throwOnError: () => stub,
      then: (resolve?: any) => {
        console.warn("[Supabase Client] Direct DB access from client component — use API routes instead");
        return Promise.resolve(resolve?.({ data: null, error: new Error("Client-side DB access not supported — use server components or API routes") }));
      },
      catch: (reject?: any) => Promise.reject(new Error("Client-side DB access not supported")),
      finally: (cb?: any) => { cb?.(); return Promise.resolve(); },
    };
    return stub;
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
      upload: async (_path: string, _file: any) => ({ data: { path: _path }, error: null }),
      createSignedUploadUrl: async (_path: string) => ({
        data: { signedUrl: `http://localhost:3000/mock-upload/${_path}`, token: "mock-token", path: _path },
        error: null,
      }),
    }),
  };
}

let instance: ClientStub | null = null;

export function createClient() {
  if (!instance) {
    instance = new ClientStub();
  }
  console.log("[Supabase Client] Using client-side stub");
  return instance as any;
}
