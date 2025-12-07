// authServiceTest.ts
import { authService } from "../service/AuthService";

// mock fetch globally
(global as any).fetch = async (url: string, options: any) => {
  console.log("Mock fetch called:", url, options);

  if (url.endsWith("/auth/login")) {
    return {
      ok: true,
      json: async () => ({
        token: "mock-token-123",
        user: { id: 1, name: "Mock User", email: "mock@mail.com" },
      }),
    };
  }

  if (url.endsWith("/auth/register")) {
    return {
      ok: true,
      json: async () => ({
        token: "mock-token-456",
        user: { id: 2, name: "New Mock User", email: "newmock@mail.com" },
      }),
    };
  }

  return { ok: false, json: async () => ({ message: "Not found" }) };
};

async function testAuthService() {
  const loginResponse = await authService.login({
    email: "test@mail.com",
    password: "123456",
  });
  console.log("Login response:", loginResponse);
}

testAuthService();
