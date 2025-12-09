import { FormEvent, useState } from "react";
import {
  apiCreateCard,
  apiCreateDeck,
  apiGenerateCards,
  type AIGeneratedCard,
} from "shared-api";
import { AppLayout } from "../src/components/AppLayout";
import { RequireAuth } from "../src/components/RequireAuth";
import { useAuth } from "../src/context/AuthContext";

function AIGeneratorInner() {
  const { token } = useAuth();
  const [text, setText] = useState("");
  const [cards, setCards] = useState<AIGeneratedCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deckTitle, setDeckTitle] = useState("");

  const hasCards = cards.length > 0;

  const onGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (text.trim().length < 20) {
      setError("Please paste at least a few sentences.");
      return;
    }

    setLoading(true);
    setError("");
    setCards([]);

    try {
      const res = await apiGenerateCards(token, {
        text: text.trim(),
        numCards: 10,
      });

      setCards(res.cards || []);
      if (!deckTitle) {
        setDeckTitle("AI deck – " + (text.slice(0, 40) + "..."));
      }
    } catch (e: any) {
      setError(e.message || "Failed to generate cards");
    } finally {
      setLoading(false);
    }
  };

  const onRemoveCard = (index: number) => {
    setCards((prev) => prev.filter((_, i) => i !== index));
  };

  const onSaveDeck = async () => {
    if (!token || !hasCards) return;
    setSaving(true);
    setError("");

    try {
      const title = deckTitle.trim() || "AI generated deck";
      const deck = await apiCreateDeck(token, title);

      // naive: create cards one by one
      for (const c of cards) {
        await apiCreateCard(token, {
          deckId: deck._id,
          front: c.front,
          back: c.back,
        });
      }

      alert("Deck saved! You can find it in My decks.");
      setCards([]);
      setText("");
    } catch (e: any) {
      setError(e.message || "Failed to save deck");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Hero heading similar vibe to examples */}
      <section style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.4rem", marginBottom: "0.5rem" }}>
          Turn your notes into flashcards in seconds
        </h1>
        <p style={{ color: "#555" }}>
          Paste your text or upload your slides, let AI create study-ready
          flashcards for you.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: "1.5rem",
          alignItems: "flex-start",
        }}
      >
        {/* Left: input */}
        <div
          style={{
            borderRadius: 24,
            padding: "1.5rem",
            background: "#ffffff",
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
          }}
        >
          <form onSubmit={onGenerate}>
            <label style={{ display: "block", marginBottom: "0.75rem" }}>
              <span style={{ fontWeight: 600, display: "block" }}>
                Paste your study material
              </span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                placeholder="Lecture notes, textbook paragraphs, bullet points..."
                style={{
                  width: "100%",
                  marginTop: "0.5rem",
                  borderRadius: 16,
                  border: "1px solid #d5d7e5",
                  padding: "0.75rem 1rem",
                  resize: "vertical",
                }}
              />
            </label>

            {/* Simple file input placeholder (you can wire it later) */}
            <div
              style={{
                border: "1px dashed #c0c2dd",
                borderRadius: 16,
                padding: "0.75rem 1rem",
                marginBottom: "1rem",
                background: "#fafbff",
                fontSize: "0.9rem",
              }}
            >
              <p style={{ marginBottom: "0.5rem" }}>
                <strong>Optional:</strong> Upload a PDF (not wired yet, text
                paste works for the demo).
              </p>
              <input type="file" disabled />
            </div>

            <label
              style={{
                display: "block",
                marginBottom: "0.75rem",
                fontSize: "0.9rem",
              }}
            >
              Deck title (for saving)
              <input
                type="text"
                value={deckTitle}
                onChange={(e) => setDeckTitle(e.target.value)}
                placeholder="AI deck – Biology Chapter 3"
                style={{
                  width: "100%",
                  marginTop: "0.25rem",
                  borderRadius: 999,
                  border: "1px solid #d5d7e5",
                  padding: "0.5rem 0.9rem",
                }}
              />
            </label>

            {error && (
              <p style={{ color: "red", marginBottom: "0.75rem" }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                borderRadius: 999,
                border: "none",
                padding: "0.9rem",
                fontSize: "1rem",
                fontWeight: 600,
                background: "#4f46e5",
                color: "#fff",
                cursor: "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Generating flashcards..." : "Generate flashcards"}
            </button>
          </form>
        </div>

        {/* Right: generated cards */}
        <div>
          <h2 style={{ marginBottom: "0.75rem" }}>Preview cards</h2>
          {!hasCards && !loading && (
            <p style={{ color: "#777", fontSize: "0.95rem" }}>
              Generated cards will appear here. You can remove any before saving
              them as a deck.
            </p>
          )}

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {cards.map((card, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: 16,
                  padding: "0.9rem 1rem",
                  background: "#ffffff",
                  border: "1px solid #e0e3f0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem",
                }}
              >
                <div style={{ fontWeight: 600 }}>{card.front}</div>
                <div style={{ fontSize: "0.9rem", color: "#444" }}>
                  {card.back}
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveCard(idx)}
                  style={{
                    alignSelf: "flex-start",
                    marginTop: "0.35rem",
                    borderRadius: 999,
                    border: "none",
                    padding: "0.25rem 0.7rem",
                    fontSize: "0.8rem",
                    background: "#fee2e2",
                    color: "#b91c1c",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {hasCards && (
            <button
              type="button"
              onClick={onSaveDeck}
              disabled={saving}
              style={{
                marginTop: "1rem",
                width: "100%",
                borderRadius: 999,
                border: "none",
                padding: "0.8rem",
                fontWeight: 600,
                background: "#16a34a",
                color: "#fff",
                cursor: "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Saving deck..." : `Save ${cards.length} cards to deck`}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

export default function AIGeneratorPage() {
  return (
    <RequireAuth>
      <AppLayout>
        <AIGeneratorInner />
      </AppLayout>
    </RequireAuth>
  );
}
