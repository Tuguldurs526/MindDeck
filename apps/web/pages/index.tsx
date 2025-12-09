// apps/web/pages/index.tsx
import Link from "next/link";
import { useAuth } from "../src/context/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background:
          "radial-gradient(circle at top left, #e0e7ff, #f9fafb 40%, #f1f5f9)",
      }}
    >
      <div style={{ maxWidth: 720, width: "100%" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>Minddeck</div>
          <nav style={{ display: "flex", gap: "0.75rem", fontSize: "0.9rem" }}>
            {user ? (
              <>
                <Link href="/decks">My decks</Link>
                <Link href="/ai">AI generator</Link>
              </>
            ) : (
              <>
                <Link href="/login">Log in</Link>
                <Link href="/register">Sign up</Link>
              </>
            )}
          </nav>
        </header>

        <section>
          <h1
            style={{
              fontSize: "2.4rem",
              lineHeight: 1.1,
              marginBottom: "0.75rem",
            }}
          >
            Studying doesn&apos;t have to suck.
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "#64748b",
              maxWidth: 480,
              marginBottom: "1.5rem",
            }}
          >
            Turn your notes into smart flashcards in seconds. Minddeck combines
            spaced repetition with AI‑generated cards to help you remember more
            in less time.
          </p>

          <div
            style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem" }}
          >
            <Link
              href={user ? "/decks" : "/register"}
              style={{
                padding: "0.7rem 1.3rem",
                borderRadius: 999,
                background: "#4f46e5",
                color: "white",
                fontWeight: 600,
                textDecoration: "none",
                fontSize: "0.95rem",
              }}
            >
              {user ? "Go to your decks" : "Get started"}
            </Link>
            <Link
              href="/ai"
              style={{
                padding: "0.7rem 1.1rem",
                borderRadius: 999,
                border: "1px solid #cbd5f5",
                color: "#1e293b",
                textDecoration: "none",
                fontSize: "0.9rem",
              }}
            >
              Try AI flashcards
            </Link>
          </div>

          <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
            Paste your notes, generate cards, clean them up, and review
            everywhere.
          </p>
        </section>
      </div>
    </main>
  );
}
