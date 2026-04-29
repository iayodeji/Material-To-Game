import { z } from "zod";

export const conceptSchema = z.object({
  id: z.string(),
  label: z.string(),
  definition: z.string(),
  importance: z.enum(["critical", "supporting", "context"]),
  relatedIds: z.array(z.string()),
});

export const keyFactSchema = z.object({
  id: z.string(),
  claim: z.string(),
  conceptIds: z.array(z.string()),
  isTestable: z.boolean(),
});

export const causalChainSchema = z.object({
  cause: z.string(),
  effect: z.string(),
  conceptIds: z.array(z.string()),
});

export const entitySchema = z.object({
  name: z.string(),
  type: z.enum(["person", "place", "organization", "concept", "process"]),
  role: z.string(),
});

export const knowledgeGraphSchema = z.object({
  title: z.string(),
  domain: z.string(),
  difficulty: z.enum(["introductory", "intermediate", "advanced"]),
  concepts: z.array(conceptSchema),
  keyFacts: z.array(keyFactSchema),
  causalChains: z.array(causalChainSchema),
  entities: z.array(entitySchema),
});

export type Concept = z.infer<typeof conceptSchema>;
export type KeyFact = z.infer<typeof keyFactSchema>;
export type CausalChain = z.infer<typeof causalChainSchema>;
export type Entity = z.infer<typeof entitySchema>;
export type KnowledgeGraph = z.infer<typeof knowledgeGraphSchema>;
