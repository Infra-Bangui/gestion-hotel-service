import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Contrôle National Hôtelier — RCA v4",
  description:
    "Système national de contrôle hôtelier v4 — Ministère de la Sécurité Publique · Police Nationale",
  robots: { index: false, follow: false },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
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
