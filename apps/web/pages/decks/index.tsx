// apps/web/pages/decks/index.tsx
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiCreateDeck, apiListDecks, type Deck } from "shared-api";
import { AppLayout } from "../../src/components/AppLayout";
import { RequireAuth } from "../../src/components/RequireAuth";
import { useAuth } from "../../src/context/AuthContext";

function DeckListInner() {
  const { token } = useAuth();

  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleCreateDeck = async () => {
    if (!token) return;
    const title = window.prompt("Deck title?");
    if (!title) return;

    try {
      setLoading(true);
      setError("");

      const newDeck = await apiCreateDeck(token, title.trim());
      setDecks((prev) => [newDeck, ...prev]);
    } catch (e: any) {
      setError(e.message || "Failed to create deck");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError("");

      try {
        const items = await apiListDecks(token);
        if (!cancelled) {
          setDecks(items);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message || "Failed to load decks");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AppLayout>
      <main style={{ maxWidth: 720, margin: "2rem auto", padding: "1rem" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.6rem", marginBottom: 4 }}>Your decks</h1>
            <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
              Review, edit, and create new decks.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCreateDeck}
            style={{
              padding: "0.5rem 0.9rem",
              borderRadius: 999,
              border: "none",
              background: "#4f46e5",
              color: "#fff",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + New deck
          </button>
        </header>

        {loading && <p>Loading decks...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && decks.length === 0 && (
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
            No decks yet. Create one with the button above or generate one from
            the AI page.
          </p>
        )}

        {!loading && !error && decks.length > 0 && (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "grid",
              gap: "0.6rem",
            }}
          >
            {decks.map((d) => (
              <li
                key={d._id}
                style={{
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  padding: "0.7rem 0.9rem",
                  background: "#ffffff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <Link
                    href={`/decks/${d._id}`}
                    style={{
                      fontWeight: 600,
                      textDecoration: "none",
                      color: "#111827",
                    }}
                  >
                    {d.title}
                  </Link>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#9ca3af",
                      marginTop: 2,
                    }}
                  >
                    {d.cardCount ?? 0} cards
                  </div>
                </div>

                {/* Optional AI pill if source field exists */}
                {d.source === "ai" && (
                  <span
                    style={{
                      fontSize: "0.7rem",
                      padding: "0.15rem 0.55rem",
                      borderRadius: 999,
                      background: "#eef2ff",
                      color: "#4f46e5",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 0.04,
                    }}
                  >
                    AI
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </AppLayout>
  );
}

export default function DeckListPage() {
  return (
    <RequireAuth>
      <DeckListInner />
    </RequireAuth>
  );
}
