"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import GameIframe from "@/components/play/GameIframe";

interface PlayClientProps {
  gameId: string;
}

export default function PlayClient({ gameId }: PlayClientProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [title, setTitle] = useState("QuestForge Game");
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (gameId === "preview") {
      // Load from sessionStorage — deferred to a microtask to avoid
      // synchronous setState-in-effect lint warning
      Promise.resolve().then(() => {
        const stored = sessionStorage.getItem("questforge_game_html");
        const storedTitle = sessionStorage.getItem("questforge_game_title");
        if (stored) {
          setHtml(stored);
          if (storedTitle) setTitle(storedTitle);
        } else {
          setError("No game found. Please generate a game first.");
        }
      });
      return;
    }

    // Load from API
    async function loadGame() {
      try {
        const res = await fetch(`/api/games/${gameId}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Game not found");
        }
        const data = await res.json();
        setHtml(data.html);
        setTitle(data.title ?? "QuestForge Game");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load game");
      }
    }

    loadGame();
  }, [gameId]);

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="border-b border-stone-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight text-stone-900">
            Quest<span className="text-emerald-700">Forge</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-stone-600 truncate max-w-xs hidden sm:block">
              {title}
            </span>
            <Link
              href="/generate"
              className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              New Game →
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 p-4 sm:p-6">
        {error ? (
          <div className="max-w-lg mx-auto mt-20 text-center">
            <p className="text-stone-600 mb-4">{error}</p>
            <Link
              href="/generate"
              className="inline-block px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg text-sm"
            >
              Create a Game
            </Link>
          </div>
        ) : html ? (
          <GameIframe html={html} title={title} />
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-stone-400 text-sm animate-pulse">Loading game…</div>
          </div>
        )}
      </main>
    </div>
  );
}
