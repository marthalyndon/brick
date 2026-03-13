import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brick — Triathlon Training",
  description: "Structured triathlon training app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-zinc-900">
        {children}
      </body>
    </html>
  );
}
