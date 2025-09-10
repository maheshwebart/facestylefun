export default async (req) => {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        return new Response("Server misconfig: GEMINI_API_KEY not set", { status: 500 });
    }

    const { prompt } = await req.json();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const body = {
        contents: [{ role: "user", parts: [{ text: String(prompt ?? "") }] }],
    };

    const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await r.json();
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
};
