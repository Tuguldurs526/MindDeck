import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "../src/context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) router.replace("/decks");
    else router.replace("/login");
  }, [user, loading, router]);

  return <p>Redirecting...</p>;
}
