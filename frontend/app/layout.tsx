import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "URL Shortener - Raccourcisseur de liens",
  description: "Créez des liens courts et partageables à partir de vos URL longues avec notre application de raccourcissement de liens facile à utiliser. Simplifiez le partage de vos contenus en ligne dès aujourd'hui!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
