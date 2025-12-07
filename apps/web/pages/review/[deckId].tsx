import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  apiAnswerReview,
  apiGetReviewQueue,
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

  const loadNext = async () => {
    if (!token || typeof deckId !== "string") return;
    setLoading(true);
    setError("");
    setShowBack(false);
    try {
      // you might filter by deck server-side, or just get global queue
      const res = await apiGetReviewQueue(token, 1);
      const next = res.items[0];
      if (!next) {
        setDone(true);
        setCard(null);
      } else {
        setCard(next);
      }
    } catch (e: any) {
      setError(e.message || "Failed to load review queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId, token]);

  const answer = async (quality: 0 | 1 | 2 | 3) => {
    if (!token || !card) return;
    try {
      await apiAnswerReview(token, { cardId: card.cardId, quality });
      await loadNext();
    } catch (e: any) {
      setError(e.message || "Failed to submit answer");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (done) return <p>No more cards to review 🎉</p>;
  if (!card) return <p>No card</p>;

  return (
    <main style={{ maxWidth: 640, margin: "2rem auto", padding: "1rem" }}>
      <button onClick={() => router.back()}>&larr; Back</button>
      <h1>Review</h1>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 8,
          padding: "2rem",
          marginTop: "1rem",
        }}
      >
        <p>
          <strong>Q:</strong> {card.front}
        </p>
        {showBack && (
          <p style={{ marginTop: "1rem" }}>
            <strong>A:</strong> {card.back}
          </p>
        )}
      </div>

      {!showBack ? (
        <button style={{ marginTop: "1rem" }} onClick={() => setShowBack(true)}>
          Show answer
        </button>
      ) : (
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
          <button onClick={() => answer(0)}>Again</button>
          <button onClick={() => answer(1)}>Hard</button>
          <button onClick={() => answer(2)}>Good</button>
          <button onClick={() => answer(3)}>Easy</button>
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
