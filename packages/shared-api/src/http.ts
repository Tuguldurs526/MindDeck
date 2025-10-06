import type { AuthStorage } from "./authStorage.js";

export function createHttp(baseUrl: string, storage: AuthStorage) {
  return {
    async get<T>(path: string) {
      const token = await storage.getToken();
      const res = await fetch(`${baseUrl}${path}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<T>;
    },
    async post<T>(path: string, body?: unknown) {
      const token = await storage.getToken();
      const res = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        },
        body: body ? JSON.stringify(body) : undefined
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<T>;
    }
  };
}