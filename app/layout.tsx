import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuestForge — Turn Any Content into a Playable Game",
  description:
    "Paste a URL or text and QuestForge generates a fully playable HTML game from the content in under 60 seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900 font-sans">
        {children}
      </body>
    </html>
  );
}
