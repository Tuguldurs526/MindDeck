// apps/web/pages/ai.tsx
import { FormEvent, useState } from "react";
import {
  apiCreateCard,
  apiCreateDeck,
  apiGenerateCards,
  apiUploadAndGenerateCards,
  type AIGeneratedCard,
} from "shared-api";
import { AppLayout } from "../src/components/AppLayout";
import { RequireAuth } from "../src/components/RequireAuth";
import { useAuth } from "../src/context/AuthContext";

function AIGeneratorInner() {
  const { token } = useAuth();

  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [numCards, setNumCards] = useState(10);

  const [generated, setGenerated] = useState<AIGeneratedCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [deckTitle, setDeckTitle] = useState("AI deck");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const canGenerate =
    !!token && ((text.trim().length >= 20 && !file) || !!file);

  const onGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError("");
    setSaveMessage("");
    setGenerated([]);
    setLoading(true);

    try {
      let res;
      if (file) {
        // PDF/DOCX path
        res = await apiUploadAndGenerateCards(token, file, numCards);
      } else {
        // Text path
        res = await apiGenerateCards(token, {
          text: text.trim(),
          numCards,
        });
      }

      const cards = Array.isArray(res.cards) ? res.cards : [];
      if (!cards.length) {
        setError("AI did not return any cards. Try a different input.");
      }
      setGenerated(cards);
    } catch (err: any) {
      setError(err.message || "Failed to generate cards");
    } finally {
      setLoading(false);
    }
  };

  const onRemoveCard = (index: number) => {
    setGenerated((prev) => prev.filter((_, i) => i !== index));
  };

  const onSaveToDeck = async () => {
    if (!token) return;
    if (!generated.length) {
      setError("No cards to save.");
      return;
    }

    setSaving(true);
    setError("");
    setSaveMessage("");

    try {
      const title = deckTitle.trim() || "AI deck";
      const deck = await apiCreateDeck(token, title);

      for (const c of generated) {
        await apiCreateCard(token, {
          deckId: deck._id,
          front: c.front,
          back: c.back,
        });
      }

      setSaveMessage(
        `Saved ${generated.length} cards to deck "${deck.title}".`,
      );
    } catch (err: any) {
      setError(err.message || "Failed to save cards to deck");
    } finally {
      setSaving(false);
    }
  };

  const cardsCount = generated.length;

  return (
    <AppLayout>
      <main
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1.1fr)",
          gap: "1.5rem",
          alignItems: "flex-start",
        }}
      >
        {/* Left: input (text + file) */}
        <section>
          <h1
            style={{
              fontSize: "1.8rem",
              marginBottom: "0.5rem",
            }}
          >
            AI flashcard generator
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              color: "#64748b",
              marginBottom: "1rem",
            }}
          >
            Paste your notes or upload a PDF / DOCX. We&apos;ll generate
            flashcards that you can edit and save into a deck.
          </p>

          <form onSubmit={onGenerate}>
            <label
              style={{
                display: "block",
                marginBottom: "0.75rem",
                fontSize: "0.85rem",
                color: "#475569",
              }}
            >
              Study text
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                placeholder="Paste your lecture notes, summary, or textbook paragraphs..."
                style={{
                  width: "100%",
                  marginTop: "0.35rem",
                  borderRadius: 10,
                  border: "1px solid #cbd5f5",
                  padding: "0.6rem 0.7rem",
                  fontSize: "0.9rem",
                  resize: "vertical",
                  backgroundColor: file ? "#f9fafb" : "#ffffff",
                }}
                disabled={!!file}
              />
            </label>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              <div style={{ fontSize: "0.85rem", color: "#475569" }}>
                Or upload a file (PDF / DOCX)
              </div>
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file && (
                <p style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  Selected: <strong>{file.name}</strong>{" "}
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    style={{
                      marginLeft: "0.5rem",
                      border: "none",
                      background: "transparent",
                      color: "#ef4444",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                    }}
                  >
                    Clear file
                  </button>
                </p>
              )}
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.9rem",
                fontSize: "0.85rem",
                color: "#475569",
              }}
            >
              Number of cards
              <input
                type="number"
                min={1}
                max={30}
                value={numCards}
                onChange={(e) =>
                  setNumCards(
                    Math.min(30, Math.max(1, Number(e.target.value) || 1)),
                  )
                }
                style={{
                  width: 70,
                  borderRadius: 999,
                  border: "1px solid #cbd5f5",
                  padding: "0.2rem 0.5rem",
                  fontSize: "0.9rem",
                }}
              />
            </label>

            {error && (
              <p
                style={{
                  color: "red",
                  fontSize: "0.85rem",
                  marginBottom: "0.5rem",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!canGenerate || loading}
              style={{
                borderRadius: 999,
                padding: "0.6rem 1.4rem",
                border: "none",
                background: !canGenerate
                  ? "rgba(148,163,184,0.5)"
                  : "linear-gradient(135deg, #4f46e5, #6366f1)",
                color: "#ffffff",
                fontWeight: 600,
                cursor: !canGenerate || loading ? "default" : "pointer",
              }}
            >
              {loading ? "Generating..." : "Generate flashcards"}
            </button>
          </form>
        </section>

        {/* Right: generated cards + save */}
        <section>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
            Generated cards {cardsCount ? `(${cardsCount})` : ""}
          </h2>

          {loading && (
            <p
              style={{
                fontSize: "0.9rem",
                color: "#64748b",
                marginBottom: "0.75rem",
              }}
            >
              Thinking… building cards from your content.
            </p>
          )}

          {!loading && !cardsCount && (
            <p style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
              Cards will appear here after you generate them. You can remove any
              you don&apos;t like before saving to a deck.
            </p>
          )}

          {cardsCount > 0 && (
            <>
              <div
                style={{
                  maxHeight: 360,
                  overflowY: "auto",
                  marginBottom: "0.75rem",
                }}
              >
                {generated.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      padding: "0.85rem 1rem",
                      marginBottom: "0.5rem",
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(241,245,249,0.98))",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#94a3b8",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Card {i + 1}
                    </div>
                    <div
                      style={{
                        fontWeight: 600,
                        marginBottom: "0.25rem",
                      }}
                    >
                      Q: {c.front}
                    </div>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        color: "#475569",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      A: {c.back}
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveCard(i)}
                      style={{
                        marginTop: "0.4rem",
                        fontSize: "0.8rem",
                        borderRadius: 999,
                        border: "none",
                        padding: "0.25rem 0.7rem",
                        background: "rgba(248,113,113,0.12)",
                        color: "#b91c1c",
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div
                style={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  padding: "0.85rem 1rem",
                  background: "#ffffff",
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.6rem",
                    fontSize: "0.85rem",
                    color: "#475569",
                  }}
                >
                  Save to deck as
                  <input
                    type="text"
                    value={deckTitle}
                    onChange={(e) => setDeckTitle(e.target.value)}
                    style={{
                      width: "100%",
                      marginTop: "0.25rem",
                      borderRadius: 999,
                      border: "1px solid #cbd5f5",
                      padding: "0.4rem 0.7rem",
                      fontSize: "0.9rem",
                    }}
                    placeholder="AI deck"
                  />
                </label>

                {saveMessage && (
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "#16a34a",
                      marginBottom: "0.4rem",
                    }}
                  >
                    {saveMessage}
                  </p>
                )}

                <button
                  type="button"
                  disabled={saving || !cardsCount}
                  onClick={onSaveToDeck}
                  style={{
                    borderRadius: 999,
                    padding: "0.5rem 1.4rem",
                    border: "none",
                    background: saving
                      ? "rgba(148,163,184,0.7)"
                      : "linear-gradient(135deg, #22c55e, #4ade80)",
                    color: "#ffffff",
                    fontWeight: 600,
                    cursor: saving ? "default" : "pointer",
                  }}
                >
                  {saving
                    ? "Saving..."
                    : `Save ${cardsCount} card${cardsCount === 1 ? "" : "s"} to deck`}
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    </AppLayout>
  );
}

export default function AIGeneratorPage() {
  return (
    <RequireAuth>
      <AIGeneratorInner />
    </RequireAuth>
  );
}
