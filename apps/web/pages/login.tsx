import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import { useAuth } from "../src/context/AuthContext";

export default function LoginPage() {
  const { login, loading, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("tugo@test.com");
  const [password, setPassword] = useState("Passw0rd!");
  const [error, setError] = useState("");

  if (user) {
    // already logged in → go to decks
    if (typeof window !== "undefined") router.replace("/decks");
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      router.push("/decks");
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <main style={{ maxWidth: 400, margin: "4rem auto", padding: "1rem" }}>
      <h1>Minddeck Login</h1>
      <form onSubmit={onSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <br />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p style={{ marginTop: "1rem", fontSize: "0.85rem" }}>
        You can reuse the same credentials as the backend smoke test:
        <code> tugo@test.com / Passw0rd! </code>
      </p>
    </main>
  );
}
