export interface LLMRequest {
  system: string;
  user: string;
  maxTokens: number;
}

export interface LLMStreamResponse {
  stream: AsyncIterable<string>;
}

export interface ProviderAdapter {
  generateStream(request: LLMRequest, apiKey: string, model: string): Promise<LLMStreamResponse>;
  generate(request: LLMRequest, apiKey: string, model: string): Promise<string>;
}
