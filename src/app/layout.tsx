import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Millenium Financeiro",
  description: "Sistema de gestão financeira e administrativa - Millenium Desentupidora",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
