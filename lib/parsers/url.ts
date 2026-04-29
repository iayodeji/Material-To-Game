import * as cheerio from "cheerio";

const STRIP_SELECTORS = [
  "nav",
  "header",
  "footer",
  "aside",
  "script",
  "style",
  "noscript",
  "[class*='cookie']",
  "[class*='banner']",
  "[class*='popup']",
  "[class*='modal']",
  "[class*='ad-']",
  "[class*='ads-']",
  "[class*='advertisement']",
  "[id*='cookie']",
  "[id*='banner']",
  "[id*='ad-']",
  ".sidebar",
  ".menu",
  ".navigation",
  ".nav",
];

const PAYWALL_SIGNALS = [
  "subscribe to continue",
  "subscribe to read",
  "create a free account",
  "sign in to read",
  "this article is for subscribers",
  "unlock this article",
  "premium content",
];

export async function parseUrl(url: string): Promise<string> {
  // Validate URL format
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error("Invalid URL format");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are supported");
  }

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; QuestForgeBot/1.0; +https://questforge.app)",
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  }).catch((err: unknown) => {
    const isTimeout =
      (err instanceof DOMException && err.name === "TimeoutError") ||
      (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError"));
    if (isTimeout) {
      throw new Error("Request timeout: URL took longer than 15 seconds to load");
    }
    throw err;
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: HTTP ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove noise elements
  STRIP_SELECTORS.forEach((selector) => {
    $(selector).remove();
  });

  // Try to find the main content area
  const mainContent =
    $("article").first().text() ||
    $("main").first().text() ||
    $('[role="main"]').first().text() ||
    $(".post-content, .article-content, .entry-content, .content").first().text() ||
    $("body").text();

  const text = mainContent.replace(/\s+/g, " ").trim();

  if (text.length < 200) {
    throw new Error("Not enough content found at this URL");
  }

  // Check for paywall signals
  const lowerText = text.toLowerCase();
  for (const signal of PAYWALL_SIGNALS) {
    if (lowerText.includes(signal)) {
      throw new Error(
        "This page appears to be behind a paywall. Please paste the text content directly."
      );
    }
  }

  return text;
}
