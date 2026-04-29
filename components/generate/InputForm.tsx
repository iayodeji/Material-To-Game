"use client";

import { useState } from "react";

export type InputType = "url" | "text";

interface InputFormProps {
  onSubmit: (type: InputType, content: string, apiKey: string) => void;
  isLoading: boolean;
}

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [activeTab, setActiveTab] = useState<InputType>("url");
  const [urlValue, setUrlValue] = useState("");
  const [textValue, setTextValue] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!apiKey.trim()) {
      newErrors.apiKey = "Anthropic API key is required";
    } else if (!apiKey.startsWith("sk-ant-")) {
      newErrors.apiKey = "API key should start with sk-ant-";
    }

    if (activeTab === "url") {
      if (!urlValue.trim()) {
        newErrors.content = "Please enter a URL";
      } else {
        try {
          new URL(urlValue);
        } catch {
          newErrors.content = "Please enter a valid URL";
        }
      }
    } else {
      if (textValue.length < 200) {
        newErrors.content = `Text must be at least 200 characters (currently ${textValue.length})`;
      } else if (textValue.length > 50000) {
        newErrors.content = "Text must be at most 50,000 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const content = activeTab === "url" ? urlValue : textValue;
    onSubmit(activeTab, content, apiKey);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* API Key */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Anthropic API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-ant-..."
          className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent bg-white"
          disabled={isLoading}
        />
        {errors.apiKey && (
          <p className="mt-1 text-xs text-red-600">{errors.apiKey}</p>
        )}
        <p className="mt-1 text-xs text-stone-500">
          Your key is sent directly to Anthropic and never stored.
        </p>
      </div>

      {/* Tab switcher */}
      <div>
        <div className="flex space-x-1 bg-stone-100 p-1 rounded-lg w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === "url"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
            disabled={isLoading}
          >
            URL
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === "text"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
            disabled={isLoading}
          >
            Paste Text
          </button>
        </div>

        <div className="mt-3">
          {activeTab === "url" ? (
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://en.wikipedia.org/wiki/..."
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white"
              disabled={isLoading}
            />
          ) : (
            <div className="relative">
              <textarea
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder="Paste your article, notes, or any educational content here (min 200 characters)..."
                rows={8}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white resize-none"
                disabled={isLoading}
              />
              <span className="absolute bottom-2 right-3 text-xs text-stone-400">
                {textValue.length.toLocaleString()} / 50,000
              </span>
            </div>
          )}
          {errors.content && (
            <p className="mt-1 text-xs text-red-600">{errors.content}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-6 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm"
      >
        {isLoading ? "Generating your game…" : "Generate Game →"}
      </button>
    </form>
  );
}
