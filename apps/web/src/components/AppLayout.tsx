// apps/web/src/components/AppLayout.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const onChange = () => setIsMobile(mq.matches);

    onChange();
    mq.addEventListener?.("change", onChange);

    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // Close menu when switching to desktop
  useEffect(() => {
    if (!isMobile) setMenuOpen(false);
  }, [isMobile]);

  const initials = useMemo(() => {
    return (
      user?.username?.[0]?.toUpperCase() ||
      user?.email?.[0]?.toUpperCase() ||
      "?"
    );
  }, [user?.username, user?.email]);

  const brand = (
    <Link
      href="/decks"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.55rem",
        textDecoration: "none",
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "999px",
          background:
            "conic-gradient(from 180deg at 50% 50%, #4f46e5, #06b6d4, #a855f7, #4f46e5)",
          flex: "0 0 auto",
        }}
      />
      <span
        style={{
          fontWeight: 700,
          fontSize: "1.2rem",
          color: "#111827",
          whiteSpace: "nowrap",
        }}
      >
        MINDDECK
      </span>
    </Link>
  );

  const pillLinkStyle = {
    textDecoration: "none",
    padding: "0.35rem 0.9rem",
    borderRadius: 999,
    background:
      "linear-gradient(135deg, #4f46e5 0%, #6366f1 40%, #22c55e 100%)",
    color: "white",
    border: "1px solid rgba(148,163,184,0.45)",
    backdropFilter: "blur(10px)",
    whiteSpace: "nowrap" as const,
    fontWeight: 500,
  };

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
            height: "100%",
          }}
        >
          {brand}

          {/* Desktop header */}
          {user && !isMobile && (
            <nav
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                fontSize: "0.9rem",
                color: "#0f172a",
                justifyContent: "flex-end",
              }}
            >
              <Link href="/ai" style={pillLinkStyle}>
                AI generator
              </Link>

              {/* Optional: hide "My decks" if already on /decks */}
              {pathname !== "/decks" && (
                <Link href="/decks" style={pillLinkStyle}>
                  My decks
                </Link>
              )}

              <div
                style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}
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
                    color: "#ffffff",
                    whiteSpace: "nowrap",
                  }}
                >
                  Logout
                </button>
              </div>
            </nav>
          )}

          {/* Mobile header */}
          {user && isMobile && (
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Open menu"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  border: "1px solid rgba(148,163,184,0.45)",
                  background: "rgba(255,255,255,0.9)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* simple hamburger */}
                <span style={{ display: "inline-block", width: 18 }}>
                  <span
                    style={{
                      display: "block",
                      height: 2,
                      background: "#111827",
                      margin: "3px 0",
                    }}
                  />
                  <span
                    style={{
                      display: "block",
                      height: 2,
                      background: "#111827",
                      margin: "3px 0",
                    }}
                  />
                  <span
                    style={{
                      display: "block",
                      height: 2,
                      background: "#111827",
                      margin: "3px 0",
                    }}
                  />
                </span>
              </button>

              {menuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: 52,
                    right: 0,
                    width: 240,
                    borderRadius: 14,
                    border: "1px solid rgba(148,163,184,0.35)",
                    background: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.15)",
                    padding: 10,
                  }}
                >
                  {/* User block */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "999px",
                        background:
                          "linear-gradient(135deg, #4f46e5, #a855f7, #06b6d4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        flex: "0 0 auto",
                      }}
                    >
                      {initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 700,
                          color: "#111827",
                        }}
                      >
                        {user.username || "User"}
                      </div>
                      <div
                        style={{
                          fontSize: "0.78rem",
                          color: "#6b7280",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={user.email}
                      >
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      height: 1,
                      background: "rgba(148,163,184,0.35)",
                      margin: "6px 0",
                    }}
                  />

                  {/* Links */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      padding: 6,
                    }}
                  >
                    <Link
                      href="/ai"
                      onClick={() => setMenuOpen(false)}
                      style={pillLinkStyle}
                    >
                      AI generator
                    </Link>
                    <Link
                      href="/decks"
                      onClick={() => setMenuOpen(false)}
                      style={pillLinkStyle}
                    >
                      My decks
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      style={{
                        borderRadius: 999,
                        padding: "0.35rem 0.9rem",
                        border: "1px solid rgba(148,163,184,0.5)",
                        background:
                          "linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #22c55e 100%)",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        color: "#ffffff",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main style={{ flex: 1, width: "100%", boxSizing: "border-box" }}>
        {children}
      </main>
    </div>
  );
}
