import { z } from "zod";

export const sceneSchema = z.object({
  id: z.string(),
  name: z.string(),
  conceptId: z.string(),
  mechanic: z.enum(["dialogue", "quiz-combat", "puzzle", "exploration", "cutscene"]),
  content: z.string(),
  winCondition: z.string(),
  failCondition: z.string(),
});

export const gameSpecSchema = z.object({
  gameType: z.enum(["rpg", "tower-defense", "puzzle", "platformer", "strategy", "simulation"]),
  theme: z.object({
    title: z.string(),
    setting: z.string(),
    palette: z.array(z.string()).length(3),
    protagonist: z.string(),
    antagonist: z.string(),
  }),
  scenes: z.array(sceneSchema),
  progression: z.object({
    order: z.array(z.string()),
    finalBoss: z.string(),
  }),
  assets: z.object({
    cssTheme: z.string(),
    characterSprites: z.string(),
    soundDesign: z.string(),
  }),
});

export type Scene = z.infer<typeof sceneSchema>;
export type GameSpec = z.infer<typeof gameSpecSchema>;
