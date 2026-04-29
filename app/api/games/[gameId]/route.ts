import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params;

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  try {
    const { getServiceClient } = await import("@/lib/supabase");
    const sb = getServiceClient();

    const { data: game, error } = await sb
      .from("games")
      .select("id, title, html_path, game_type, theme_data")
      .eq("id", gameId)
      .single();

    if (error || !game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Fetch the HTML from storage
    const { data: fileData, error: storageErr } = await sb.storage
      .from("games")
      .download(game.html_path);

    if (storageErr || !fileData) {
      return NextResponse.json({ error: "Game file not found" }, { status: 404 });
    }

    const html = await fileData.text();

    return NextResponse.json({
      id: game.id,
      title: game.title,
      html,
      gameType: game.game_type,
    });
  } catch (err) {
    console.error("Get game error:", err);
    const message = err instanceof Error ? err.message : "Failed to load game";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
