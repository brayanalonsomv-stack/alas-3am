import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const PAGE_TOKEN = process.env.FACEBOOK_PAGE_TOKEN;
const BG_URL = "https://ik.imagekit.io/6cri5aneh/fondo.jpg";

async function generarFrase() {
  const categorias = ["desamor", "reflexion", "motivacional", "fe"];
  const cat = categorias[Math.floor(Math.random() * categorias.length)];
  const prompt = `Genera UNA sola frase emocional en español para publicar en Facebook.
Tema: ${cat}.
Reglas:
- Auténtica, profunda, viral
- Máximo 10 palabras
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
  const texto = encodeURIComponent(frase);
  const imagen = encodeURIComponent(BG_URL);
  return `https://textoverimg.com/wp-json/shakels/v1/image?text=${texto}&image=${imagen}&fontSize=42px&fontColor=%23F0E8D7&x_align=center&y_align=center&textAlign=center&margin=80&overlay_color=00000060`;
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
