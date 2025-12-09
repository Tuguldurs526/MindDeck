// apps/web/pages/review/[deckId].tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  apiAnswerReview,
  apiGetReviewQueue,
  apiResetDeckReviews,
  type ReviewCard,
} from "shared-api";
import { RequireAuth } from "../../src/components/RequireAuth";
import { useAuth } from "../../src/context/AuthContext";

function ReviewInner() {
  const router = useRouter();
  const { deckId } = router.query;
  const { token } = useAuth();

  const [card, setCard] = useState<ReviewCard | null>(null);
  const [showBack, setShowBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [resetting, setResetting] = useState(false);

  // normalize deck id
  const deckIdStr = typeof deckId === "string" ? deckId : "";

  const loadNext = async () => {
    if (!token || !deckIdStr) return;

    setLoading(true);
    setError("");
    setShowBack(false);

    try {
      const res = await apiGetReviewQueue(token, 1, deckIdStr);
      const next = res.items[0];

      if (!next) {
        setDone(true);
        setCard(null);
      } else {
        setDone(false);
        setCard(next);
      }
    } catch (e: any) {
      setError(e.message || "Failed to load review queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !deckIdStr) return;
    loadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, deckIdStr]);

  const answer = async (quality: 0 | 1 | 2 | 3) => {
    if (!token || !card) return;

    const cardId =
      (card as any).cardId ??
      (card as any)._id ??
      (card as any).id ??
      (card as any).card;

    if (!cardId) {
      setError("Could not determine card id for review card");
      return;
    }

    try {
      await apiAnswerReview(token, {
        cardId,
        quality,
      });
      await loadNext();
    } catch (e: any) {
      setError(e.message || "Failed to submit answer");
    }
  };

  const onResetDeck = async () => {
    if (!token || !deckIdStr) return;
    setError("");
    setResetting(true);
    try {
      await apiResetDeckReviews(token, deckIdStr);
      setDone(false);
      await loadNext();
    } catch (e: any) {
      setError(e.message || "Failed to reset deck reviews");
    } finally {
      setResetting(false);
    }
  };

  if (!deckIdStr) {
    return <p style={{ padding: "2rem" }}>Missing deck id.</p>;
  }

  if (loading) return <p style={{ padding: "2rem" }}>Loading...</p>;

  if (error)
    return (
      <main style={{ maxWidth: 640, margin: "2rem auto", padding: "1rem" }}>
        <button
          type="button"
          onClick={() => router.push(`/decks/${deckIdStr}`)}
          style={{
            marginBottom: "1rem",
            color: "#111827",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          ← Back to deck
        </button>
        <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>
        <button type="button" onClick={loadNext}>
          Retry
        </button>
      </main>
    );

  if (done)
    return (
      <main style={{ maxWidth: 640, margin: "2rem auto", padding: "1rem" }}>
        <button
          type="button"
          onClick={() => router.push(`/decks/${deckIdStr}`)}
          style={{
            marginBottom: "1rem",
            color: "#111827",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          ← Back to deck
        </button>
        <h1>All done 🎉</h1>
        <p>No more cards to review in this deck right now.</p>
        <button
          type="button"
          onClick={onResetDeck}
          disabled={resetting}
          style={{
            marginTop: "1rem",
            padding: "0.6rem 1.2rem",
            borderRadius: 999,
            border: "1px solid #e5e7eb",
            background:
              "linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #22c55e 100%)",
          }}
        >
          {resetting ? "Resetting..." : "Review this deck again now"}
        </button>
      </main>
    );

  if (!card) return <p style={{ padding: "2rem" }}>No card.</p>;

  return (
    <main style={{ maxWidth: 640, margin: "2rem auto", padding: "1rem" }}>
      <button
        type="button"
        onClick={() => router.push("/decks")}
        style={{
          marginBottom: "1rem",
          padding: "0.35rem 0.85rem",
          borderRadius: 999,
          border: "1px solid #e5e7eb",
          backgroundColor: "#f9fafb",
          color: "#111827",
          cursor: "pointer",
          fontSize: "0.85rem",
        }}
      >
        ← Back to decks
      </button>

      <h1 style={{ marginBottom: "1rem" }}>Review</h1>

      <div
        style={{
          borderRadius: 12,
          padding: "2rem",
          border: "1px solid #ddd",
          background: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
          minHeight: 160,
        }}
      >
        <p style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
          <strong>Q:</strong> {card.front}
        </p>

        {showBack && (
          <p style={{ fontSize: "1rem", color: "#333" }}>
            <strong>A:</strong> {card.back}
          </p>
        )}
      </div>

      {!showBack ? (
        <button
          type="button"
          style={{ marginTop: "1rem" }}
          onClick={() => setShowBack(true)}
        >
          Show answer
        </button>
      ) : (
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <button type="button" onClick={() => answer(0)}>
            Again
          </button>
          <button type="button" onClick={() => answer(1)}>
            Hard
          </button>
          <button type="button" onClick={() => answer(2)}>
            Good
          </button>
          <button type="button" onClick={() => answer(3)}>
            Easy
          </button>
        </div>
      )}
    </main>
  );
}

export default function ReviewPage() {
  return (
    <RequireAuth>
      <ReviewInner />
    </RequireAuth>
  );
}
