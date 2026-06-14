import Anthropic from "@anthropic-ai/sdk";
import ImageKit from "imagekit";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const PAGE_TOKEN = process.env.FACEBOOK_PAGE_TOKEN;

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

async function generarFrase() {
  const categorias = ["desamor", "reflexion", "motivacional", "fe"];
  const cat = categorias[Math.floor(Math.random() * categorias.length)];
  const prompt = `Genera UNA sola frase emocional en español para publicar en Facebook.
Tema: ${cat}.
Reglas:
- Auténtica, profunda, viral
- Máximo 12 palabras
- Sin emojis
- Estilo íntimo, como si lo escribiera una persona real
- Solo devuelve la frase, sin comillas ni explicaciones`;
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 100,
    messages: [{ role: "user", content: prompt }],
  });
  return message.content[0].text.trim();
}

function generarImagenUrl(frase) {
  return imagekit.url({
    path: "/fondo.jpg",
    transformation: [
      { width: 1080, height: 1080, cropMode: "extract", focus: "center" },
      { effectBrightness: -15 },
      {
        overlay: "text",
        overlayText: frase,
        overlayTextFontSize: 52,
        overlayTextColor: "F0E8D7",
        overlayTextWidth: 820,
        overlayTextAlign: "center",
        overlayX: "mid",
        overlayY: "mid",
      },
      {
        overlay: "text",
        overlayText: "A  L A S  3  A M",
        overlayTextFontSize: 18,
        overlayTextColor: "ffffff",
        overlayAlpha: 25,
        overlayX: "mid",
        overlayY: "mid",
        overlayYType: "pixels",
        overlayYValue: 200,
      },
    ],
  });
}

async function publicarEnFacebook(imageUrl, frase) {
  const res = await fetch(`https://graph.facebook.com/v19.0/${PAGE_ID}/photos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: imageUrl,
      caption: frase,
      access_token: PAGE_TOKEN,
    }),
  });
  return await res.json();
}

export default async function handler(req, res) {
  const { secret } = req.query;
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "No autorizado" });
  }
  try {
    const frase = await generarFrase();
    const imageUrl = generarImagenUrl(frase);
    const resultado = await publicarEnFacebook(imageUrl, frase);
    if (resultado.error) {
      return res.status(500).json({ error: resultado.error.message, url: imageUrl });
    }
    return res.status(200).json({ ok: true, frase, post_id: resultado.id, url: imageUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
