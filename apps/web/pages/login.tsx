// apps/web/pages/login.tsx
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "../src/components/ui/Button";
import { useAuth } from "../src/context/AuthContext";

export default function LoginPage() {
  const { login, loading, user } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("tugo@test.com");
  const [password, setPassword] = useState("Passw0rd!");
  const [error, setError] = useState("");

  // If already logged in → go to decks
  useEffect(() => {
    if (user) {
      router.replace("/decks");
    }
  }, [user, router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      router.push("/decks");
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500/30 via-sky-500/20 to-slate-950 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-slate-700/60 bg-slate-950/80 shadow-2xl shadow-indigo-500/40 backdrop-blur-xl p-6 md:p-8">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#4f46e5,#06b6d4,#a855f7,#4f46e5)]" />
            <span className="text-sm font-semibold text-slate-50">
              Minddeck
            </span>
          </div>
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-slate-200 hover:underline"
          >
            ← Back home
          </Link>
        </header>

        {/* Title */}
        <h1 className="text-xl font-bold text-slate-50 mb-1">Welcome back</h1>
        <p className="mb-5 text-sm text-slate-400">
          Log in to access your decks and keep your spaced‑repetition streak
          going.
        </p>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full text-sm"
            />
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <Button type="submit" disabled={loading} fullWidth className="mt-1">
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>

        {/* Footer */}
        <p className="mt-5 text-center text-xs text-slate-400">
          No account yet?{" "}
          <Link
            href="/register"
            className="text-indigo-400 hover:text-indigo-300"
          >
            Create one
          </Link>
        </p>

        <p className="mt-3 text-[11px] text-slate-500 text-center">
          Test account:{" "}
          <span className="font-mono">tugo@test.com / Passw0rd!</span>
        </p>
      </div>
    </div>
  );
}
