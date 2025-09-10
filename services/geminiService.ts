--- a / services / geminiService.ts
+++ b / services / geminiService.ts
@@
-export async function generateText(prompt: string): Promise<string> {
  -  // OLD: likely calling Google directly with import.meta.env.* (exposes key)
    -  // Replace with a call to Netlify Function
    -  const apiKey = import.meta.env.VITE_API_KEY as string | undefined;
  -  if (!apiKey) {
    -    throw new Error("VITE_API_KEY is not set");
    -  }
  -  // ... direct fetch to Google ...
    -}
+export async function generateText(prompt: string): Promise<string> {
  +  const res = await fetch("/.netlify/functions/gemini", {
+ method: "POST",
    +    headers: { "Content-Type": "application/json" },
    +    body: JSON.stringify({ prompt }),
    +  });
+  if (!res.ok) {
  +    throw new Error(await res.text());
  +  }
+  const { data } = await res.json();
+  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
+  if (!text) {
  +    throw new Error("Empty response from Gemini");
  +  }
+  return text.trim();
+}
