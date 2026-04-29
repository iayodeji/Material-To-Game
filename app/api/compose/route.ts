import { NextRequest, NextResponse } from "next/server";
import { composeGameSpec } from "@/lib/composer";
import { knowledgeGraphSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { knowledgeGraph } = body as { knowledgeGraph: unknown };

    const parsed = knowledgeGraphSchema.safeParse(knowledgeGraph);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid knowledge graph", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const gameSpec = composeGameSpec(parsed.data);
    return NextResponse.json({ gameSpec });
  } catch (err) {
    console.error("Compose error:", err);
    const message = err instanceof Error ? err.message : "Composition failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
