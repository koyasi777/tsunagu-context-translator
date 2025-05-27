export async function onRequestPost(context) {
  console.log("✅ POST /api/tts called");
  try {
    const { text, voice, apiKey } = await context.request.json();
    console.log("📦 Input parsed", { text, voice, apiKey });

    if (!apiKey || !text) {
      return new Response(JSON.stringify({ error: "Missing apiKey or text" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const payload = {
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      generationConfig: {
        responseMimeType: "audio/wav"
      },
      tools: [
        {
          speechConfig: {
            voiceConfig: {
              prebuiltVoice: {
                name: voice || "Kore"
              }
            }
          }
        }
      ]
    };

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return new Response(JSON.stringify({ error: errText }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const json = await res.json();
    const audioBase64 = json.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    return new Response(JSON.stringify({ audioBase64 }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("🔥 TTS error:", err);
    return new Response(JSON.stringify({ error: "TTS API ERROR: " + err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
