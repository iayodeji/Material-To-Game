"use client";

type Step = "idle" | "analyzing" | "composing" | "generating" | "done" | "error";

interface ProgressStepperProps {
  step: Step;
  error?: string;
}

const STEPS: { id: Step; label: string; description: string }[] = [
  { id: "analyzing", label: "Analyzing", description: "Extracting knowledge graph from your content" },
  { id: "composing", label: "Composing", description: "Designing your game structure and narrative" },
  { id: "generating", label: "Generating", description: "Building the playable HTML game" },
  { id: "done", label: "Ready!", description: "Your game is ready to play" },
];

function stepIndex(step: Step): number {
  if (step === "idle" || step === "error") return -1;
  return STEPS.findIndex((s) => s.id === step);
}

export default function ProgressStepper({ step, error }: ProgressStepperProps) {
  if (step === "idle") return null;

  const currentIdx = stepIndex(step);

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="flex items-start gap-3">
        {STEPS.map((s, idx) => {
          const isDone = step === "done" || (currentIdx > idx);
          const isCurrent = s.id === step;
          const isPending = currentIdx < idx && step !== "done";

          return (
            <div key={s.id} className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isDone
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-emerald-100 border-2 border-emerald-600 text-emerald-700 animate-pulse"
                      : isPending
                      ? "bg-stone-100 border-2 border-stone-300 text-stone-400"
                      : "bg-stone-100 border-2 border-stone-300 text-stone-400"
                  }`}
                >
                  {isDone ? "✓" : idx + 1}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isDone
                      ? "text-emerald-700"
                      : isCurrent
                      ? "text-stone-900"
                      : "text-stone-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {isCurrent && (
                <p className="text-xs text-stone-500 ml-8">{s.description}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type { Step };
