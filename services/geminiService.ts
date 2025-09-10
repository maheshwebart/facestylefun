// src/services/geminiService.ts

// ---- Config ----
const apiKey = import.meta.env.VITE_API_KEY as string | undefined;
if (!apiKey) {
  // This stops the app early with a clear message (matches the console error you saw)
  throw new Error("VITE_API_KEY is not set");
}

// Choose a Gemini model you enabled in Google AI Studio
// Common options: "gemini-1.5-flash", "gemini-1.5-pro"
type ModelName = "gemini-1.5-flash" | "gemini-1.5-pro";
const MODEL: ModelName = "gemini-1.5-flash";

const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

// ---- Types (minimal) ----
type GenerateContentRequest = {
  contents: Array<{
    role?: "user" | "model";
    parts: Array<{ text?: string }>;
  }>;
  safetySettings?: unknown;
  generationConfig?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
  };
};

type GenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
  }>;
  promptFeedback?: unknown;
  error?: { message?: string };
};

// ---- Helpers ----
function extractText(res: GenerateContentResponse): string {
  const text =
    res?.candidates?.[0]?.content?.parts?.[0]?.text ??
    "";
  return text.trim();
}

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const errText = await r.text().catch(() => "");
    throw new Error(
      `Gemini API ${r.status} ${r.statusText} — ${errText.slice(0, 400)}`
    );
  }
  return (await r.json()) as T;
}

// ---- Public API ----

/**
 * Generate text from a prompt using Google Gemini (REST).
 * Example:
 *   const out = await generateText("Give me 3 hairstyle ideas for round faces");
 */
export async function generateText(
  prompt: string,
  opts?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
    model?: ModelName;
  }
): Promise<string> {
  const model = opts?.model ?? MODEL;

  const url = `${API_BASE}/models/${model}:generateContent?key=${encodeURIComponent(
    apiKey!
  )}`;

  const body: GenerateContentRequest = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: opts?.temperature ?? 0.7,
      topP: opts?.topP ?? 0.9,
      topK: opts?.topK ?? 32,
      maxOutputTokens: opts?.maxOutputTokens ?? 512,
    },
  };

  const res = await postJSON<GenerateContentResponse>(url, body);
  const text = extractText(res);
  if (!text) {
    throw new Error("Gemini returned no content. Check model access/quota.");
  }
  return text;
}
