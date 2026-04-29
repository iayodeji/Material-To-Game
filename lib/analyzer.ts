import { knowledgeGraphSchema, KnowledgeGraph } from "@/lib/schemas";

const ANALYZER_SYSTEM_PROMPT = `You are a knowledge extraction engine. Your task is to analyze a text and extract structured knowledge into a precise JSON format.

You MUST return ONLY valid JSON that conforms exactly to the schema below. No markdown, no explanation, no code blocks — just the raw JSON object.

Schema:
{
  "title": string,           // short descriptive title for this content
  "domain": string,          // domain like "biology", "history", "computer science", "physics", etc.
  "difficulty": "introductory" | "intermediate" | "advanced",
  "concepts": [
    {
      "id": string,          // unique snake_case identifier
      "label": string,       // short human-readable name
      "definition": string,  // 1-3 sentence explanation
      "importance": "critical" | "supporting" | "context",
      "relatedIds": string[] // IDs of related concepts
    }
  ],
  "keyFacts": [
    {
      "id": string,
      "claim": string,       // a single factual claim
      "conceptIds": string[],
      "isTestable": boolean  // can this become a quiz question?
    }
  ],
  "causalChains": [
    {
      "cause": string,
      "effect": string,
      "conceptIds": string[]
    }
  ],
  "entities": [
    {
      "name": string,
      "type": "person" | "place" | "organization" | "concept" | "process",
      "role": string
    }
  ]
}

Rules:
- Include 4-12 concepts (focus on the most important ones)
- Include 5-15 key facts (only genuinely interesting or testable claims)
- Include any clear causal relationships (can be 0 if none exist)
- Include notable entities (people, places, organizations mentioned)
- All concept IDs must be unique snake_case strings
- relatedIds must reference valid concept IDs in the same response`;

export async function analyzeContent(
  text: string,
  apiKey: string,
  model: string = "claude-opus-4-5"
): Promise<KnowledgeGraph> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model,
    max_tokens: 4096,
    system: ANALYZER_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Analyze the following content and return the knowledge graph JSON:\n\n${text.slice(0, 40000)}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from analyzer");
  }

  let rawJson = content.text.trim();
  // Strip markdown code blocks if the model wraps in them
  rawJson = rawJson.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error(`Analyzer returned invalid JSON: ${rawJson.slice(0, 200)}`);
  }

  const result = knowledgeGraphSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Knowledge graph validation failed: ${result.error.message}`);
  }

  return result.data;
}
