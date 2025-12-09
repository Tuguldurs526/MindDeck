// apps/web/src/components/AppLayout.tsx
import Link from "next/link";
import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6fb" }}>
      <header
        style={{
          height: 64,
          borderBottom: "1px solid #e3e4ee",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 2rem",
          background: "#ffffff",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Link href="/decks" style={{ fontWeight: 700, fontSize: "1.2rem" }}>
          Minddeck
        </Link>

        {user && (
          <nav style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <Link href="/ai">AI Generator</Link>
            <Link href="/decks">My decks</Link>
            <span style={{ fontSize: "0.9rem", color: "#555" }}>
              {user.username}
            </span>
            <button
              type="button"
              onClick={logout}
              style={{
                borderRadius: 999,
                padding: "0.3rem 0.9rem",
                border: "1px solid #e0e0e0",
                background: "#f7f7f7",
              }}
            >
              Logout
            </button>
          </nav>
        )}
      </header>

      <main style={{ maxWidth: 960, margin: "2rem auto", padding: "0 1rem" }}>
        {children}
      </main>
    </div>
  );
}
