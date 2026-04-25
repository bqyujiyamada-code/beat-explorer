import type { Metadata } from "next";
import { NextAuthProvider } from "@/components/NextAuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beat Explorer",
  description: "AI-powered music recommendation app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        {/* NextAuthProviderでchildrenを囲むのがポイントです */}
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
