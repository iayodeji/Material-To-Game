"use client";

import { GameSpec } from "@/lib/schemas";

interface GamePreviewCardProps {
  spec: GameSpec;
  sceneCount: number;
  factCount: number;
  onPlay: () => void;
  onRegenerate: () => void;
  isGenerating: boolean;
}

const GAME_TYPE_LABELS: Record<string, string> = {
  rpg: "Dungeon Crawler RPG",
  "tower-defense": "Tower Defense",
  puzzle: "Puzzle Game",
  platformer: "Platformer",
  strategy: "Strategy RPG",
  simulation: "Simulation",
};

export default function GamePreviewCard({
  spec,
  sceneCount,
  factCount,
  onPlay,
  onRegenerate,
  isGenerating,
}: GamePreviewCardProps) {
  return (
    <div className="border border-stone-200 rounded-xl p-6 bg-stone-50 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full mb-2">
            {GAME_TYPE_LABELS[spec.gameType] ?? spec.gameType}
          </span>
          <h3 className="text-lg font-semibold text-stone-900">{spec.theme.title}</h3>
          <p className="text-sm text-stone-600 mt-1">{spec.theme.setting}</p>
        </div>

        <div className="flex gap-1 flex-shrink-0">
          {spec.theme.palette.map((color, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-full border border-white shadow-sm"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-white rounded-lg p-3 border border-stone-200">
          <div className="text-2xl font-bold text-emerald-700">{sceneCount}</div>
          <div className="text-xs text-stone-500 mt-0.5">Quests</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-stone-200">
          <div className="text-2xl font-bold text-emerald-700">{factCount}</div>
          <div className="text-xs text-stone-500 mt-0.5">Facts</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-stone-200">
          <div className="text-2xl font-bold text-emerald-700">
            {spec.scenes.filter((s) => s.mechanic === "quiz-combat").length}
          </div>
          <div className="text-xs text-stone-500 mt-0.5">Challenges</div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onPlay}
          disabled={isGenerating}
          className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-colors"
        >
          {isGenerating ? "Building game…" : "Play Game →"}
        </button>
        <button
          onClick={onRegenerate}
          disabled={isGenerating}
          className="px-4 py-2.5 border border-stone-300 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed text-stone-700 font-medium rounded-lg text-sm transition-colors"
        >
          Regenerate
        </button>
      </div>
    </div>
  );
}
