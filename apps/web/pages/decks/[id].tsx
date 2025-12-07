import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { apiGetDeck, type Deck } from "shared-api";
import { RequireAuth } from "../../src/components/RequireAuth";
import { useAuth } from "../../src/context/AuthContext";

function DeckDetailInner() {
  const router = useRouter();
  const { id } = router.query;
  const { token } = useAuth();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || typeof id !== "string" || !token) return;
    const run = async () => {
      try {
        const d = await apiGetDeck(id, token);
        setDeck(d);
      } catch (e: any) {
        setError(e.message || "Failed to load deck");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id, token]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!deck) return <p>Deck not found</p>;

  return (
    <main style={{ maxWidth: 640, margin: "2rem auto", padding: "1rem" }}>
      <button onClick={() => router.back()}>&larr; Back</button>
      <h1>{deck.title}</h1>
      <p>Created: {new Date(deck.createdAt).toLocaleString()}</p>
      <p>Updated: {new Date(deck.updatedAt).toLocaleString()}</p>

      <button
        style={{ marginTop: "2rem" }}
        onClick={() => router.push(`/review/${deck._id}`)}
      >
        Start Review
      </button>
    </main>
  );
}

export default function DeckDetailPage() {
  return (
    <RequireAuth>
      <DeckDetailInner />
    </RequireAuth>
  );
}
