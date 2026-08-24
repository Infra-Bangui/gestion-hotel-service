import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Contrôle National Hôtelier — RCA v2",
  description:
    "Système national de contrôle hôtelier v2 — Ministère de la Sécurité Publique · Police Nationale",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
