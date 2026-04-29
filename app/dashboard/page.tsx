"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GameCard from "@/components/library/GameCard";

interface Game {
  id: string;
  title: string;
  game_type: string;
  created_at: string;
  is_public: boolean;
}

export default function DashboardPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadGames() {
      try {
        const res = await fetch("/api/games");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load games");
        setGames(data.games ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load games");
      } finally {
        setLoading(false);
      }
    }
    loadGames();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="border-b border-stone-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight text-stone-900">
            Quest<span className="text-emerald-700">Forge</span>
          </Link>
          <Link
            href="/generate"
            className="text-sm font-semibold px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors"
          >
            New Game
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Your Library</h1>
            <p className="text-stone-500 mt-1 text-sm">All your generated games</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 bg-stone-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-stone-500 mb-4">{error}</p>
            <p className="text-sm text-stone-400">
              Make sure your Supabase environment variables are configured.
            </p>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="font-semibold text-stone-900 mb-2">No games yet</h3>
            <p className="text-stone-500 text-sm mb-6">
              Create your first game to see it here.
            </p>
            <Link
              href="/generate"
              className="inline-block px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg text-sm"
            >
              Create a Game →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game) => (
              <GameCard
                key={game.id}
                id={game.id}
                title={game.title}
                gameType={game.game_type}
                createdAt={game.created_at}
                isPublic={game.is_public}
                onPlay={(id) => router.push(`/play/${id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
