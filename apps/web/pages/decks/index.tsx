// apps/web/pages/decks/index.tsx
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  apiCreateDeck,
  apiGetReviewQueue,
  apiListDecks,
  type Deck,
} from "shared-api";
import { AppLayout } from "../../src/components/AppLayout";
import { RequireAuth } from "../../src/components/RequireAuth";
import { useAuth } from "../../src/context/AuthContext";

function formatNextReviewLabel(dueIso?: string | null) {
  if (!dueIso) return "No cards yet";

  const due = new Date(dueIso);
  if (Number.isNaN(due.getTime())) return "Scheduled";

  const now = new Date();
  const ms = due.getTime() - now.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.round(ms / dayMs);

  if (days <= -1) return "Overdue";
  if (days === 0) return "Today";
  if (days === 1) return "In 1 day";
  if (days > 1 && days <= 6) return `In ${days} days`;

  // Fallback: show calendar date
  return due.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function DeckListInner() {
  const { token, user, logout } = useAuth();

  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // deckId -> nextDue ISO string (or null)
  const [nextDueMap, setNextDueMap] = useState<Record<string, string | null>>(
    {},
  );

  const sortedDecks = useMemo(
    () =>
      [...decks].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [decks],
  );

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

  // Load decks
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

  // For each deck, fetch its next due card (limit=1, deckId=...)
  useEffect(() => {
    if (!token) return;
    if (decks.length === 0) return;

    let cancelled = false;

    const loadNextDue = async () => {
      try {
        const entries = await Promise.all(
          decks.map(async (deck) => {
            try {
              const res = await apiGetReviewQueue(token, 1, deck._id);
              const first = res.items[0];

              if (!first) return [deck._id, null] as const;

              const sm2 = (first as any).sm2;
              const dueIso: string | null =
                sm2 && typeof sm2.due === "string" ? sm2.due : null;

              return [deck._id, dueIso] as const;
            } catch {
              return [deck._id, null] as const;
            }
          }),
        );

        if (cancelled) return;

        const map: Record<string, string | null> = {};
        for (const [id, due] of entries) {
          map[id] = due;
        }
        setNextDueMap(map);
      } catch {
        // ignore global failure; individual decks already handled
      }
    };

    loadNextDue();

    return () => {
      cancelled = true;
    };
  }, [token, decks]);

  return (
    <main style={{ maxWidth: 960, margin: "2rem auto", padding: "0 1rem" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.6rem",
              marginBottom: "0.25rem",
              color: "#071025ff",
            }}
          >
            Your decks
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#040c1dff" }}>
            Review a deck or let AI help you generate new cards.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button
            type="button"
            onClick={handleCreateDeck}
            style={{
              padding: "0.45rem 1.1rem",
              borderRadius: 999,
              border: "none",
              background:
                "linear-gradient(135deg, #4f46e5 0%, #6366f1 40%, #14b8a6 100%)",
              color: "#fff",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 14px 30px rgba(79,70,229,0.35)",
            }}
          >
            + New deck
          </button>
        </div>
      </header>

      {loading && <p>Loading decks...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && sortedDecks.length === 0 && (
        <p>No decks yet. Create some via AI or the button above.</p>
      )}

      {!loading && !error && sortedDecks.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "grid",
            gap: "0.75rem",
          }}
        >
          {sortedDecks.map((deck) => {
            const nextDueIso = nextDueMap[deck._id] ?? null;
            const label = formatNextReviewLabel(nextDueIso);

            return (
              <li key={deck._id}>
                <Link
                  href={`/decks/${deck._id}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.9rem 1.1rem",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#ffffff",
                    textDecoration: "none",
                    color: "inherit",
                    boxShadow: "0 4px 10px rgba(15,23,42,0.04)",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        marginBottom: "0.2rem",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: "1rem",
                          color: "#0f172a",
                        }}
                      >
                        {deck.title}
                      </span>
                      {deck.source === "ai" && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            padding: "0.1rem 0.45rem",
                            borderRadius: 999,
                            backgroundColor: "rgba(59,130,246,0.08)",
                            color: "#1d4ed8",
                            border: "1px solid rgba(59,130,246,0.25)",
                          }}
                        >
                          AI
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.35rem",
                        alignItems: "center",
                        fontSize: "0.8rem",
                      }}
                    >
                      {/* Next review badge */}
                      <span
                        style={{
                          padding: "0.15rem 0.55rem",
                          borderRadius: 999,
                          backgroundColor: "rgba(15,23,42,0.03)",
                          border: "1px solid rgba(148,163,184,0.5)",
                          color: "#4b5563",
                        }}
                      >
                        Next review: <strong>{label}</strong>
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "#9ca3af",
                    }}
                  >
                    View →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

export default function DeckListPage() {
  return (
    <RequireAuth>
      <AppLayout>
        <DeckListInner />
      </AppLayout>
    </RequireAuth>
  );
}
