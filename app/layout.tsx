import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Uzum mobil clon — mobil do‘kon",
  description: "O‘zbek tilidagi mobil marketplace demo: katalog, savat, buyurtmalar va admin panel.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className="antialiased">{children}</body>
    </html>
  );
}
