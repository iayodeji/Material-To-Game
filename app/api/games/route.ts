import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return NextResponse.json({ games: [] });
    }

    const { getServiceClient } = await import("@/lib/supabase");
    const sb = getServiceClient();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 100);
    const offset = Number(searchParams.get("offset") ?? "0");

    const { data: games, error } = await sb
      .from("games")
      .select("id, title, game_type, theme_data, created_at, is_public")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({ games: games ?? [] });
  } catch (err) {
    console.error("Games list error:", err);
    const message = err instanceof Error ? err.message : "Failed to list games";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
