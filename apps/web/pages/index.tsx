// apps/web/pages/index.tsx
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "../src/context/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();

  // If already logged in, go straight to decks
  useEffect(() => {
    if (user) {
      router.replace("/decks");
    }
  }, [user, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, #a5b4fc 0, #e0f2fe 30%, #f5f3ff 70%, #f9fafb 100%)",
        padding: "2rem 1rem",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      }}
    >
      <header
        style={{
          maxWidth: 960,
          margin: "0 auto 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "999px",
              background:
                "conic-gradient(from 180deg at 50% 50%, #4f46e5, #06b6d4, #a855f7, #4f46e5)",
            }}
          />
          <span
            style={{ fontWeight: 700, fontSize: "1.25rem", color: "#111827" }}
          >
            Minddeck
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          {user ? (
            <>
              <Link href="/decks">
                <button
                  type="button"
                  style={{
                    padding: "0.45rem 1.2rem",
                    borderRadius: 999,
                    border: "1px solid rgba(148,163,184,0.4)",
                    backgroundColor: "rgba(255,255,255,0.6)",
                    backdropFilter: "blur(10px)",
                    cursor: "pointer",
                  }}
                >
                  My decks
                </button>
              </Link>
              <Link href="/ai">
                <button
                  type="button"
                  style={{
                    padding: "0.45rem 1.2rem",
                    borderRadius: 999,
                    border: "none",
                    background:
                      "linear-gradient(135deg, #4f46e5 0%, #6366f1 40%, #14b8a6 100%)",
                    color: "white",
                    cursor: "pointer",
                    boxShadow: "0 18px 40px rgba(79,70,229,0.35)",
                  }}
                >
                  AI generator
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <button
                  type="button"
                  style={{
                    padding: "0.45rem 1.1rem",
                    borderRadius: 999,
                    border: "1px solid rgba(148,163,184,0.4)",
                    background:
                      "linear-gradient(135deg, #4f46e5 0%, #a855f7 50%, #22c55e 100%)",
                    backdropFilter: "blur(10px)",
                    cursor: "pointer",
                  }}
                >
                  Log in
                </button>
              </Link>
              <Link href="/register">
                <button
                  type="button"
                  style={{
                    padding: "0.45rem 1.2rem",
                    borderRadius: 999,
                    border: "none",
                    background:
                      "linear-gradient(135deg, #4f46e5 0%, #6366f1 40%, #14b8a6 100%)",
                    color: "white",
                    cursor: "pointer",
                    boxShadow: "0 18px 40px rgba(79,70,229,0.35)",
                  }}
                >
                  Get started
                </button>
              </Link>
            </>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto" }}>
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
            gap: "2.5rem",
            alignItems: "center",
          }}
        >
          {/* Left: hero copy */}
          <div>
            <p
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0.2rem 0.75rem",
                borderRadius: 999,
                backgroundColor: "rgba(158, 88, 223, 0.7)",
                fontSize: "0.8rem",
                marginBottom: "0.75rem",
                border: "1px solid rgba(148,163,184,0.4)",
              }}
            >
              ✨ AI‑powered flashcards for students
            </p>
            <h1
              style={{
                fontSize: "2.6rem",
                lineHeight: 1.1,
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: "0.75rem",
              }}
            >
              Studying doesn&apos;t have to suck.
            </h1>
            <p
              style={{
                fontSize: "1.05rem",
                maxWidth: "32rem",
                color: "#4b5563",
                marginBottom: "1.5rem",
              }}
            >
              Paste your notes or upload slides and Minddeck turns them into
              smart flashcards with spaced‑repetition scheduling. Spend less
              time making cards and more time actually learning.
            </p>

            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                marginBottom: "1.25rem",
              }}
            >
              <Link href={user ? "/decks" : "/register"}>
                <button
                  type="button"
                  style={{
                    padding: "0.8rem 1.6rem",
                    borderRadius: 999,
                    border: "none",
                    background:
                      "linear-gradient(135deg, #4f46e5 0%, #a855f7 50%, #22c55e 100%)",
                    color: "white",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 22px 45px rgba(79,70,229,0.45)",
                  }}
                >
                  {user ? "Go to your decks" : "Start for free"}
                </button>
              </Link>

              <Link href={user ? "/ai" : "/login"}>
                <button
                  type="button"
                  style={{
                    padding: "0.8rem 1.4rem",
                    borderRadius: 999,
                    border: "1px solid rgba(148,163,184,0.5)",
                    background:
                      "linear-gradient(135deg, #4f46e5 0%, #a855f7 50%, #22c55e 100%)",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  {user ? "Open AI generator" : "I already have an account"}
                </button>
              </Link>
            </div>

            <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
              • AI flashcard generator from any text
              <br />
              • Spaced‑repetition review queue
              <br />• Manual decks for full control
            </p>
          </div>

          {/* Right: glassmorphism card preview */}
          <div
            style={{
              borderRadius: 32,
              padding: "1.5rem",
              background: "rgba(255,255,255,0.8)",
              boxShadow: "0 24px 60px rgba(15,23,42,0.18)",
              border: "1px solid rgba(148,163,184,0.4)",
              backdropFilter: "blur(16px)",
            }}
          >
            <p
              style={{
                fontSize: "0.85rem",
                color: "#6b7280",
                marginBottom: "0.5rem",
              }}
            >
              Preview
            </p>
            <div
              style={{
                borderRadius: 20,
                padding: "1rem 1.25rem",
                background:
                  "linear-gradient(135deg, rgba(79,70,229,0.08), rgba(45,212,191,0.12))",
                marginBottom: "0.75rem",
              }}
            >
              <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                AI deck · Physics
              </p>
              <p
                style={{
                  fontWeight: 600,
                  marginTop: "0.35rem",
                  color: "#111827",
                }}
              >
                Q: Why does a cloud weigh millions of tonnes but still float?
              </p>
              <p
                style={{
                  fontSize: "0.9rem",
                  marginTop: "0.4rem",
                  color: "#4b5563",
                }}
              >
                A: Because the air beneath it is even denser, creating an upward
                buoyant force.
              </p>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
              Upload notes → Minddeck generates flashcards → you review them at
              the right time with spaced repetition.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
