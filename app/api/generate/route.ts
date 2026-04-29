import { NextRequest, NextResponse } from "next/server";
import { generateGameHtml } from "@/lib/model-router";
import { gameSpecSchema, GameSpec } from "@/lib/schemas";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameSpec, apiKey, model, sourceId } = body as {
      gameSpec: unknown;
      apiKey: string;
      model?: string;
      sourceId?: string;
    };

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 });
    }

    const parsed = gameSpecSchema.safeParse(gameSpec);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid game spec", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const spec: GameSpec = parsed.data;
    const html = await generateGameHtml(spec, {
      provider: "anthropic",
      apiKey,
      model: model ?? "claude-opus-4-5",
    });

    // Save to Supabase if configured
    let gameId: string | null = null;
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      try {
        const { getServiceClient } = await import("@/lib/supabase");
        const sb = getServiceClient();

        // Store HTML in Supabase Storage
        const fileName = `games/${Date.now()}-game.html`;
        await sb.storage.from("games").upload(fileName, html, {
          contentType: "text/html",
          upsert: false,
        });

        // Insert game record
        const { data: game } = await sb
          .from("games")
          .insert({
            source_id: sourceId ?? null,
            title: spec.theme.title,
            game_type: spec.gameType,
            theme_data: spec.theme,
            game_spec: spec,
            html_path: fileName,
            is_public: false,
          })
          .select("id")
          .single();

        gameId = game?.id ?? null;
      } catch (storageErr) {
        console.warn("Supabase storage failed (game will still be returned):", storageErr);
      }
    }

    return NextResponse.json({ html, gameId });
  } catch (err) {
    console.error("Generate error:", err);
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
