import { KnowledgeGraph, GameSpec, Scene } from "@/lib/schemas";

type GameType = GameSpec["gameType"];

interface ThemeRule {
  keywords: string[];
  gameType: GameType;
  palette: [string, string, string];
}

const THEME_RULES: ThemeRule[] = [
  {
    keywords: ["history", "war", "politics", "empire", "revolution", "cold war", "conflict", "military"],
    gameType: "strategy",
    palette: ["#2d3a1e", "#7a6a2a", "#c4a35a"],
  },
  {
    keywords: ["biology", "cell", "protein", "organism", "evolution", "genetics", "metabolism", "photosynthesis"],
    gameType: "tower-defense",
    palette: ["#1a3a1a", "#2d7a2d", "#6abf6a"],
  },
  {
    keywords: ["math", "mathematics", "logic", "algorithm", "proof", "theorem", "geometry", "calculus"],
    gameType: "puzzle",
    palette: ["#1a1a3a", "#2d2d7a", "#6a6abf"],
  },
  {
    keywords: ["physics", "chemistry", "reaction", "energy", "force", "wave", "particle", "thermodynamics"],
    gameType: "simulation",
    palette: ["#3a1a1a", "#7a2d2d", "#bf6a6a"],
  },
  {
    keywords: ["story", "biography", "journey", "life", "narrative", "adventure", "travel", "timeline"],
    gameType: "platformer",
    palette: ["#3a2a1a", "#7a5a2a", "#c49a5a"],
  },
];

const DEFAULT_GAME_TYPE: GameType = "rpg";
const DEFAULT_PALETTE: [string, string, string] = ["#1a1a2e", "#16213e", "#7b2d8b"];

function detectGameType(domain: string): { gameType: GameType; palette: [string, string, string] } {
  const lowerDomain = domain.toLowerCase();
  for (const rule of THEME_RULES) {
    if (rule.keywords.some((kw) => lowerDomain.includes(kw))) {
      return { gameType: rule.gameType, palette: rule.palette };
    }
  }
  return { gameType: DEFAULT_GAME_TYPE, palette: DEFAULT_PALETTE };
}

function buildThemeTitle(graph: KnowledgeGraph, gameType: GameType): string {
  const titles: Record<GameType, string> = {
    rpg: `${graph.title}: Dungeon of Knowledge`,
    "tower-defense": `${graph.title}: Cellular Defense`,
    puzzle: `${graph.title}: The Logic Labyrinth`,
    platformer: `${graph.title}: Journey Through Time`,
    strategy: `${graph.title}: The Strategic Chronicles`,
    simulation: `${graph.title}: Simulation Protocol`,
  };
  return titles[gameType] ?? `${graph.title}: The Quest`;
}

function buildProtagonist(graph: KnowledgeGraph): string {
  const persons = graph.entities.filter((e) => e.type === "person");
  if (persons.length > 0) return `Scholar ${persons[0].name}`;
  return "The Seeker";
}

function buildAntagonist(graph: KnowledgeGraph): string {
  const critical = graph.concepts.find((c) => c.importance === "critical");
  if (critical) return `The Ignorance of ${critical.label}`;
  return "The Void of Unknowing";
}

function buildSetting(graph: KnowledgeGraph, gameType: GameType): string {
  const settings: Record<GameType, string> = {
    rpg: `The dungeon of ${graph.domain}, where knowledge is locked behind ancient doors`,
    "tower-defense": `The microscopic world of ${graph.domain}, under constant attack from invaders`,
    puzzle: `The crystalline logic maze of ${graph.domain}`,
    platformer: `The landscape of ${graph.domain}, stretching across time`,
    strategy: `The contested territories of ${graph.domain}`,
    simulation: `A simulated ${graph.domain} universe`,
  };
  return settings[gameType] ?? `The realm of ${graph.domain}`;
}

function conceptToMechanic(importance: string): Scene["mechanic"] {
  if (importance === "critical") return "quiz-combat";
  if (importance === "supporting") return "dialogue";
  return "exploration";
}

function buildSceneContent(concept: KnowledgeGraph["concepts"][0], graph: KnowledgeGraph): string {
  const relatedFacts = graph.keyFacts.filter((f) => f.conceptIds.includes(concept.id));
  const factText = relatedFacts.length > 0 ? ` Key insight: ${relatedFacts[0].claim}` : "";
  return `${concept.definition}${factText}`;
}

function buildWinCondition(mechanic: Scene["mechanic"]): string {
  const conditions: Record<Scene["mechanic"], string> = {
    "quiz-combat": "Answer the challenge question correctly to defeat the guardian",
    dialogue: "Absorb the knowledge presented in the dialogue",
    puzzle: "Solve the arrangement puzzle to unlock the next chamber",
    exploration: "Discover all knowledge fragments hidden in this area",
    cutscene: "Watch the narrative unfold",
  };
  return conditions[mechanic];
}

export function composeGameSpec(graph: KnowledgeGraph): GameSpec {
  const { gameType, palette } = detectGameType(graph.domain);

  // Sort concepts: critical first, then supporting, then context
  const sortedConcepts = [...graph.concepts].sort((a, b) => {
    const order = { critical: 0, supporting: 1, context: 2 };
    return order[a.importance] - order[b.importance];
  });

  const scenes: Scene[] = sortedConcepts.map((concept, index) => {
    const mechanic = conceptToMechanic(concept.importance);
    return {
      id: `scene_${index + 1}_${concept.id}`,
      name: concept.label,
      conceptId: concept.id,
      mechanic,
      content: buildSceneContent(concept, graph),
      winCondition: buildWinCondition(mechanic),
      failCondition: "Review the material and try again",
    };
  });

  // Add a final boss cutscene that summarizes everything
  const criticalConcept = graph.concepts.find((c) => c.importance === "critical");
  const finalBossId = criticalConcept ? `scene_final_${criticalConcept.id}` : "scene_final_boss";

  if (criticalConcept) {
    scenes.push({
      id: finalBossId,
      name: `Final Challenge: ${criticalConcept.label}`,
      conceptId: criticalConcept.id,
      mechanic: "quiz-combat",
      content: `The final test of your understanding: ${criticalConcept.definition}`,
      winCondition: "Demonstrate complete mastery of the subject",
      failCondition: "Return to the beginning and retrace your steps",
    });
  }

  const sceneOrder = scenes.map((s) => s.id);

  return {
    gameType,
    theme: {
      title: buildThemeTitle(graph, gameType),
      setting: buildSetting(graph, gameType),
      palette: palette as [string, string, string],
      protagonist: buildProtagonist(graph),
      antagonist: buildAntagonist(graph),
    },
    scenes,
    progression: {
      order: sceneOrder,
      finalBoss: finalBossId,
    },
    assets: {
      cssTheme: `Primary: ${palette[0]}, Secondary: ${palette[1]}, Accent: ${palette[2]}`,
      characterSprites: "ASCII-art style pixel characters with CSS box-shadow effects",
      soundDesign: "8-bit chiptune ambience with combat sound effect descriptions",
    },
  };
}
