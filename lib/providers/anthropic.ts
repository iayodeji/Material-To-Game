import Anthropic from "@anthropic-ai/sdk";
import { ProviderAdapter, LLMRequest, LLMStreamResponse } from "./types";

async function* streamText(
  client: Anthropic,
  model: string,
  system: string,
  user: string,
  maxTokens: number
): AsyncIterable<string> {
  const stream = client.messages.stream({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}

export const anthropicAdapter: ProviderAdapter = {
  async generateStream(
    request: LLMRequest,
    apiKey: string,
    model: string
  ): Promise<LLMStreamResponse> {
    const client = new Anthropic({ apiKey });
    return {
      stream: streamText(client, model, request.system, request.user, request.maxTokens),
    };
  },

  async generate(request: LLMRequest, apiKey: string, model: string): Promise<string> {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model,
      max_tokens: request.maxTokens,
      system: request.system,
      messages: [{ role: "user", content: request.user }],
    });
    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected non-text response");
    return content.text;
  },
};
