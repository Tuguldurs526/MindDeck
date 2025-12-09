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

        // apiListCards already returns Card[]
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

  return (
    <main style={{ maxWidth: 720, margin: "2rem auto", padding: "1rem" }}>
      <button
        type="button"
        onClick={() => router.push("/decks")}
        style={{ marginBottom: "1rem" }}
      >
        ← Back to decks
      </button>

      <h1 style={{ fontSize: "1.8rem", marginBottom: "0.25rem" }}>
        {deck.title}
      </h1>
      <p style={{ marginBottom: "0.75rem", color: "#666" }}>
        {cardCount} card{cardCount === 1 ? "" : "s"}
      </p>

      <button
        type="button"
        style={{ marginBottom: "1.5rem" }}
        onClick={() => router.push(`/review/${deck._id}`)}
        disabled={cardCount === 0}
      >
        Start review
      </button>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: "1.5rem",
          alignItems: "flex-start",
        }}
      >
        {/* Cards list */}
        <div>
          <h2 style={{ marginBottom: "0.5rem" }}>Cards</h2>
          {cardCount === 0 ? (
            <p style={{ color: "#777" }}>No cards yet. Add your first one ➜</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {cards.map((card) => (
                <li
                  key={card._id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    padding: "0.75rem 1rem",
                    marginBottom: "0.5rem",
                    background: "#fff",
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{card.front}</div>
                  <div style={{ fontSize: "0.9rem", color: "#555" }}>
                    {card.back}
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteCard(card._id)}
                    style={{
                      marginTop: "0.5rem",
                      fontSize: "0.8rem",
                      background: "#fbe9e9",
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
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: "1rem",
            background: "#fff",
          }}
        >
          <h2 style={{ marginBottom: "0.5rem" }}>Add card</h2>
          <form onSubmit={onCreateCard}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Front
              <textarea
                value={front}
                onChange={(e) => setFront(e.target.value)}
                rows={3}
                style={{ width: "100%", marginTop: "0.25rem" }}
              />
            </label>
            <label style={{ display: "block", marginBottom: "0.75rem" }}>
              Back
              <textarea
                value={back}
                onChange={(e) => setBack(e.target.value)}
                rows={3}
                style={{ width: "100%", marginTop: "0.25rem" }}
              />
            </label>
            <button type="submit" disabled={saving}>
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
