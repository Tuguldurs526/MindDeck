import Link from "next/link";
import { useEffect, useState } from "react";
import { apiListDecks, type Deck } from "shared-api";
import { RequireAuth } from "../../src/components/RequireAuth";
import { useAuth } from "../../src/context/AuthContext";

function DeckListInner() {
  const { token, user, logout } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await apiListDecks(token); // res: { items: Deck[] }
        const items = Array.isArray(res.items) ? res.items : [];
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
    <main style={{ maxWidth: 640, margin: "2rem auto", padding: "1rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Your Decks</h1>
        <div>
          <span style={{ marginRight: "1rem" }}>{user?.username}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      {loading && <p>Loading decks...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && decks.length === 0 && (
        <p>No decks yet. Create some via API or mobile.</p>
      )}

      {!loading && !error && decks.length > 0 && (
        <ul>
          {decks.map((d) => (
            <li key={d._id}>
              <Link href={`/decks/${d._id}`}>{d.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default function DeckListPage() {
  return (
    <RequireAuth>
      <DeckListInner />
    </RequireAuth>
  );
}
