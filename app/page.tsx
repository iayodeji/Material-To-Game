import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* Nav */}
      <nav className="border-b border-stone-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="font-bold text-xl tracking-tight text-stone-900">
            Quest<span className="text-emerald-700">Forge</span>
          </span>
          <Link
            href="/dashboard"
            className="text-sm text-stone-600 hover:text-stone-900 font-medium"
          >
            Library
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="max-w-2xl w-full text-center space-y-6">
          <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
            Turn any content into a game · Under 60 seconds
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-stone-900 leading-tight">
            Learn anything by{" "}
            <span className="text-emerald-700">playing a game</span>
          </h1>

          <p className="text-lg text-stone-600 max-w-xl mx-auto">
            Paste a Wikipedia URL, an article, or your study notes. QuestForge
            extracts the key concepts and generates a fully playable HTML game
            in seconds.
          </p>

          <Link
            href="/generate"
            className="inline-block px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-base transition-colors shadow-sm"
          >
            Create Your Game →
          </Link>
        </div>

        {/* Feature grid */}
        <div className="mt-20 max-w-3xl w-full grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: "🔗",
              title: "Paste Any URL",
              desc: "Wikipedia, arXiv, news articles, blog posts — we extract the content.",
            },
            {
              icon: "🧠",
              title: "AI Knowledge Graph",
              desc: "Concepts, facts, and causal chains are extracted and structured.",
            },
            {
              icon: "🎮",
              title: "Playable in Seconds",
              desc: "A complete RPG, puzzle, or strategy game built from your content.",
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-white border border-stone-200 rounded-xl p-5 text-left"
            >
              <div className="text-2xl mb-3">{icon}</div>
              <h3 className="font-semibold text-stone-900 mb-1">{title}</h3>
              <p className="text-sm text-stone-600">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-400">
        QuestForge — Powered by Anthropic Claude
      </footer>
    </div>
  );
}
