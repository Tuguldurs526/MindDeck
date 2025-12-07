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

// ---- Auth ----

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

// ---- Decks ----

export type Deck = {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

type DeckListResponse = {
  items: Deck[];
};

// Returns Deck[]
export async function apiListDecks(token: string): Promise<Deck[]> {
  const res = await request<DeckListResponse>(
    "/decks",
    { method: "GET" },
    token,
  );
  return Array.isArray(res.items) ? res.items : [];
}

export async function apiGetDeck(id: string, token: string) {
  return request<Deck>(`/decks/${id}`, { method: "GET" }, token);
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

// ---- Reviews ----

export type ReviewCard = {
  cardId: string;
  deckId: string;
  front: string;
  back: string;
};

export type ReviewQueueResponse = {
  items: ReviewCard[];
};

export async function apiGetReviewQueue(token: string, limit = 1) {
  return request<ReviewQueueResponse>(
    `/reviews/queue?limit=${limit}`,
    { method: "GET" },
    token,
  );
}

export async function apiAnswerReview(
  token: string,
  payload: { cardId: string; quality: 0 | 1 | 2 | 3 },
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
