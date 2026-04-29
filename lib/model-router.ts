import { anthropicAdapter } from "./providers/anthropic";
import { ProviderAdapter, LLMRequest, LLMStreamResponse } from "./providers/types";
import { GameSpec } from "./schemas";

export type Provider = "anthropic";

export interface ModelConfig {
  provider: Provider;
  apiKey: string;
  model: string;
}

const ADAPTERS: Record<Provider, ProviderAdapter> = {
  anthropic: anthropicAdapter,
};

const GAME_GENERATION_SYSTEM_PROMPT = `You are a game developer specializing in creating self-contained HTML5 games.
Generate a complete, playable HTML game based on the provided GameSpec JSON.

STRICT REQUIREMENTS:
1. Output ONLY valid HTML — no markdown, no explanation, no code blocks
2. The HTML must be fully self-contained (no external dependencies, no CDN links, no network requests)
3. Use only vanilla JavaScript and CSS (no frameworks, no libraries)
4. Must work inside a sandboxed <iframe>
5. Maximum output size: 300KB
6. Responsive to a minimum 360px viewport width
7. MUST include a progress indicator showing "Quest X of Y" or similar
8. MUST include a "What I Learned" summary screen shown on game completion that lists all concepts covered
9. Use CSS variables for theming with the provided palette colors
10. Game loop must be driven by pure JavaScript event listeners or requestAnimationFrame

GAME STRUCTURE:
- Use the provided GameSpec to determine game type, theme, and scenes
- Each scene maps to the mechanic specified (dialogue, quiz-combat, puzzle, exploration, cutscene)
- Implement win/fail conditions for each scene
- Progress through scenes in the specified order
- The final boss scene should be the climax

RPG GAME TEMPLATE:
- Use a canvas or CSS-based battle arena
- Player stats visible (HP, Knowledge Points)
- Each quiz-combat scene: show concept name + ask testable question, animate win/lose
- Dialogue scenes: show text, "Continue" button
- Exploration scenes: show concept definition, player "discovers" knowledge fragment
- Show a simple ASCII-art or CSS-art character for protagonist and antagonist
- Side panel or HUD showing current scene, progress, score`;

function buildUserPrompt(spec: GameSpec): string {
  return `Generate a complete HTML game from this GameSpec:

${JSON.stringify(spec, null, 2)}

Remember: Output ONLY the HTML document, starting with <!DOCTYPE html>`;
}

export async function generateGameHtml(
  spec: GameSpec,
  config: ModelConfig
): Promise<string> {
  const adapter = ADAPTERS[config.provider];
  if (!adapter) throw new Error(`Unknown provider: ${config.provider}`);

  const request: LLMRequest = {
    system: GAME_GENERATION_SYSTEM_PROMPT,
    user: buildUserPrompt(spec),
    maxTokens: 8192,
  };

  const html = await adapter.generate(request, config.apiKey, config.model);

  // Ensure it starts with <!DOCTYPE html>
  const cleaned = html.trim();
  if (!cleaned.toLowerCase().startsWith("<!doctype html") && !cleaned.toLowerCase().startsWith("<html")) {
    // Strip any accidental code fences
    const match = cleaned.match(/<!DOCTYPE html[\s\S]*/i) || cleaned.match(/<html[\s\S]*/i);
    if (match) return match[0];
    throw new Error("Model did not return valid HTML");
  }
  return cleaned;
}

export async function generateGameHtmlStream(
  spec: GameSpec,
  config: ModelConfig
): Promise<LLMStreamResponse> {
  const adapter = ADAPTERS[config.provider];
  if (!adapter) throw new Error(`Unknown provider: ${config.provider}`);

  const request: LLMRequest = {
    system: GAME_GENERATION_SYSTEM_PROMPT,
    user: buildUserPrompt(spec),
    maxTokens: 8192,
  };

  return adapter.generateStream(request, config.apiKey, config.model);
}
