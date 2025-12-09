// apps/web/pages/register.tsx
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import { apiRegister } from "shared-api";
import { useAuth } from "../src/context/AuthContext";

export default function RegisterPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) router.replace("/decks");
  }, [user, router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiRegister(username, email, password);
      // apiRegister already returns token + user, but AuthContext login uses apiLogin.
      // simplest: after successful register, go to login:
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, #a5b4fc 0, #e0f2fe 30%, #f5f3ff 70%, #f9fafb 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          borderRadius: 28,
          padding: "2rem 2.25rem",
          background: "rgba(255,255,255,0.9)",
          boxShadow: "0 24px 60px rgba(15,23,42,0.18)",
          border: "1px solid rgba(148,163,184,0.4)",
          backdropFilter: "blur(16px)",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "999px",
                background:
                  "conic-gradient(from 180deg at 50% 50%, #4f46e5, #06b6d4, #a855f7, #4f46e5)",
              }}
            />
            <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>
              Minddeck
            </span>
          </div>
          <Link
            href="/"
            style={{
              fontSize: "0.8rem",
              color: "#6b7280",
              textDecoration: "none",
            }}
          >
            ← Home
          </Link>
        </header>

        <h1
          style={{
            fontSize: "1.6rem",
            fontWeight: 700,
            marginBottom: "0.4rem",
            color: "#0f172a",
          }}
        >
          Create your account
        </h1>
        <p
          style={{
            fontSize: "0.9rem",
            color: "#6b7280",
            marginBottom: "1.5rem",
          }}
        >
          Save your decks, track progress and generate AI flashcards anytime.
        </p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.9rem" }}>
          <label style={{ fontSize: "0.85rem", color: "#4b5563" }}>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: "100%",
                marginTop: "0.2rem",
                padding: "0.6rem 0.7rem",
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.8)",
                background: "rgba(248,250,252,0.9)",
              }}
            />
          </label>

          <label style={{ fontSize: "0.85rem", color: "#4b5563" }}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                marginTop: "0.2rem",
                padding: "0.6rem 0.7rem",
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.8)",
                background: "rgba(248,250,252,0.9)",
              }}
            />
          </label>

          <label style={{ fontSize: "0.85rem", color: "#4b5563" }}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                marginTop: "0.2rem",
                padding: "0.6rem 0.7rem",
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.8)",
                background: "rgba(248,250,252,0.9)",
              }}
            />
          </label>

          {error && (
            <p style={{ color: "#dc2626", fontSize: "0.85rem" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "0.4rem",
              padding: "0.7rem 1rem",
              borderRadius: 999,
              border: "none",
              background:
                "linear-gradient(135deg, #4f46e5 0%, #a855f7 50%, #22c55e 100%)",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 22px 45px rgba(79,70,229,0.45)",
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p
          style={{
            marginTop: "1rem",
            fontSize: "0.85rem",
            color: "#6b7280",
          }}
        >
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#4f46e5" }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
