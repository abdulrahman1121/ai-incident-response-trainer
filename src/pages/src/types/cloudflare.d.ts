// Cloudflare Workers types for build compatibility
declare global {
  interface KVNamespace {
    get(key: string): Promise<string | null>;
    put(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
  }

  interface R2Bucket {
    get(key: string): Promise<R2Object | null>;
    put(key: string, value: ReadableStream | ArrayBuffer): Promise<void>;
    delete(key: string): Promise<void>;
  }

  interface R2Object {
    key: string;
    size: number;
    etag: string;
    body: ReadableStream;
  }

  interface Ai {
    run(model: string, input: any): Promise<any>;
  }

  interface DurableObjectNamespace {
    get(id: string): DurableObjectStub;
  }

  interface DurableObjectStub {
    fetch(request: Request): Promise<Response>;
  }
}

export {};
