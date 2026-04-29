"use client";

interface GameCardProps {
  id: string;
  title: string;
  gameType: string;
  createdAt: string;
  isPublic: boolean;
  onPlay: (id: string) => void;
}

const GAME_TYPE_ICONS: Record<string, string> = {
  rpg: "⚔️",
  "tower-defense": "🏰",
  puzzle: "🧩",
  platformer: "🎮",
  strategy: "🗺️",
  simulation: "🔬",
};

export default function GameCard({ id, title, gameType, createdAt, isPublic, onPlay }: GameCardProps) {
  const icon = GAME_TYPE_ICONS[gameType] ?? "🎲";
  const date = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="border border-stone-200 rounded-xl p-5 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-900 truncate">{title}</h3>
          <p className="text-xs text-stone-500 mt-0.5 capitalize">{gameType.replace("-", " ")} · {date}</p>
        </div>
        {isPublic && (
          <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full flex-shrink-0">
            Public
          </span>
        )}
      </div>
      <button
        onClick={() => onPlay(id)}
        className="mt-4 w-full py-2 text-sm font-medium text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
      >
        Play Again →
      </button>
    </div>
  );
}
