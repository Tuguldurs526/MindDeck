import type { AppProps } from "next/app";
import { AuthProvider } from "../src/context/AuthContext";
import "../src/styles/globals.css"; // or adjust if you use a different path

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
