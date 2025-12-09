// apps/web/pages/register.tsx
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useAuth } from "../src/context/AuthContext";

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await register(email, username, password); // 👈 important
      // on success, user + token are stored in context, we can redirect
      window.location.href = "/decks";
    } catch (err: any) {
      setError(err.message || "Sign up failed");
    }
  };

  return (
    <main style={{ maxWidth: 420, margin: "4rem auto", padding: "1rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>
        Create your Minddeck account
      </h1>

      <form onSubmit={onSubmit}>
        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", marginTop: "0.25rem" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: "100%", marginTop: "0.25rem" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", marginTop: "0.25rem" }}
          />
        </label>

        {error && (
          <p style={{ color: "red", marginBottom: "0.75rem" }}>{error}</p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p style={{ marginTop: "1rem" }}>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </main>
  );
}
