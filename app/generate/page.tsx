"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import InputForm, { InputType } from "@/components/generate/InputForm";
import ProgressStepper, { Step } from "@/components/generate/ProgressStepper";
import GamePreviewCard from "@/components/generate/GamePreviewCard";
import { KnowledgeGraph, GameSpec } from "@/lib/schemas";

export default function GeneratePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | undefined>();
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeGraph | null>(null);
  const [gameSpec, setGameSpec] = useState<GameSpec | null>(null);
  const [savedApiKey, setSavedApiKey] = useState("");
  const [isBuilding, setIsBuilding] = useState(false);

  async function handleGenerate(type: InputType, content: string, apiKey: string) {
    setSavedApiKey(apiKey);
    setError(undefined);
    setKnowledgeGraph(null);
    setGameSpec(null);

    // Step 1: Analyze
    setStep("analyzing");
    let kg: KnowledgeGraph;
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, content, apiKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      kg = data.knowledgeGraph as KnowledgeGraph;
      setKnowledgeGraph(kg);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setStep("error");
      return;
    }

    // Step 2: Compose
    setStep("composing");
    let spec: GameSpec;
    try {
      const res = await fetch("/api/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ knowledgeGraph: kg }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Composition failed");
      spec = data.gameSpec as GameSpec;
      setGameSpec(spec);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Composition failed");
      setStep("error");
      return;
    }

    setStep("done");
  }

  async function handlePlay() {
    if (!gameSpec) return;
    setIsBuilding(true);
    setStep("generating");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameSpec, apiKey: savedApiKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Game generation failed");
      const html = data.html as string;
      const id = data.gameId as string | null;

      if (id) {
        router.push(`/play/${id}`);
      } else {
        // Store in sessionStorage and redirect
        sessionStorage.setItem("questforge_game_html", html);
        sessionStorage.setItem("questforge_game_title", gameSpec.theme.title);
        router.push("/play/preview");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Game generation failed");
      setStep("done");
    } finally {
      setIsBuilding(false);
    }
  }

  function handleRegenerate() {
    setStep("idle");
    setError(undefined);
    setKnowledgeGraph(null);
    setGameSpec(null);
  }

  const isLoading = step === "analyzing" || step === "composing" || step === "generating";

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="border-b border-stone-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight text-stone-900">
            Quest<span className="text-emerald-700">Forge</span>
          </Link>
          <Link href="/dashboard" className="text-sm text-stone-600 hover:text-stone-900 font-medium">
            Library
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900">Create a Game</h1>
          <p className="text-stone-500 mt-1 text-sm">
            Paste a URL or text — we&apos;ll build a playable game from the content.
          </p>
        </div>

        {step === "idle" || step === "error" ? (
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <InputForm onSubmit={handleGenerate} isLoading={isLoading} />
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white border border-stone-200 rounded-xl p-6">
              <ProgressStepper step={step} error={error} />
            </div>

            {gameSpec && step === "done" && knowledgeGraph && (
              <GamePreviewCard
                spec={gameSpec}
                sceneCount={gameSpec.scenes.length}
                factCount={knowledgeGraph.keyFacts.length}
                onPlay={handlePlay}
                onRegenerate={handleRegenerate}
                isGenerating={isBuilding}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
