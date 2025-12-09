// apps/web/pages/decks/[id].tsx
import { useRouter } from "next/router";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  apiCreateCard,
  apiDeleteCard,
  apiGetDeck,
  apiListCards,
  type Card,
  type Deck,
} from "shared-api";
import { AppLayout } from "../../src/components/AppLayout";
import { RequireAuth } from "../../src/components/RequireAuth";
import { useAuth } from "../../src/context/AuthContext";

function DeckDetailInner() {
  const router = useRouter();
  const { id } = router.query;
  const { token } = useAuth();

  // Normalize deckId so we always have a string
  const deckId = useMemo(() => {
    if (typeof id === "string") return id;
    if (Array.isArray(id)) return id[0] ?? "";
    return "";
  }, [id]);

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token || !deckId) return;

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError("");

      try {
        const [deckRes, cardsRes] = await Promise.all([
          apiGetDeck(deckId, token),
          apiListCards(token, deckId),
        ]);

        if (cancelled) return;

        const safeCards = Array.isArray(cardsRes) ? cardsRes : [];

        setDeck(deckRes);
        setCards(safeCards);
      } catch (e: any) {
        if (!cancelled) {
          console.error("Error loading deck:", e);
          setError(e.message || "Failed to load deck");
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
  }, [deckId, token]);

  const onCreateCard = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !deckId) return;
    if (!front.trim() || !back.trim()) return;

    setSaving(true);
    setError("");

    try {
      const newCard = await apiCreateCard(token, {
        deckId,
        front: front.trim(),
        back: back.trim(),
      });

      setCards((prev) => [...prev, newCard]);
      setFront("");
      setBack("");
    } catch (e: any) {
      setError(e.message || "Failed to create card");
    } finally {
      setSaving(false);
    }
  };

  const onDeleteCard = async (cardId: string) => {
    if (!token) return;
    const ok = window.confirm("Delete this card?");
    if (!ok) return;

    try {
      await apiDeleteCard(token, cardId);
      setCards((prev) => prev.filter((c) => c._id !== cardId));
    } catch (e: any) {
      setError(e.message || "Failed to delete card");
    }
  };

  if (!deckId) {
    return <p style={{ padding: "2rem" }}>Missing deck id.</p>;
  }

  if (loading) return <p style={{ padding: "2rem" }}>Loading deck...</p>;
  if (error) return <p style={{ padding: "2rem", color: "red" }}>{error}</p>;
  if (!deck) return <p style={{ padding: "2rem" }}>Deck not found.</p>;

  const cardCount = cards.length;
  const isAIDeck = deck.source === "ai";

  return (
    <main
      style={{
        maxWidth: 960,
        margin: "2rem auto",
        padding: "1rem",
        color: "#0f172a", // ensure dark text by default
      }}
    >
      <button
        type="button"
        onClick={() => router.push("/decks")}
        style={{
          marginBottom: "1rem",
          padding: "0.4rem 0.9rem",
          borderRadius: 999,
          border: "1px solid rgba(148,163,184,0.6)",
          background: "rgba(255,255,255,0.9)",
          color: "#0f172a",
          fontSize: "0.9rem",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.3rem",
          cursor: "pointer",
        }}
      >
        <span>←</span>
        <span>Back to decks</span>
      </button>

      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "0.75rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.9rem",
              marginBottom: "0.35rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#0f172a", // title clearly visible
            }}
          >
            {deck.title}
            {isAIDeck && (
              <span
                style={{
                  fontSize: "0.75rem",
                  padding: "0.15rem 0.6rem",
                  borderRadius: 999,
                  background:
                    "linear-gradient(135deg, rgba(79,70,229,0.08), rgba(56,189,248,0.16))",
                  border: "1px solid rgba(129,140,248,0.6)",
                  color: "#4f46e5",
                  fontWeight: 600,
                }}
              >
                AI deck
              </span>
            )}
          </h1>
          <p
            style={{
              marginBottom: 0,
              color: "#64748b",
              fontSize: "0.95rem",
            }}
          >
            {cardCount} card{cardCount === 1 ? "" : "s"}
          </p>
        </div>

        <button
          type="button"
          style={{
            marginBottom: "0.25rem",
            borderRadius: 999,
            padding: "0.5rem 1.2rem",
            border: "none",
            background:
              cardCount === 0
                ? "rgba(148,163,184,0.3)"
                : "linear-gradient(135deg, #4f46e5, #6366f1)",
            color: cardCount === 0 ? "#475569" : "#ffffff",
            fontWeight: 600,
            cursor: cardCount === 0 ? "default" : "pointer",
            boxShadow:
              cardCount === 0 ? "none" : "0 14px 30px rgba(79,70,229,0.35)",
          }}
          onClick={() => {
            if (cardCount > 0) router.push(`/review/${deck._id}`);
          }}
          disabled={cardCount === 0}
        >
          {cardCount === 0 ? "Add cards to start review" : "Start review"}
        </button>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
          gap: "1.5rem",
          alignItems: "flex-start",
        }}
      >
        {/* Cards list */}
        <div>
          <h2
            style={{
              marginBottom: "0.5rem",
              fontSize: "1.05rem",
              color: "#0f172a",
            }}
          >
            Cards
          </h2>
          {cardCount === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
              No cards yet. Add your first one on the right →
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {cards.map((card) => (
                <li
                  key={card._id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: "0.9rem 1rem",
                    marginBottom: "0.6rem",
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.95))",
                    boxShadow: "0 6px 16px rgba(15,23,42,0.05)",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      marginBottom: "0.25rem",
                      color: "#0f172a", // front/question text visible
                    }}
                  >
                    {card.front}
                  </div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "#475569",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {card.back}
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteCard(card._id)}
                    style={{
                      marginTop: "0.5rem",
                      fontSize: "0.8rem",
                      borderRadius: 999,
                      border: "none",
                      padding: "0.25rem 0.7rem",
                      background: "rgba(248,113,113,0.12)",
                      color: "#b91c1c",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* New card form */}
        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: "1.1rem",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(241,245,249,0.96))",
            boxShadow: "0 10px 28px rgba(15,23,42,0.08)",
          }}
        >
          <h2
            style={{
              marginBottom: "0.5rem",
              fontSize: "1.05rem",
              color: "#0f172a",
            }}
          >
            Add card
          </h2>
          <form onSubmit={onCreateCard}>
            <label
              style={{
                display: "block",
                marginBottom: "0.6rem",
                fontSize: "0.85rem",
                color: "#475569",
              }}
            >
              Front
              <textarea
                value={front}
                onChange={(e) => setFront(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  marginTop: "0.25rem",
                  borderRadius: 8,
                  border: "1px solid #cbd5f5",
                  padding: "0.45rem 0.6rem",
                  fontSize: "0.9rem",
                  resize: "vertical",
                  color: "#0f172a",
                  backgroundColor: "rgba(255,255,255,0.95)",
                }}
              />
            </label>
            <label
              style={{
                display: "block",
                marginBottom: "0.9rem",
                fontSize: "0.85rem",
                color: "#475569",
              }}
            >
              Back
              <textarea
                value={back}
                onChange={(e) => setBack(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  marginTop: "0.25rem",
                  borderRadius: 8,
                  border: "1px solid #cbd5f5",
                  padding: "0.45rem 0.6rem",
                  fontSize: "0.9rem",
                  resize: "vertical",
                  color: "#0f172a",
                  backgroundColor: "rgba(255,255,255,0.95)",
                }}
              />
            </label>
            {error && (
              <p
                style={{
                  color: "red",
                  fontSize: "0.8rem",
                  marginBottom: "0.4rem",
                }}
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={saving}
              style={{
                borderRadius: 999,
                padding: "0.5rem 1.2rem",
                border: "none",
                background: saving
                  ? "rgba(148,163,184,0.7)"
                  : "linear-gradient(135deg, #22c55e, #4ade80)",
                color: "#ffffff",
                fontWeight: 600,
                cursor: saving ? "default" : "pointer",
              }}
            >
              {saving ? "Saving..." : "Add card"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default function DeckDetailPage() {
  return (
    <RequireAuth>
      <AppLayout>
        <DeckDetailInner />
      </AppLayout>
    </RequireAuth>
  );
}
