// packages/shared-api/src/client.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let msg = res.statusText;

    try {
      const body = (await res.json()) as any;
      if (body && typeof body.error === "string") {
        msg = body.error;
      }
    } catch {
      // ignore JSON parse error, keep statusText
    }

    throw new Error(msg || "Request failed");
  }

  return res.json() as Promise<T>;
}

// ------------ Auth ------------

export type ApiUser = {
  id: string;
  username: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  user: ApiUser;
};

export async function apiLogin(email: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(
  username: string,
  email: string,
  password: string,
) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

// ------------ Decks ------------

export type Deck = {
  _id: string;
  title: string;
  source?: "manual" | "ai"; // mark AI decks
  cardCount?: number; // number of cards in this deck (if backend sends it)
  createdAt: string;
  updatedAt: string;
};

type DeckListResponse = {
  items: Deck[];
};

export async function apiListDecks(token: string) {
  const res = await request<DeckListResponse | Deck[]>(
    "/decks",
    { method: "GET" },
    token,
  );

  if (Array.isArray(res)) {
    // backend returns bare array
    return res;
  }

  return Array.isArray(res.items) ? res.items : [];
}

export async function apiCreateDeck(token: string, title: string) {
  return request<Deck>(
    "/decks",
    {
      method: "POST",
      body: JSON.stringify({ title }),
    },
    token,
  );
}

export async function apiGetDeck(id: string, token: string) {
  return request<Deck>(`/decks/${id}`, { method: "GET" }, token);
}

// ------------ Cards ------------

export type Card = {
  _id: string;
  deck: string;
  front: string;
  back: string;
  createdAt: string;
  updatedAt: string;
  owner?: string;
  sm2?: any;
  source?: "manual" | "ai";
  cardCount?: number;
};

export async function apiListCards(token: string, deckId: string) {
  const cards = await request<Card[]>(
    `/cards/${deckId}`,
    { method: "GET" },
    token,
  );

  console.log("DEBUG apiListCards length =", cards.length, cards);
  return cards;
}

export async function apiCreateCard(
  token: string,
  payload: { deckId: string; front: string; back: string },
) {
  const created = await request<Card>(
    "/cards",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token,
  );

  console.log("DEBUG apiCreateCard created =", created);
  return created;
}

export async function apiUpdateCard(
  token: string,
  id: string,
  payload: { front?: string; back?: string },
) {
  return request<Card>(
    `/cards/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    token,
  );
}

export async function apiDeleteCard(token: string, id: string) {
  return request<{ success: boolean }>(
    `/cards/${id}`,
    {
      method: "DELETE",
    },
    token,
  );
}

// ------------ Reviews ------------

export type ReviewCard = {
  cardId?: string;
  _id?: string;
  id?: string;
  card?: string;
  deck?: string;
  deckId?: string;
  front: string;
  back: string;
};

export type ReviewQueueResponse = {
  items: ReviewCard[];
};

export async function apiGetReviewQueue(
  token: string,
  limit = 1,
  deckId?: string,
) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (deckId) params.set("deckId", deckId);

  const res = await request<ReviewQueueResponse | ReviewCard[]>(
    `/reviews/queue?${params.toString()}`,
    { method: "GET" },
    token,
  );

  if (Array.isArray(res)) {
    return { items: res };
  }

  if (res && Array.isArray((res as any).items)) {
    return res as ReviewQueueResponse;
  }

  return { items: [] };
}

export type ReviewAnswerPayload = {
  cardId: string;
  quality: 0 | 1 | 2 | 3;
};

export async function apiAnswerReview(
  token: string,
  payload: ReviewAnswerPayload,
) {
  return request<{ nextDue: string }>(
    "/reviews/answer",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token,
  );
}

// ------------ AI flashcard generation ------------

export type AIGeneratedCard = {
  front: string;
  back: string;
};

export type AIGenerateResponse = {
  cards: AIGeneratedCard[];
};

export async function apiGenerateCards(
  token: string,
  payload: { text: string; numCards?: number },
) {
  return request<AIGenerateResponse>(
    "/ai/generate",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token,
  );
}

/**
 * Upload PDF/DOCX and generate cards via /ai/upload
 */
export async function apiUploadAndGenerateCards(
  token: string,
  file: File,
  numCards = 10,
) {
  const form = new FormData();
  form.append("file", file);
  form.append("numCards", String(numCards));

  const res = await fetch(`${API_URL}/ai/upload`, {
    method: "POST",
    headers: {
      // IMPORTANT: do NOT set Content-Type manually here,
      // the browser will add the correct multipart boundary.
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!res.ok) {
    let msg = res.statusText;
    try {
      const body = (await res.json()) as any;
      if (body && typeof body.error === "string") {
        msg = body.error;
      }
    } catch {
      // ignore
    }
    throw new Error(msg || "Upload request failed");
  }

  return (await res.json()) as AIGenerateResponse;
}

export async function apiResetDeckReviews(token: string, deckId: string) {
  return request<{ reset: boolean; matched: number; modified: number }>(
    "/reviews/reset-deck",
    {
      method: "POST",
      body: JSON.stringify({ deckId }),
    },
    token,
  );
}
