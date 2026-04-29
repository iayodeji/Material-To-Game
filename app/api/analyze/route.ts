import { NextRequest, NextResponse } from "next/server";
import { analyzeContent } from "@/lib/analyzer";
import { parseUrl } from "@/lib/parsers/url";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, content, apiKey, model } = body as {
      type: "url" | "text";
      content: string;
      apiKey: string;
      model?: string;
    };

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 });
    }

    let rawText: string;

    if (type === "url") {
      if (!content) {
        return NextResponse.json({ error: "URL is required" }, { status: 400 });
      }
      try {
        rawText = await parseUrl(content);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch URL";
        return NextResponse.json({ error: message }, { status: 422 });
      }
    } else if (type === "text") {
      if (!content || typeof content !== "string") {
        return NextResponse.json({ error: "Text content is required" }, { status: 400 });
      }
      if (content.length < 200) {
        return NextResponse.json(
          { error: "Text must be at least 200 characters" },
          { status: 400 }
        );
      }
      if (content.length > 50000) {
        return NextResponse.json(
          { error: "Text must be at most 50,000 characters" },
          { status: 400 }
        );
      }
      rawText = content;
    } else {
      return NextResponse.json(
        { error: "type must be 'url' or 'text'" },
        { status: 400 }
      );
    }

    const knowledgeGraph = await analyzeContent(rawText, apiKey, model);
    return NextResponse.json({ knowledgeGraph });
  } catch (err) {
    console.error("Analyze error:", err);
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
