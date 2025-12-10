// apps/web/src/components/AppLayout.tsx
import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  const initials =
    user?.username?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "?";

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, #a5b4fc 0, #e0f2fe 30%, #f5f3ff 70%, #f9fafb 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          height: 64,
          borderBottom: "1px solid rgba(148,163,184,0.35)",
          position: "sticky",
          top: 0,
          zIndex: 20,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          background: "rgba(255,255,255,0.85)",
        }}
      >
        {/* inner container for responsiveness */}
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            padding: "0 1rem",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
          }}
        >
          {/* Logo / brand */}
          <Link
            href="/decks"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.55rem",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "999px",
                background:
                  "conic-gradient(from 180deg at 50% 50%, #4f46e5, #06b6d4, #a855f7, #4f46e5)",
              }}
            />
            <span
              style={{
                fontWeight: 700,
                fontSize: "1.2rem",
                color: "#111827",
              }}
            >
              MINDDECK
            </span>
          </Link>

          {/* Nav when logged in */}
          {user && (
            <nav
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                fontSize: "0.9rem",
                color: "#0f172a",
                flexWrap: "wrap", // ✅ allow wrapping on small screens
                justifyContent: "flex-end",
              }}
            >
              <Link
                href="/ai"
                style={{
                  textDecoration: "none",
                  padding: "0.35rem 0.9rem",
                  borderRadius: 999,
                  background:
                    "linear-gradient(135deg, #4f46e5 0%, #6366f1 40%, #22c55e 100%)",
                  color: "white",
                  border: "1px solid rgba(148,163,184,0.45)",
                  backdropFilter: "blur(10px)",
                  whiteSpace: "nowrap",
                }}
              >
                AI generator
              </Link>

              <Link
                href="/decks"
                style={{
                  textDecoration: "none",
                  padding: "0.35rem 0.9rem",
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(135deg, #4f46e5 0%, #6366f1 40%, #22c55e 100%)",
                  color: "white",
                  fontWeight: 500,
                  boxShadow: "0 12px 25px rgba(79,70,229,0.35)",
                  whiteSpace: "nowrap",
                }}
              >
                My decks
              </Link>

              {/* User info */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "999px",
                    background:
                      "linear-gradient(135deg, #4f46e5, #a855f7, #06b6d4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  {initials}
                </div>
                <div style={{ lineHeight: 1.2 }}>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#111827",
                    }}
                  >
                    {user.username || "User"}
                  </div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "#6b7280",
                      maxWidth: 180,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={user.email}
                  >
                    {user.email}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  style={{
                    marginLeft: "0.5rem",
                    borderRadius: 999,
                    padding: "0.3rem 0.9rem",
                    border: "1px solid rgba(148,163,184,0.5)",
                    background:
                      "linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #22c55e 100%)",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    color: "#ffffff", // ✅ ensure readable on bright bg
                    whiteSpace: "nowrap",
                  }}
                >
                  Logout
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Content */}
      <main
        style={{
          flex: 1,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {children}
      </main>
    </div>
  );
}
