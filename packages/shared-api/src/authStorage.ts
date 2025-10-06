export interface AuthStorage {
  getToken(): Promise<string | null>;
  setToken(token: string): Promise<void>;
  clearToken(): Promise<void>;
}

export const webStorage: AuthStorage = {
  async getToken() { return localStorage.getItem("token"); },
  async setToken(t) { localStorage.setItem("token", t); },
  async clearToken() { localStorage.removeItem("token"); }
};