// apps/web/pages/_app.tsx
import type { AppProps } from "next/app";
import { AuthProvider } from "../src/context/AuthContext";
import "../src/styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
